import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side writes (bypasses RLS)
// Falls back to anon key if service role not configured
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export const DAILY_USER_LIMIT = 30
export const GLOBAL_DAILY_BUDGET_CENTS = 150 // $1.50
export const COST_PER_CALL_CENTS = 0.1 // ~$0.001 per call = 0.1 cents

// In-memory cache: userId -> { count, date }
const cache = new Map<string, { count: number; date: string }>()

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]
}

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean
  reason?: 'user_limit' | 'global_limit'
  current: number
  limit: number
  resetAtEST: string
}> {
  const today = todayUTC()
  const supabase = getSupabaseAdmin()

  // --- Check global safety valve first ---
  const { data: globalRow } = await supabase
    .from('adi_usage')
    .select('estimated_cost_cents')
    .eq('user_id', 'GLOBAL')
    .eq('date', today)
    .single()

  if (globalRow && globalRow.estimated_cost_cents >= GLOBAL_DAILY_BUDGET_CENTS) {
    return { allowed: false, reason: 'global_limit', current: DAILY_USER_LIMIT, limit: DAILY_USER_LIMIT, resetAtEST: getResetTimeEST() }
  }

  // --- Check per-user limit (cache first) ---
  const cached = cache.get(userId)
  let currentCount = 0

  if (cached && cached.date === today) {
    currentCount = cached.count
  } else {
    // Cold start or new day — fetch from Supabase
    const { data: userRow } = await supabase
      .from('adi_usage')
      .select('call_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    currentCount = userRow?.call_count ?? 0
    cache.set(userId, { count: currentCount, date: today })
  }

  if (currentCount >= DAILY_USER_LIMIT) {
    return {
      allowed: false,
      reason: 'user_limit',
      current: currentCount,
      limit: DAILY_USER_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  // --- Allowed — increment and persist (fail closed) ---
  const newCount = currentCount + 1
  cache.set(userId, { count: newCount, date: today })

  // Upsert user row — await to ensure persistence
  const { error: upsertError } = await supabase.from('adi_usage').upsert(
    { user_id: userId, date: today, call_count: newCount, estimated_cost_cents: newCount * COST_PER_CALL_CENTS, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,date' }
  )

  if (upsertError) {
    // Fail closed — if we can't record usage, deny the request
    console.error('adi_usage upsert failed:', upsertError)
    cache.delete(userId) // clear stale cache entry
    return { allowed: false, reason: 'user_limit' as const, current: currentCount, limit: DAILY_USER_LIMIT, resetAtEST: getResetTimeEST() }
  }

  // Increment global row — best-effort (user row is the primary control)
  supabase.rpc('increment_global_adi_usage', {
    p_date: today,
    p_cost_cents: COST_PER_CALL_CENTS,
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
  // Next midnight UTC converted to EST display
  // EST = UTC-5, EDT = UTC-4. We hardcode the display as "12:00 AM EST"
  // since midnight UTC = 7:00 PM EST (winter) / 8:00 PM EDT (summer)
  // More user-friendly to just say "midnight EST" = 5:00 AM UTC
  const now = new Date()
  const tomorrowMidnightUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ))
  // Convert to EST (UTC-5) for display
  const estOffset = -5 * 60 * 60 * 1000
  const estMidnight = new Date(tomorrowMidnightUTC.getTime() + estOffset)
  const hours = estMidnight.getUTCHours()
  const minutes = estMidnight.getUTCMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm} EST`
}
