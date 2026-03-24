import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'

export interface DrillCard {
  id: string
  unit: string
  subject: string
  mode: DrillMode
  prompt: string
  answer: string
  alternate_answers?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  katex_required?: boolean
}

export type DrillMode =
  | 'definition_to_term'
  | 'formula_to_type'
  | 'person_to_significance'
  | 'event_to_date'
  | 'concept_to_example'
  | 'term_to_definition'

export interface SessionState {
  cards: DrillCard[]
  index: number
  answers: Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
  isRetry: boolean
  unitSlug: string | 'all'
}

export type DrillView = 'unit-select' | 'session' | 'results'

export const MODE_LABELS: Record<DrillMode, string> = {
  definition_to_term: 'Definition → Term',
  formula_to_type: 'Formula → Type',
  person_to_significance: 'Person → Significance',
  event_to_date: 'Event → Date',
  concept_to_example: 'Concept → Example',
  term_to_definition: 'Term → Definition',
}

export function handleSessionComplete(session: SessionState, subject: string): void {
  const correctCount = Object.values(session.answers).filter(a => a.verdict === 'correct').length
  const totalCards = session.cards.length

  // Always increment total questions (retry + Study All included)
  const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
  lsSet(LS_KEYS.totalQuestions, prevTotal + totalCards)

  // Only write drillAccuracy for non-retry, non-Study-All sessions
  if (!session.isRetry && session.unitSlug !== 'all') {
    const drillAccuracy = correctCount / totalCards
    const existing = lsGet(LS_KEYS.mastery(subject, session.unitSlug), {
      drillAccuracy: 0,
      mcqAccuracy: 0,
      totalAttempts: 0,
    })
    lsSet(LS_KEYS.mastery(subject, session.unitSlug), {
      ...existing,
      drillAccuracy,
      totalAttempts: existing.totalAttempts + totalCards,
    })
  }

  // Fire analytics (always, never await)
  logEvent({
    event_type: 'drill_completed',
    subject,
    unit: session.unitSlug,
    metadata: {
      accuracy: correctCount / totalCards,
      cards_count: totalCards,
      is_retry: session.isRetry,
    },
  })
}
