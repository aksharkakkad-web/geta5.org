import { lsGet, lsSet, lsClear, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'
import { saveProgress, syncStats } from '@/utils/persistence'

export interface DrillChoice {
  text: string
  is_correct: boolean
  explanation: string
}

export interface DrillCard {
  id: string
  unit: string
  subject: string
  mode: DrillMode
  prompt: string
  answer?: string
  difficulty: 'easy' | 'medium' | 'hard'
  katex_required?: boolean
  is_key_term?: boolean
  group?: string             // region/empire/theme label for browse grouping
  format_hint?: string       // name_to_formula only
  choices?: DrillChoice[]    // concept_mc only
}

export type DrillMode =
  | 'definition_to_term'
  | 'significance_to_person'
  | 'significance_to_event'
  | 'significance_to_case'
  | 'name_to_formula'
  | 'concept_mc'

export type DrillFilter = 'all' | 'vocab' | 'concept'

const VOCAB_MODES = new Set<DrillMode>([
  'definition_to_term',
  'significance_to_person',
  'significance_to_event',
  'significance_to_case',
  'name_to_formula',
])

export function matchesFilter(card: DrillCard, filter: DrillFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'vocab') return VOCAB_MODES.has(card.mode)
  return card.mode === 'concept_mc'
}

export interface SessionState {
  cards: DrillCard[]
  workingDeck?: DrillCard[]   // active sequence; includes retry insertions
  index: number
  answers: Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
  isRetry: boolean
  unitSlug: string | 'all'
  startedAt?: number          // Date.now() when session began
}

export type DrillView = 'unit-select' | 'session' | 'results' | 'browse'

export const MODE_LABELS: Record<DrillMode, string> = {
  definition_to_term:     'Definition → Term',
  significance_to_person: 'Significance → Person',
  significance_to_event:  'Significance → Event',
  significance_to_case:   'Significance → Case',
  name_to_formula:        'Name → Formula',
  concept_mc:             'Concept Check',
}

export const RETRY_INTERVAL = 5

/**
 * Returns a new deck with `card` spliced in RETRY_INTERVAL+1 positions
 * after `currentIndex`. If the deck is too short, card goes at the end.
 * Pure function — does not mutate the input array.
 */
export function insertRetryCard(deck: DrillCard[], card: DrillCard, currentIndex: number): DrillCard[] {
  const insertAt = Math.min(currentIndex + RETRY_INTERVAL + 1, deck.length)
  const updated = [...deck]
  updated.splice(insertAt, 0, card)
  return updated
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
  group?: string
}

/**
 * Normalises a DrillCard so that `term` always holds the vocabulary word/name
 * and `definition` always holds the explanation, regardless of card mode.
 *
 * definition_to_term cards store the word in `answer` and the definition in `prompt` —
 * all other modes store the word/name in `prompt` and the explanation in `answer`.
 */
export function normalizeCard(card: DrillCard): NormalizedCard {
  // For all typed-recall modes the answer is the short term/name and the prompt is the longer context.
  // concept_mc is excluded from browse entirely, so it never reaches normalizeCard from BrowseView.
  const answerIsTheTerm =
    card.mode === 'definition_to_term' ||
    card.mode === 'significance_to_person' ||
    card.mode === 'significance_to_event' ||
    card.mode === 'significance_to_case'
  if (answerIsTheTerm) {
    return {
      id: card.id,
      term: card.answer ?? '',
      definition: card.prompt,
      mode: card.mode,
      katex_required: card.katex_required,
      group: card.group,
    }
  }
  return {
    id: card.id,
    term: card.prompt,
    definition: card.answer ?? '',
    mode: card.mode,
    katex_required: card.katex_required,
    group: card.group,
  }
}

export function handleSessionComplete(session: SessionState, subject: string): void {
  const correctCount = Object.values(session.answers).filter(a => a.verdict === 'correct').length
  const totalCards = session.cards.length

  // NOTE: totalQuestions is now incremented per-card in DrillSession.tsx to enable
  // mid-session freemium gating. We do NOT increment it here to avoid double-counting.

  // Sync stats to Supabase
  syncStats()

  // Write drillAccuracy for non-retry sessions
  if (!session.isRetry) {
    if (session.unitSlug !== 'all') {
      // Single unit session — save directly
      const drillAccuracy = correctCount / totalCards
      const existing = lsGet(LS_KEYS.mastery(subject, session.unitSlug), {
        drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0,
      })
      lsSet(LS_KEYS.mastery(subject, session.unitSlug), {
        ...existing,
        drillAccuracy,
        totalAttempts: existing.totalAttempts + totalCards,
      })
      saveProgress(subject, session.unitSlug, { ...existing, drillAccuracy, totalAttempts: existing.totalAttempts + totalCards })
    } else {
      // Study All — distribute per-unit using each card's unit field
      const unitStats: Record<string, { correct: number; total: number }> = {}
      session.cards.forEach(card => {
        if (!unitStats[card.unit]) unitStats[card.unit] = { correct: 0, total: 0 }
        unitStats[card.unit].total++
        if (session.answers[card.id]?.verdict === 'correct') {
          unitStats[card.unit].correct++
        }
      })
      Object.entries(unitStats).forEach(([unitSlug, { correct, total }]) => {
        const drillAccuracy = correct / total
        const existing = lsGet(LS_KEYS.mastery(subject, unitSlug), {
          drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0,
        })
        lsSet(LS_KEYS.mastery(subject, unitSlug), {
          ...existing,
          drillAccuracy,
          totalAttempts: existing.totalAttempts + total,
        })
        saveProgress(subject, unitSlug, { ...existing, drillAccuracy, totalAttempts: existing.totalAttempts + total })
      })
    }
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
      duration_ms: session.startedAt ? Date.now() - session.startedAt : undefined,
    },
  })
}

// ─── Draft Persistence ────────────────────────────────────────────────────────

export interface DrillDraft {
  cards: DrillCard[]
  workingDeck?: DrillCard[]   // saved so retries survive refresh
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
