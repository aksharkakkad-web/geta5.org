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
  tap_to_select: false,
  matching: false,
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
  // Subset of `cards` whose verdicts should NOT be recorded — these are
  // borrowed fillers used to round out an orphan cluster to 4.
  viewOnlyIds: Set<string>
}

export interface StylePlan {
  styleMap: Record<string, CardPresentStyle>
  matchingAnchorMap: Map<string, MatchingGroup>
  // IDs of cards that are members of a matching group AND part of the active
  // deck (i.e. not view-only fillers). Used to suppress duplicate standalone rendering.
  groupMemberIds: Set<string>
  reorderedDeck: DrillCard[]
}

export interface ComputeStylePlanOptions {
  // Pool of cards available to borrow from when an orphan cluster needs
  // filler to form a 4-card matching group. Typically the entire subject's
  // drill data plus already-answered cards from this session.
  fillerPool?: DrillCard[]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Picks `needed` filler cards, preferring same unit+mode, then same mode any
// unit, then any vocab card. Excludes ids that are already in use.
function pickFillers(
  needed: number,
  cluster: { unit: string; mode: DrillMode },
  pool: DrillCard[],
  excludeIds: Set<string>
): DrillCard[] {
  if (needed <= 0) return []
  const sameCluster = shuffle(pool.filter(c =>
    c.unit === cluster.unit && c.mode === cluster.mode && !excludeIds.has(c.id)
  ))
  const sameMode = shuffle(pool.filter(c =>
    c.mode === cluster.mode && c.unit !== cluster.unit && !excludeIds.has(c.id)
  ))
  const anyVocab = shuffle(pool.filter(c =>
    VOCAB_MODES.has(c.mode) && c.mode !== cluster.mode && !excludeIds.has(c.id)
  ))
  const out: DrillCard[] = []
  const seen = new Set<string>()
  for (const list of [sameCluster, sameMode, anyVocab]) {
    for (const c of list) {
      if (out.length >= needed) return out
      if (seen.has(c.id)) continue
      seen.add(c.id)
      out.push(c)
    }
  }
  return out
}

export function computeStylePlan(
  deck: DrillCard[],
  settings: DrillStyleSettings,
  options: ComputeStylePlanOptions = {}
): StylePlan {
  const styleMap: Record<string, CardPresentStyle> = {}
  const matchingAnchorMap = new Map<string, MatchingGroup>()
  const groupMemberIds = new Set<string>()

  const individualStyles: SinglePresentStyle[] = []
  if (settings.typed_recall) individualStyles.push('typed')
  if (settings.tap_to_select) individualStyles.push('tap')
  // When ONLY matching is enabled, orphan vocab cards still need to render somehow
  // if no fillers are available — fall back to typed in that edge case.
  const matchingOnly = settings.matching && individualStyles.length === 0
  const orphanFallback: SinglePresentStyle = individualStyles[0] ?? 'typed'

  function pickIndividual(): SinglePresentStyle {
    if (individualStyles.length === 0) return orphanFallback
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

  // If matching is disabled or not enough vocab cards anywhere, make everything individual
  if (!settings.matching) {
    for (const card of vocabCards) styleMap[card.id] = pickIndividual()
    return { styleMap, matchingAnchorMap, groupMemberIds, reorderedDeck: [...deck] }
  }

  // Cluster vocab cards by unit+mode for semantic grouping.
  const clusters = new Map<string, DrillCard[]>()
  for (const card of vocabCards) {
    const key = `${card.unit}||${card.mode}`
    if (!clusters.has(key)) clusters.set(key, [])
    clusters.get(key)!.push(card)
  }

  const matchingBlocks: DrillCard[][] = []
  const individualVocab: DrillCard[] = []
  // Track every id in use so fillers don't duplicate active cards or earlier fillers
  const usedIds = new Set<string>(deck.map(c => c.id))
  const fillerPool = options.fillerPool ?? []

  for (const clusterCards of clusters.values()) {
    let i = 0
    // Form full groups of 4 from the active cluster
    while (i + 4 <= clusterCards.length) {
      const groupCards = clusterCards.slice(i, i + 4)
      const anchorId = groupCards[0].id
      matchingAnchorMap.set(anchorId, { anchorId, cards: groupCards, viewOnlyIds: new Set() })
      for (const c of groupCards) {
        groupMemberIds.add(c.id)
        styleMap[c.id] = 'typed' // fallback if encountered individually
      }
      matchingBlocks.push(groupCards)
      i += 4
    }
    const leftover = clusterCards.slice(i)
    if (leftover.length === 0) continue

    // Try to pad orphans up to 4 using fillers. Pad whenever matching is enabled
    // AND fillerPool has enough relevant cards — prefer real groups over orphan typed.
    const needed = 4 - leftover.length
    const sample = leftover[0]
    const fillers = pickFillers(
      needed,
      { unit: sample.unit, mode: sample.mode },
      fillerPool,
      usedIds
    )

    if (fillers.length === needed) {
      const groupCards = [...leftover, ...fillers]
      const anchorId = leftover[0].id
      const viewOnlyIds = new Set(fillers.map(f => f.id))
      matchingAnchorMap.set(anchorId, { anchorId, cards: groupCards, viewOnlyIds })
      for (const c of leftover) {
        groupMemberIds.add(c.id)
        styleMap[c.id] = 'typed'
      }
      for (const f of fillers) usedIds.add(f.id)
      matchingBlocks.push(leftover) // only real cards count for spacing
    } else if (matchingOnly && leftover.length >= 2) {
      // Matching-only: best effort — partial group with whatever fillers we got,
      // even if it's a 2- or 3-card matching round. Better than typing when user opted out of typing.
      const groupCards = [...leftover, ...fillers]
      const anchorId = leftover[0].id
      const viewOnlyIds = new Set(fillers.map(f => f.id))
      matchingAnchorMap.set(anchorId, { anchorId, cards: groupCards, viewOnlyIds })
      for (const c of leftover) {
        groupMemberIds.add(c.id)
        styleMap[c.id] = 'typed'
      }
      for (const f of fillers) usedIds.add(f.id)
      matchingBlocks.push(leftover)
    } else {
      // Leave as individual typed/tap
      for (const c of leftover) individualVocab.push(c)
    }
  }

  // Truly orphan single cards in matching-only mode with zero fillers: render
  // as the fallback style (typed). Outside matching-only mode they go to the
  // normal individual pool.
  for (const card of individualVocab) {
    styleMap[card.id] = pickIndividual()
  }

  // Build reordered deck: matching blocks contain only the REAL anchor members
  // from the active deck. Fillers live inside MatchingGroup but are not standalone slots.
  const individualPool = shuffle([...individualVocab, ...nonVocabCards])
  const shuffledBlocks = shuffle(matchingBlocks)
  const reorderedDeck: DrillCard[] = []

  if (shuffledBlocks.length === 0) {
    reorderedDeck.push(...individualPool)
  } else {
    const gap = Math.max(Math.floor(individualPool.length / shuffledBlocks.length), 3)
    let indivIdx = 0

    for (const block of shuffledBlocks) {
      const end = Math.min(indivIdx + gap, individualPool.length)
      while (indivIdx < end) reorderedDeck.push(individualPool[indivIdx++])
      // Push every real member of the block — fillers live only inside the
      // MatchingGroup, not in the deck. DrillSession renders the anchor as a
      // matching round and then advances past the other real members.
      reorderedDeck.push(...block)
    }
    while (indivIdx < individualPool.length) reorderedDeck.push(individualPool[indivIdx++])
  }

  return { styleMap, matchingAnchorMap, groupMemberIds, reorderedDeck }
}
