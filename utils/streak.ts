// utils/streak.ts
import { lsGet, lsSet, LS_KEYS } from './localStorage'

interface StreakData {
  count: number
  lastPracticeDate: string // ISO date string YYYY-MM-DD
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function getStreak(): number {
  const data = lsGet<StreakData | null>(LS_KEYS.streak, null)
  if (!data) return 0
  const today = todayISO()
  const yesterday = yesterdayISO()
  // Active streak: practiced today or yesterday
  if (data.lastPracticeDate === today || data.lastPracticeDate === yesterday) {
    return data.count
  }
  return 0
}

export function recordPractice(): number {
  const data = lsGet<StreakData | null>(LS_KEYS.streak, null)
  const today = todayISO()
  const yesterday = yesterdayISO()

  if (!data) {
    lsSet(LS_KEYS.streak, { count: 1, lastPracticeDate: today })
    return 1
  }

  if (data.lastPracticeDate === today) {
    // Already practiced today — no change
    return data.count
  }

  if (data.lastPracticeDate === yesterday) {
    // Extending streak
    const newCount = data.count + 1
    lsSet(LS_KEYS.streak, { count: newCount, lastPracticeDate: today })
    return newCount
  }

  // Streak broken — reset
  lsSet(LS_KEYS.streak, { count: 1, lastPracticeDate: today })
  return 1
}
