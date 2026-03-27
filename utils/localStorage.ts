// utils/localStorage.ts
const isClient = typeof window !== 'undefined'

export function lsGet<T>(key: string, fallback: T): T {
  if (!isClient) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function lsSet<T>(key: string, value: T): void {
  if (!isClient) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function lsClear(key: string): void {
  if (!isClient) return
  try {
    window.localStorage.removeItem(key)
  } catch {}
}

// Typed key helpers
export const LS_KEYS = {
  streak: 'ascendly_streak',
  mastery: (subject: string, unit: string) => `ascendly_mastery_${subject}_${unit}`,
  score: (subject: string) => `ascendly_score_${subject}`,
  totalQuestions: 'ascendly_total_questions',
  activeSubject: 'ascendly_active_subject',
  drillDraft: (subject: string) => `ascendly_draft_drill_${subject}`,
  mcqDraft: (subject: string) => `ascendly_draft_mcq_${subject}`,
  testDraft: (subject: string) => `ascendly_draft_test_${subject}`,
} as const
