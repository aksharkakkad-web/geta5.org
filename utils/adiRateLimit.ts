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
//
// 2026-05-06: Adi cap soft-capped from 30 → 10 alongside the FRQ AI grader
// pause. The grader pause shifts more demand onto Adi for explanations, so
// the lower per-user ceiling keeps total spend bounded while still leaving
// every user real daily capacity. Restore to 30 when the FRQ grader returns.
export const ADI_DAILY_LIMIT = 10
export const FRQ_DAILY_LIMIT = 3

// Realistic per-call OpenAI cost in cents. These charge against the global
// safety meter (GLOBAL_DAILY_BUDGET_CENTS). Update if model or prompt size
// changes — undercounting here is what let $2 of real spend through against a
// $1 cap previously.
//
// 2026-05-02: FRQ costs realigned after May-1 single-pass simplification.
// Most FRQ types route to gpt-4o-mini (~0.15¢ real cost); only DBQ/LEQ/essay
// tier routes to gpt-4o (~2.5¢). Old 10¢/15¢ constants were calibrated against
// the deprecated multi-pass gpt-4o pipeline and were inflating the global
// meter ~5-60x, locking out all non-founder users.
export const ADI_COST_CENTS = 0.1            // gpt-4o-mini, ~2k in / 500 out ≈ $0.001
export const FRQ_MODERATE_COST_CENTS = 3     // blended single-pass mini/4o ≈ $0.01-0.03
export const FRQ_STRICT_COST_CENTS = 4       // strict no longer adds a 2nd pass

// Global cost cap intentionally disabled — per-user limits + IP burst
// protection are the only enforcement. The constant is retained at a sentinel
// value for any callers/tooling that still import it; isGlobalOverBudget is
// no longer wired into the hot path. We still increment the GLOBAL usage row
// so we keep aggregate analytics in adi_usage.
export const GLOBAL_DAILY_BUDGET_CENTS = Number.POSITIVE_INFINITY

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

// Allowlist of user UUIDs that bypass all rate limits (per-user, global, and
// cost accounting). Set FOUNDER_USER_IDS to a comma-separated list of
// Supabase auth UUIDs in Vercel + .env.local. Empty/unset = no bypass.
export function isFounder(userId: string): boolean {
  const raw = process.env.FOUNDER_USER_IDS
  if (!raw) return false
  return raw.split(',').map(s => s.trim()).filter(Boolean).includes(userId)
}

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]
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

  if (isFounder(userId)) {
    return { allowed: true, current: 0, limit: ADI_DAILY_LIMIT, resetAtEST: getResetTimeEST() }
  }

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

  if (isFounder(userId)) {
    return { allowed: true, current: 0, limit: FRQ_DAILY_LIMIT, resetAtEST: getResetTimeEST() }
  }

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
