import { lsGet, lsSet, lsClear, LS_KEYS } from '@/utils/localStorage'
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

export type DrillView = 'unit-select' | 'session' | 'results' | 'browse'

export const MODE_LABELS: Record<DrillMode, string> = {
  definition_to_term: 'Definition → Term',
  formula_to_type: 'Formula → Type',
  person_to_significance: 'Person → Significance',
  event_to_date: 'Event → Date',
  concept_to_example: 'Concept → Example',
  term_to_definition: 'Term → Definition',
}

/**
 * Display-only view of a DrillCard for the browse table.
 * Normalises term/definition direction across all card modes.
 * Intentionally omits alternate_answers — browse is read-only.
 */
export interface NormalizedCard {
  id: string
  term: string
  definition: string
  mode: DrillMode
  katex_required?: boolean
}

/**
 * Normalises a DrillCard so that `term` always holds the vocabulary word/name
 * and `definition` always holds the explanation, regardless of card mode.
 *
 * definition_to_term cards store the word in `answer` and the definition in `prompt` —
 * all other modes store the word/name in `prompt` and the explanation in `answer`.
 */
export function normalizeCard(card: DrillCard): NormalizedCard {
  if (card.mode === 'definition_to_term') {
    return {
      id: card.id,
      term: card.answer,
      definition: card.prompt,
      mode: card.mode,
      katex_required: card.katex_required,
    }
  }
  return {
    id: card.id,
    term: card.prompt,
    definition: card.answer,
    mode: card.mode,
    katex_required: card.katex_required,
  }
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

// ─── Draft Persistence ────────────────────────────────────────────────────────

export interface DrillDraft {
  cards: DrillCard[]
  currentIndex: number
  answers: SessionState['answers']
  isRetry: boolean
  unitSlug: string
  savedAt: number
}

export function saveDrillDraft(subject: string, draft: DrillDraft): void {
  lsSet(LS_KEYS.drillDraft(subject), draft)
}

export function loadDrillDraft(subject: string): DrillDraft | null {
  return lsGet<DrillDraft | null>(LS_KEYS.drillDraft(subject), null)
}

export function clearDrillDraft(subject: string): void {
  lsClear(LS_KEYS.drillDraft(subject))
}
