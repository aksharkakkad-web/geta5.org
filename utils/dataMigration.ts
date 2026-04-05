// utils/dataMigration.ts
// One-time migration of localStorage data to Supabase on first sign-in.

import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'

interface StreakData {
  count: number
  lastPracticeDate: string
}

export async function migrateLocalStorageToSupabase(): Promise<void> {
  if (lsGet<boolean>(LS_KEYS.migrated, false)) return
  if (typeof window === 'undefined') return

  const mastery: { subject: string; unit: string; drillAccuracy: number; mcqAccuracy: number; totalAttempts: number }[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith('ascendly_mastery_')) continue

    const raw = key.replace('ascendly_mastery_', '')
    const unitSep = raw.lastIndexOf('_')
    if (unitSep === -1) continue

    const subject = raw.slice(0, unitSep)
    const unit = raw.slice(unitSep + 1)

    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}')
      mastery.push({
        subject,
        unit,
        drillAccuracy: data.drillAccuracy ?? 0,
        mcqAccuracy: data.mcqAccuracy ?? 0,
        totalAttempts: data.totalAttempts ?? 0,
      })
    } catch {
      // Skip malformed entries
    }
  }

  const totalQuestions = lsGet<number>(LS_KEYS.totalQuestions, 0)
  const streak = lsGet<StreakData | null>(LS_KEYS.streak, null)

  try {
    const res = await fetch('/api/user/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mastery,
        totalQuestions,
        streakCount: streak?.count ?? 0,
        streakLastDate: streak?.lastPracticeDate ?? null,
      }),
    })

    if (res.ok) {
      lsSet(LS_KEYS.migrated, true)
    }
  } catch {
    // Migration failed — will retry on next sign-in
  }
}
