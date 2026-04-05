// utils/testSession.ts
// Practice test session logic: types, composition, scoring, completion handler

import { MCQ } from '@/utils/mcqSession'
import { lsGet, lsSet, lsClear, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'
import { saveStats } from '@/utils/persistence'
import { projectScore } from '@/utils/scoring'
import { scramble } from '@/utils/scramble'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TestAnswer {
  selectedChoiceId: string
  isCorrect: boolean
}

export interface TestSessionState {
  questions: MCQ[]
  answers: Record<string, TestAnswer>    // keyed by question id
  flagged: Record<string, boolean>        // keyed by question id
  currentIndex: number
  timed: boolean
  showTimer: boolean
  durationSeconds: number
  subjectSlug: string
  startedAt?: number                     // Date.now() when test began
}

export interface PerUnitResult {
  unitNumber: string
  unitName: string
  correct: number
  total: number
  accuracy: number
}

// ─── Draft Persistence ────────────────────────────────────────────────────────

export interface TestDraft {
  questions: MCQ[]
  answers: Record<string, TestAnswer>
  flagged: Record<string, boolean>
  currentIndex: number
  timed: boolean
  showTimer: boolean
  remainingSeconds: number   // seconds left on timer at time of save; equals durationSeconds for untimed tests
  subjectSlug: string
  savedAt: number
}

export function saveTestDraft(draft: TestDraft): void {
  lsSet(LS_KEYS.testDraft(draft.subjectSlug), draft)
}

export function loadTestDraft(subject: string): TestDraft | null {
  return lsGet<TestDraft | null>(LS_KEYS.testDraft(subject), null)
}

export function clearTestDraft(subject: string): void {
  lsClear(LS_KEYS.testDraft(subject))
}

// ─── composeTest ─────────────────────────────────────────────────────────────

/**
 * Builds a practice test from a map of MCQ arrays keyed by unit.
 *
 * Algorithm:
 *   1. Base quota = floor(targetCount / unitCount), remainder distributed round-robin.
 *   2. Shuffle each unit's pool first, take up to quota.
 *   3. If any unit contributes fewer than its quota, backfill from remaining pool.
 *   4. Final scramble of entire array.
 *
 * Handles gracefully:
 *   - Units with fewer questions than their quota (Pitfall 6 from research)
 *   - Total available < targetCount (returns all available)
 *   - Empty input (returns [])
 */
export function composeTest(
  questionsByUnit: Map<string, MCQ[]>,
  targetCount: number
): MCQ[] {
  if (questionsByUnit.size === 0) return []

  const units = Array.from(questionsByUnit.keys())
  const unitCount = units.length
  const baseQuota = Math.floor(targetCount / unitCount)
  const remainder = targetCount % unitCount

  // Assign quotas: first `remainder` units get baseQuota + 1
  const quotas = new Map<string, number>()
  units.forEach((unit, i) => {
    quotas.set(unit, baseQuota + (i < remainder ? 1 : 0))
  })

  // Shuffle each unit's pool and take up to quota
  const selected: MCQ[] = []
  const leftoverPool: MCQ[] = []

  units.forEach(unit => {
    const pool = scramble(questionsByUnit.get(unit) ?? [])
    const quota = quotas.get(unit) ?? baseQuota
    const taken = pool.slice(0, quota)
    selected.push(...taken)
    // Remaining questions go to leftover pool for backfill
    leftoverPool.push(...pool.slice(quota))
  })

  // Backfill if we got fewer than targetCount (units had less than quota)
  const deficit = targetCount - selected.length
  if (deficit > 0 && leftoverPool.length > 0) {
    const backfill = scramble(leftoverPool).slice(0, deficit)
    selected.push(...backfill)
  }

  // Final shuffle of entire selected array
  return scramble(selected)
}

// ─── computePerUnitAccuracy ───────────────────────────────────────────────────

/**
 * Groups questions by unit and computes accuracy stats per unit.
 * Unanswered questions (not in answers map) count as incorrect.
 */
export function computePerUnitAccuracy(
  questions: MCQ[],
  answers: Record<string, TestAnswer>
): PerUnitResult[] {
  if (questions.length === 0) return []

  // Group by unit
  const unitMap = new Map<string, MCQ[]>()
  questions.forEach(q => {
    if (!unitMap.has(q.unit)) unitMap.set(q.unit, [])
    unitMap.get(q.unit)!.push(q)
  })

  const results: PerUnitResult[] = []
  unitMap.forEach((qs, unit) => {
    const total = qs.length
    const correct = qs.filter(q => answers[q.id]?.isCorrect === true).length
    const accuracy = total > 0 ? correct / total : 0
    results.push({
      unitNumber: unit,
      unitName: unit,   // UI layer maps unit slug → display name
      correct,
      total,
      accuracy,
    })
  })

  return results
}

// ─── handleTestComplete ───────────────────────────────────────────────────────

/**
 * Called when a student finishes a practice test.
 *
 * Writes:
 *   - ascendly_score_[subject] with { projectedScore, accuracy } (D-23)
 *   - ascendly_total_questions incremented by questions count (D-25)
 *   - analytics event 'test_completed' (D-26 — overrides TEST-05's 'practice_test_complete')
 *
 * Does NOT write mastery keys (D-24).
 */
export function handleTestComplete(
  session: TestSessionState,
  subject: string
): void {
  const totalQuestions = session.questions.length
  const correctCount = Object.values(session.answers).filter(a => a.isCorrect).length
  const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0
  const projectedScore = projectScore(accuracy)

  // D-23: Write projected score to localStorage
  lsSet(LS_KEYS.score(subject), { projectedScore, accuracy })

  // D-25: Increment total questions counter
  const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
  lsSet(LS_KEYS.totalQuestions, prevTotal + totalQuestions)

  // Sync stats to Supabase
  const streak = lsGet<{ count: number; lastPracticeDate: string } | null>(LS_KEYS.streak, null)
  saveStats(prevTotal + totalQuestions, streak?.count ?? 0, streak?.lastPracticeDate ?? null)

  // D-26: Fire analytics (fire-and-forget, never awaited — Critical Rule #6)
  logEvent({
    event_type: 'test_completed',
    subject,
    metadata: {
      total: totalQuestions,
      correct: correctCount,
      timed: session.timed,
      projected_score: projectedScore,
      duration_ms: session.startedAt ? Date.now() - session.startedAt : undefined,
    },
  })

  // D-24: Do NOT write mastery keys — practice tests don't update unit mastery
}
