import { lsGet, lsSet } from './localStorage'
import type { DrillCard, DrillMode } from './drillSession'

const LS_KEY = 'ascendly_drill_styles'

export interface DrillStyleSettings {
  typed_recall: boolean
  tap_to_select: boolean
  matching: boolean
}

const DEFAULTS: DrillStyleSettings = {
  typed_recall: true,
  tap_to_select: true,
  matching: true,
}

export function loadDrillStyles(): DrillStyleSettings {
  return lsGet<DrillStyleSettings>(LS_KEY, DEFAULTS)
}

export function saveDrillStyles(s: DrillStyleSettings): void {
  lsSet(LS_KEY, s)
}

export function atLeastOneEnabled(s: DrillStyleSettings): boolean {
  return s.typed_recall || s.tap_to_select || s.matching
}

export type SinglePresentStyle = 'typed' | 'tap'
export type CardPresentStyle = SinglePresentStyle | 'formula' | 'concept_mc'

const VOCAB_MODES = new Set<DrillMode>([
  'definition_to_term',
  'significance_to_person',
  'significance_to_event',
  'significance_to_case',
])

export interface MatchingGroup {
  anchorId: string
  cards: DrillCard[]
}

export interface StylePlan {
  styleMap: Record<string, CardPresentStyle>
  matchingAnchorMap: Map<string, MatchingGroup>
  groupMemberIds: Set<string>
  reorderedDeck: DrillCard[]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function computeStylePlan(deck: DrillCard[], settings: DrillStyleSettings): StylePlan {
  const styleMap: Record<string, CardPresentStyle> = {}
  const matchingAnchorMap = new Map<string, MatchingGroup>()
  const groupMemberIds = new Set<string>()

  const individualStyles: SinglePresentStyle[] = []
  if (settings.typed_recall) individualStyles.push('typed')
  if (settings.tap_to_select) individualStyles.push('tap')
  if (individualStyles.length === 0) individualStyles.push('typed')

  function pickIndividual(): SinglePresentStyle {
    return individualStyles[Math.floor(Math.random() * individualStyles.length)]
  }

  // Separate vocab (matchable) from non-vocab cards
  const vocabCards: DrillCard[] = []
  const nonVocabCards: DrillCard[] = []
  for (const card of deck) {
    if (VOCAB_MODES.has(card.mode)) vocabCards.push(card)
    else nonVocabCards.push(card)
  }

  // Assign non-vocab styles immediately
  for (const card of nonVocabCards) {
    if (card.mode === 'concept_mc') styleMap[card.id] = 'concept_mc'
    else if (card.mode === 'name_to_formula') styleMap[card.id] = 'formula'
    else styleMap[card.id] = pickIndividual()
  }

  // If matching is disabled or not enough vocab cards, make everything individual
  if (!settings.matching || vocabCards.length < 4) {
    for (const card of vocabCards) styleMap[card.id] = pickIndividual()
    return { styleMap, matchingAnchorMap, groupMemberIds, reorderedDeck: [...deck] }
  }

  // Cluster vocab cards by unit+mode for semantic grouping.
  // Cards in the same cluster share the same topic area and question type,
  // making it impossible to match by elimination — you have to know the content.
  const clusters = new Map<string, DrillCard[]>()
  for (const card of vocabCards) {
    const key = `${card.unit}||${card.mode}`
    if (!clusters.has(key)) clusters.set(key, [])
    clusters.get(key)!.push(card)
  }

  const matchingBlocks: DrillCard[][] = []
  const individualVocab: DrillCard[] = []

  for (const clusterCards of clusters.values()) {
    let i = 0
    // Form groups of 4 from each cluster
    while (i + 4 <= clusterCards.length) {
      const groupCards = clusterCards.slice(i, i + 4)
      const anchorId = groupCards[0].id
      matchingAnchorMap.set(anchorId, { anchorId, cards: groupCards })
      for (const c of groupCards) {
        groupMemberIds.add(c.id)
        styleMap[c.id] = 'typed' // fallback if encountered individually
      }
      matchingBlocks.push(groupCards)
      i += 4
    }
    // Remaining cards in cluster become individual typed/tap
    while (i < clusterCards.length) {
      individualVocab.push(clusterCards[i++])
    }
  }

  for (const card of individualVocab) {
    styleMap[card.id] = pickIndividual()
  }

  // Build reordered deck: spread matching blocks evenly among individual cards.
  // Individual pool is shuffled so typed/tap and concept_mc cards are truly mixed.
  const individualPool = shuffle([...individualVocab, ...nonVocabCards])
  const shuffledBlocks = shuffle(matchingBlocks)
  const reorderedDeck: DrillCard[] = []

  if (shuffledBlocks.length === 0) {
    reorderedDeck.push(...individualPool)
  } else {
    // Place at least 3 individual cards between each matching block
    const gap = Math.max(Math.floor(individualPool.length / shuffledBlocks.length), 3)
    let indivIdx = 0

    for (const block of shuffledBlocks) {
      // Place `gap` individual cards, then the 4-card matching block
      const end = Math.min(indivIdx + gap, individualPool.length)
      while (indivIdx < end) reorderedDeck.push(individualPool[indivIdx++])
      reorderedDeck.push(...block)
    }
    // Drain remaining individual cards at the end
    while (indivIdx < individualPool.length) reorderedDeck.push(individualPool[indivIdx++])
  }

  return { styleMap, matchingAnchorMap, groupMemberIds, reorderedDeck }
}
