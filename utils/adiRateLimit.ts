import { createClient } from '@supabase/supabase-js'
import type { GradingStrictness } from './frqSession'

// Use service role key for server-side writes (bypasses RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

// Per-user daily caps, kept in separate buckets so a heavy FRQ user still has
// Adi capacity (and vice versa). Adi is ~100x cheaper per call than FRQ, so
// pooling them in a single bucket would let FRQ users starve Adi.
export const ADI_DAILY_LIMIT = 30
export const FRQ_DAILY_LIMIT = 3

// Realistic per-call OpenAI cost in cents. These charge against the global
// safety meter (GLOBAL_DAILY_BUDGET_CENTS). Update if model or prompt size
// changes — undercounting here is what let $2 of real spend through against a
// $1 cap previously.
export const ADI_COST_CENTS = 0.1            // gpt-4o-mini, ~2k in / 500 out ≈ $0.001
export const FRQ_MODERATE_COST_CENTS = 10    // gpt-4o multi-pass ≈ $0.10
export const FRQ_STRICT_COST_CENTS = 15      // adds an auditor pass ≈ $0.15

// Global cost cap: emergency brake only. Per-user limits should keep aggregate
// well below this on any normal day. If this fires, something is going wrong
// (abuse, retry loop, or unexpected scale).
export const GLOBAL_DAILY_BUDGET_CENTS = 800 // $8

type CheckResult = {
  allowed: boolean
  reason?: 'user_limit' | 'global_limit'
  current: number
  limit: number
  resetAtEST: string
}

// Per-bucket fast-deny caches (authoritative check is the DB via atomic RPC)
const adiCache = new Map<string, { count: number; date: string }>()
const frqCache = new Map<string, { count: number; date: string }>()

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]
}

async function isGlobalOverBudget(today: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('adi_usage')
    .select('estimated_cost_cents')
    .eq('user_id', 'GLOBAL')
    .eq('date', today)
    .single()
  return !!data && data.estimated_cost_cents >= GLOBAL_DAILY_BUDGET_CENTS
}

function fireGlobalIncrement(costCents: number, today: string): void {
  // Fire-and-forget — don't block the request on the global meter update.
  const supabase = getSupabaseAdmin()
  supabase.rpc('increment_global_adi_usage', {
    p_date: today,
    p_cost_cents: costCents,
  }).then(({ error }) => { if (error) console.error('global usage increment failed:', error) })
}

export async function checkAndIncrementAdiUsage(userId: string): Promise<CheckResult> {
  const today = todayUTC()
  const supabase = getSupabaseAdmin()

  const cached = adiCache.get(userId)
  if (cached && cached.date === today && cached.count >= ADI_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: 'user_limit',
      current: cached.count,
      limit: ADI_DAILY_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  if (await isGlobalOverBudget(today)) {
    return {
      allowed: false,
      reason: 'global_limit',
      current: cached?.count ?? 0,
      limit: ADI_DAILY_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  const { data: newCount, error: rpcError } = await supabase.rpc('check_and_increment_adi_usage', {
    p_user_id: userId,
    p_date: today,
    p_cost_cents: ADI_COST_CENTS,
    p_limit: ADI_DAILY_LIMIT,
  })

  if (rpcError) {
    // Fail open — IP burst protection in the route handler is still active.
    console.error('adi_usage RPC failed:', rpcError)
    return { allowed: true, current: 0, limit: ADI_DAILY_LIMIT, resetAtEST: getResetTimeEST() }
  }

  if (newCount === -1) {
    adiCache.set(userId, { count: ADI_DAILY_LIMIT, date: today })
    return {
      allowed: false,
      reason: 'user_limit',
      current: ADI_DAILY_LIMIT,
      limit: ADI_DAILY_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  adiCache.set(userId, { count: newCount, date: today })
  fireGlobalIncrement(ADI_COST_CENTS, today)

  return {
    allowed: true,
    current: newCount,
    limit: ADI_DAILY_LIMIT,
    resetAtEST: getResetTimeEST(),
  }
}

export async function checkAndIncrementFRQUsage(
  userId: string,
  strictness: GradingStrictness,
): Promise<CheckResult> {
  const today = todayUTC()
  const supabase = getSupabaseAdmin()
  const cost = strictness === 'strict' ? FRQ_STRICT_COST_CENTS : FRQ_MODERATE_COST_CENTS

  const cached = frqCache.get(userId)
  if (cached && cached.date === today && cached.count >= FRQ_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: 'user_limit',
      current: cached.count,
      limit: FRQ_DAILY_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  if (await isGlobalOverBudget(today)) {
    return {
      allowed: false,
      reason: 'global_limit',
      current: cached?.count ?? 0,
      limit: FRQ_DAILY_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  const { data: newCount, error: rpcError } = await supabase.rpc('check_and_increment_frq_usage', {
    p_user_id: userId,
    p_date: today,
    p_cost_cents: cost,
    p_limit: FRQ_DAILY_LIMIT,
  })

  if (rpcError) {
    console.error('frq_usage RPC failed:', rpcError)
    return { allowed: true, current: 0, limit: FRQ_DAILY_LIMIT, resetAtEST: getResetTimeEST() }
  }

  if (newCount === -1) {
    frqCache.set(userId, { count: FRQ_DAILY_LIMIT, date: today })
    return {
      allowed: false,
      reason: 'user_limit',
      current: FRQ_DAILY_LIMIT,
      limit: FRQ_DAILY_LIMIT,
      resetAtEST: getResetTimeEST(),
    }
  }

  frqCache.set(userId, { count: newCount, date: today })
  fireGlobalIncrement(cost, today)

  return {
    allowed: true,
    current: newCount,
    limit: FRQ_DAILY_LIMIT,
    resetAtEST: getResetTimeEST(),
  }
}

export async function getUserUsageToday(userId: string): Promise<{
  adi: { count: number; limit: number }
  frq: { count: number; limit: number }
  resetAtEST: string
}> {
  const today = todayUTC()
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('adi_usage')
    .select('call_count, frq_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const adiCount = data?.call_count ?? 0
  const frqCount = data?.frq_count ?? 0
  adiCache.set(userId, { count: adiCount, date: today })
  frqCache.set(userId, { count: frqCount, date: today })

  return {
    adi: { count: adiCount, limit: ADI_DAILY_LIMIT },
    frq: { count: frqCount, limit: FRQ_DAILY_LIMIT },
    resetAtEST: getResetTimeEST(),
  }
}

function getResetTimeEST(): string {
  const now = new Date()
  const tomorrowMidnightUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0,
  ))
  const estOffset = -5 * 60 * 60 * 1000
  const estMidnight = new Date(tomorrowMidnightUTC.getTime() + estOffset)
  const hours = estMidnight.getUTCHours()
  const minutes = estMidnight.getUTCMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm} EST`
}
