// utils/persistence.ts
// Dual-write layer: always writes localStorage, also fires to Supabase if authenticated.
// Supabase writes are fire-and-forget — never block UI.

import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'

interface MasteryData {
  drillAccuracy: number
  mcqAccuracy: number
  totalAttempts: number
}

export interface StatsPayload {
  totalQuestions: number
  streakCount: number
  streakLastDate: string | null
  drillCount: number
  mcqCount: number
  frqCount: number
  drillCorrect: number
  mcqCorrect: number
  totalSeconds: number
}

let _isAuthenticated = false

export function setAuthState(authenticated: boolean): void {
  _isAuthenticated = authenticated
}

export function saveProgress(subject: string, unit: string, data: MasteryData): void {
  lsSet(LS_KEYS.mastery(subject, unit), data)

  if (_isAuthenticated) {
    fetch('/api/user/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, unit, ...data }),
      keepalive: true,
    }).catch(() => {})
  }
}

/** Read all stat counters from localStorage into a single payload. */
export function readStatsFromLS(): StatsPayload {
  const streak = lsGet<{ count: number; lastPracticeDate: string } | null>(LS_KEYS.streak, null)
  return {
    totalQuestions: lsGet<number>(LS_KEYS.totalQuestions, 0),
    streakCount: streak?.count ?? 0,
    streakLastDate: streak?.lastPracticeDate ?? null,
    drillCount: lsGet<number>(LS_KEYS.drillCount, 0),
    mcqCount: lsGet<number>(LS_KEYS.mcqCount, 0),
    frqCount: lsGet<number>(LS_KEYS.frqCount, 0),
    drillCorrect: lsGet<number>(LS_KEYS.drillCorrect, 0),
    mcqCorrect: lsGet<number>(LS_KEYS.mcqCorrect, 0),
    totalSeconds: lsGet<number>(LS_KEYS.totalSeconds, 0),
  }
}

let _lastSyncStatsAt = 0
const SYNC_STATS_MIN_INTERVAL = 5_000 // floor: never more than 1 stats POST per 5s

/** Fire-and-forget sync of current localStorage stats to Supabase.
 *  Debounced — callers from different code paths may overlap (tab close +
 *  visibility hidden + session complete). */
export function syncStats(): void {
  if (!_isAuthenticated) return
  const now = Date.now()
  if (now - _lastSyncStatsAt < SYNC_STATS_MIN_INTERVAL) return
  _lastSyncStatsAt = now

  const payload = readStatsFromLS()
  fetch('/api/user/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    // keepalive lets the POST finish even if the tab is closing —
    // critical for the "answered 1 question then closed the tab" case.
    keepalive: true,
  }).catch(() => {})
}

let _lastSyncFromSupabaseAt = 0
const SYNC_FROM_SUPABASE_MIN_INTERVAL = 10_000 // debounce: auth init + strict mode + onAuthStateChange can triple-fire

export function syncFromSupabase(): void {
  if (!_isAuthenticated) return

  const now = Date.now()
  if (now - _lastSyncFromSupabaseAt < SYNC_FROM_SUPABASE_MIN_INTERVAL) return
  _lastSyncFromSupabaseAt = now

  fetch('/api/user/sync')
    .then(res => res.json())
    .then(data => {
      if (data.stats) {
        lsSet(LS_KEYS.totalQuestions, data.stats.total_questions)
        if (data.stats.drill_count != null) lsSet(LS_KEYS.drillCount, data.stats.drill_count)
        if (data.stats.mcq_count != null) lsSet(LS_KEYS.mcqCount, data.stats.mcq_count)
        if (data.stats.frq_count != null) lsSet(LS_KEYS.frqCount, data.stats.frq_count)
        if (data.stats.drill_correct != null) lsSet(LS_KEYS.drillCorrect, data.stats.drill_correct)
        if (data.stats.mcq_correct != null) lsSet(LS_KEYS.mcqCorrect, data.stats.mcq_correct)
        if (data.stats.total_seconds != null) lsSet(LS_KEYS.totalSeconds, data.stats.total_seconds)
        if (data.stats.streak_count > 0) {
          lsSet(LS_KEYS.streak, {
            count: data.stats.streak_count,
            lastPracticeDate: data.stats.streak_last_date,
          })
        }
      }

      if (data.progress) {
        for (const row of data.progress) {
          const existing = lsGet(LS_KEYS.mastery(row.subject, row.unit), {
            drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0,
          })
          lsSet(LS_KEYS.mastery(row.subject, row.unit), {
            drillAccuracy: Math.max(row.drill_accuracy, existing.drillAccuracy),
            mcqAccuracy: Math.max(row.mcq_accuracy, existing.mcqAccuracy),
            totalAttempts: Math.max(row.total_attempts, existing.totalAttempts),
          })
        }
      }
    })
    .catch(() => {})
}
