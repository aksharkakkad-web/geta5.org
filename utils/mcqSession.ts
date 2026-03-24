import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'

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
  isRetry: boolean
  unitSlug: string | 'all'
  retryQuestionIds?: string[]
}

export type MCQView = 'unit-select' | 'session' | 'results'

// ─── Session Completion Handler ───────────────────────────────────────────────

/**
 * Called when the student finishes an MCQ session.
 * Mirrors handleSessionComplete from drillSession.ts for MCQ-specific logic.
 *
 * - Always increments LS_KEYS.totalQuestions by session.questions.length
 * - Only writes mcqAccuracy for non-retry, non-Study-All sessions
 * - Always fires logEvent fire-and-forget
 */
export function handleMCQSessionComplete(session: MCQSessionState, subject: string): void {
  const correctCount = Object.values(session.answers).filter(a => a.isCorrect).length
  const totalQuestions = session.questions.length

  // Always increment total questions (retry + Study All included)
  const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
  lsSet(LS_KEYS.totalQuestions, prevTotal + totalQuestions)

  // Only write mcqAccuracy for non-retry, non-Study-All sessions
  if (!session.isRetry && session.unitSlug !== 'all') {
    const mcqAccuracy = correctCount / totalQuestions
    const existing = lsGet(LS_KEYS.mastery(subject, session.unitSlug), {
      drillAccuracy: 0,
      mcqAccuracy: 0,
      totalAttempts: 0,
    })
    lsSet(LS_KEYS.mastery(subject, session.unitSlug), {
      ...existing,
      mcqAccuracy,
      totalAttempts: existing.totalAttempts + totalQuestions,
    })
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
    },
  })
}
