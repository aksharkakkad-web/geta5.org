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

  let vocabBuffer: DrillCard[] = []

  function flushBuffer() {
    let i = 0
    while (i < vocabBuffer.length) {
      if (settings.matching && i + 4 <= vocabBuffer.length) {
        const groupCards = vocabBuffer.slice(i, i + 4)
        const anchorId = groupCards[0].id
        const group: MatchingGroup = { anchorId, cards: groupCards }
        matchingAnchorMap.set(anchorId, group)
        for (const c of groupCards) {
          groupMemberIds.add(c.id)
          styleMap[c.id] = 'typed' // fallback if encountered individually
        }
        i += 4
      } else {
        const card = vocabBuffer[i]
        styleMap[card.id] = pickIndividual()
        i++
      }
    }
    vocabBuffer = []
  }

  for (const card of deck) {
    if (card.mode === 'concept_mc') {
      flushBuffer()
      styleMap[card.id] = 'concept_mc'
    } else if (card.mode === 'name_to_formula') {
      flushBuffer()
      styleMap[card.id] = 'formula'
    } else if (VOCAB_MODES.has(card.mode)) {
      vocabBuffer.push(card)
    } else {
      flushBuffer()
      styleMap[card.id] = pickIndividual()
    }
  }
  flushBuffer()

  return { styleMap, matchingAnchorMap, groupMemberIds }
}
