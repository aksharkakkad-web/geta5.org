// utils/persistence.ts
// Dual-write layer: always writes localStorage, also fires to Supabase if authenticated.
// Supabase writes are fire-and-forget — never block UI.

import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'

interface MasteryData {
  drillAccuracy: number
  mcqAccuracy: number
  totalAttempts: number
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
    }).catch(() => {})
  }
}

export function saveStats(
  totalQuestions: number,
  streakCount: number,
  streakLastDate: string | null,
  drillCount?: number,
  mcqCount?: number,
  frqCount?: number,
): void {
  if (_isAuthenticated) {
    fetch('/api/user/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalQuestions,
        streakCount,
        streakLastDate,
        drillCount: drillCount ?? 0,
        mcqCount: mcqCount ?? 0,
        frqCount: frqCount ?? 0,
      }),
    }).catch(() => {})
  }
}

export function syncFromSupabase(): void {
  if (!_isAuthenticated) return

  fetch('/api/user/sync')
    .then(res => res.json())
    .then(data => {
      if (data.stats) {
        lsSet(LS_KEYS.totalQuestions, data.stats.total_questions)
        if (data.stats.drill_count != null) lsSet(LS_KEYS.drillCount, data.stats.drill_count)
        if (data.stats.mcq_count != null) lsSet(LS_KEYS.mcqCount, data.stats.mcq_count)
        if (data.stats.frq_count != null) lsSet(LS_KEYS.frqCount, data.stats.frq_count)
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
