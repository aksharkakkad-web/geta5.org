import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side writes (bypasses RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export const DAILY_USER_LIMIT = 20
export const GLOBAL_DAILY_BUDGET_CENTS = 100 // $1.00
export const COST_PER_CALL_CENTS = 0.1 // ~$0.001 per call = 0.1 cents

// In-memory cache: fast-deny optimization (authoritative check is the DB via atomic RPC)
const cache = new Map<string, { count: number; date: string }>()

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]
}

export async function checkAndIncrementUsage(userId: string, callCost: number = 1): Promise<{
  allowed: boolean
  reason?: 'user_limit' | 'global_limit'
  current: number
  limit: number
  resetAtEST: string
}> {
  const today = todayUTC()
  const supabase = getSupabaseAdmin()

  // --- Fast-deny from cache (avoids DB round-trip for already-limited users) ---
  const cached = cache.get(userId)
  if (cached && cached.date === today && cached.count + callCost > DAILY_USER_LIMIT) {
    return {
      allowed: false,
      reason: 'user_limit',
      current: cached.count,
      limit: DAILY_USER_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  // --- Check global safety valve ---
  const { data: globalRow } = await supabase
    .from('adi_usage')
    .select('estimated_cost_cents')
    .eq('user_id', 'GLOBAL')
    .eq('date', today)
    .single()

  if (globalRow && globalRow.estimated_cost_cents >= GLOBAL_DAILY_BUDGET_CENTS) {
    return { allowed: false, reason: 'global_limit', current: DAILY_USER_LIMIT, limit: DAILY_USER_LIMIT, resetAtEST: getResetTimeEST() }
  }

  // --- Atomic check-and-increment via RPC (race-safe) ---
  // For multi-call operations (e.g., FRQ grading = 2 calls), we increment by callCost
  const { data: newCount, error: rpcError } = await supabase.rpc('check_and_increment_adi_usage', {
    p_user_id: userId,
    p_date: today,
    p_cost_cents: COST_PER_CALL_CENTS * callCost,
    p_limit: DAILY_USER_LIMIT,
  })

  if (rpcError) {
    // Fail open — if DB is unreachable, let the user through.
    // IP burst protection in the route handler is still active as a backstop.
    console.error('adi_usage RPC failed:', rpcError)
    return { allowed: true, current: 0, limit: DAILY_USER_LIMIT, resetAtEST: getResetTimeEST() }
  }

  // RPC returns -1 when already at/over the limit
  if (newCount === -1) {
    cache.set(userId, { count: DAILY_USER_LIMIT, date: today })
    return {
      allowed: false,
      reason: 'user_limit',
      current: DAILY_USER_LIMIT,
      limit: DAILY_USER_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  // Success — update cache and fire global increment
  cache.set(userId, { count: newCount, date: today })

  supabase.rpc('increment_global_adi_usage', {
    p_date: today,
    p_cost_cents: COST_PER_CALL_CENTS * callCost,
  }).then(({ error }) => { if (error) console.error('global adi_usage increment failed:', error) })

  return {
    allowed: true,
    current: newCount,
    limit: DAILY_USER_LIMIT,
    resetAtEST: getResetTimeEST(),
  }
}

export async function getUserUsageToday(userId: string): Promise<{ count: number; limit: number; resetAtEST: string }> {
  const today = todayUTC()
  const cached = cache.get(userId)

  if (cached && cached.date === today) {
    return { count: cached.count, limit: DAILY_USER_LIMIT, resetAtEST: getResetTimeEST() }
  }

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('adi_usage')
    .select('call_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const count = data?.call_count ?? 0
  cache.set(userId, { count, date: today })
  return { count, limit: DAILY_USER_LIMIT, resetAtEST: getResetTimeEST() }
}

function getResetTimeEST(): string {
  const now = new Date()
  const tomorrowMidnightUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ))
  const estOffset = -5 * 60 * 60 * 1000
  const estMidnight = new Date(tomorrowMidnightUTC.getTime() + estOffset)
  const hours = estMidnight.getUTCHours()
  const minutes = estMidnight.getUTCMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm} EST`
}
