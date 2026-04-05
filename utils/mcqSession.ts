import { lsGet, lsSet, lsClear, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'
import { saveProgress, saveStats } from '@/utils/persistence'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MCQChoice {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
  is_correct: boolean
  explanation: string
}

export interface MCQStimulus {
  type: 'text' | 'table' | 'chart' | 'code' | 'none'
  content?: string | { headers: string[]; rows: string[][] } | Record<string, unknown> | null
}

export interface MCQ {
  id: string
  unit: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  stimulus: MCQStimulus
  question: string
  choices: MCQChoice[]
  unit_objective: string
}

export interface MCQAnswer {
  selectedChoiceId: string // canonical id from JSON ('A'|'B'|'C'|'D')
  isCorrect: boolean
}

export interface MCQSessionState {
  questions: MCQ[]
  answers: Record<string, MCQAnswer> // keyed by question id
  currentIndex?: number              // present on resumed sessions
  isRetry: boolean
  unitSlug: string | 'all'
  retryQuestionIds?: string[]
  startedAt?: number                 // Date.now() when session began
}

export type MCQView = 'unit-select' | 'session' | 'results'

// ─── Draft Persistence ────────────────────────────────────────────────────────

export interface MCQDraft {
  questions: MCQ[]
  currentIndex: number
  answers: Record<string, MCQAnswer>
  isRetry: boolean
  unitSlug: string | 'all'
  retryQuestionIds?: string[]
  savedAt: number
}

export function saveMCQDraft(subject: string, draft: MCQDraft): void {
  lsSet(LS_KEYS.mcqDraft(subject), draft)
}

export function loadMCQDraft(subject: string): MCQDraft | null {
  return lsGet<MCQDraft | null>(LS_KEYS.mcqDraft(subject), null)
}

export function clearMCQDraft(subject: string): void {
  lsClear(LS_KEYS.mcqDraft(subject))
}

// ─── Session Completion Handler ───────────────────────────────────────────────

/**
 * Called when the student finishes an MCQ session.
 * Mirrors handleSessionComplete from drillSession.ts for MCQ-specific logic.
 *
 * - Always increments LS_KEYS.totalQuestions by session.questions.length
 * - Writes mcqAccuracy for non-retry sessions; Study All distributes per-unit
 * - Always fires logEvent fire-and-forget
 */
export function handleMCQSessionComplete(session: MCQSessionState, subject: string): void {
  const correctCount = Object.values(session.answers).filter(a => a.isCorrect).length
  const totalQuestions = session.questions.length

  // Always increment total questions (retry + Study All included)
  const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
  lsSet(LS_KEYS.totalQuestions, prevTotal + totalQuestions)

  // Sync stats to Supabase
  const streak = lsGet<{ count: number; lastPracticeDate: string } | null>(LS_KEYS.streak, null)
  saveStats(prevTotal + totalQuestions, streak?.count ?? 0, streak?.lastPracticeDate ?? null)

  // Write mcqAccuracy for non-retry sessions
  if (!session.isRetry) {
    if (session.unitSlug !== 'all') {
      // Single unit session — save directly
      const mcqAccuracy = correctCount / totalQuestions
      const existing = lsGet(LS_KEYS.mastery(subject, session.unitSlug), {
        drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0,
      })
      lsSet(LS_KEYS.mastery(subject, session.unitSlug), {
        ...existing,
        mcqAccuracy,
        totalAttempts: existing.totalAttempts + totalQuestions,
      })
      saveProgress(subject, session.unitSlug, { ...existing, mcqAccuracy, totalAttempts: existing.totalAttempts + totalQuestions })
    } else {
      // Study All — distribute per-unit using each question's unit field
      const unitStats: Record<string, { correct: number; total: number }> = {}
      session.questions.forEach(q => {
        if (!unitStats[q.unit]) unitStats[q.unit] = { correct: 0, total: 0 }
        unitStats[q.unit].total++
        if (session.answers[q.id]?.isCorrect) {
          unitStats[q.unit].correct++
        }
      })
      Object.entries(unitStats).forEach(([unitSlug, { correct, total }]) => {
        const mcqAccuracy = correct / total
        const existing = lsGet(LS_KEYS.mastery(subject, unitSlug), {
          drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0,
        })
        lsSet(LS_KEYS.mastery(subject, unitSlug), {
          ...existing,
          mcqAccuracy,
          totalAttempts: existing.totalAttempts + total,
        })
        saveProgress(subject, unitSlug, { ...existing, mcqAccuracy, totalAttempts: existing.totalAttempts + total })
      })
    }
  }

  // Fire analytics (always, never await — per Critical Rule #6)
  logEvent({
    event_type: 'mcq_completed',
    subject,
    unit: session.unitSlug,
    metadata: {
      accuracy: correctCount / totalQuestions,
      question_count: totalQuestions,
      is_retry: session.isRetry,
      duration_ms: session.startedAt ? Date.now() - session.startedAt : undefined,
    },
  })
}
