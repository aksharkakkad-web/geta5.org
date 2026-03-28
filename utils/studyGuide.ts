import { normalizeCard, type DrillCard } from '@/utils/drillSession'

export interface StudyGuide {
  id: string
  unit: string
  subject: string
  theme: string
  core_concepts: string[]
  key_terms?: { term: string; definition: string }[]
  formulas?: { name: string; katex_string: string }[]
  diagrams?: { type: 'table' | 'chart'; data: unknown }[]
  exam_tip: string
}

export type StudyGuideSection = 'theme' | 'core_concepts' | 'key_terms' | 'formulas' | 'exam_tip'

export const SECTIONS: { key: StudyGuideSection; label: string }[] = [
  { key: 'theme', label: 'Central Theme' },
  { key: 'core_concepts', label: 'Core Concepts' },
  { key: 'key_terms', label: 'Key Terms' },
  { key: 'formulas', label: 'Formulas & Diagrams' },
  { key: 'exam_tip', label: 'Exam Tip' },
]

export function getVisibleSections(guide: StudyGuide): typeof SECTIONS {
  return SECTIONS.filter(s => {
    if (s.key === 'formulas') {
      return guide.formulas && guide.formulas.length > 0
    }
    return true
  })
}

export type ViewSection = 'overview' | 'key_terms' | 'formulas'

export const VIEW_SECTIONS: { key: ViewSection; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'key_terms', label: 'Key Terms' },
  { key: 'formulas', label: 'Formulas' },
]

export function getViewSections(guide: StudyGuide): { key: ViewSection; label: string }[] {
  return VIEW_SECTIONS.filter(s => {
    if (s.key === 'formulas') return (guide.formulas?.length ?? 0) > 0
    return true
  })
}

export async function fetchStudyGuide(subject: string, unitNumber: number): Promise<StudyGuide | null> {
  try {
    const res = await fetch(`/data/${subject}/study-guide/unit-${unitNumber}.json`)
    if (!res.ok) return null
    return (await res.json()) as StudyGuide
  } catch {
    return null
  }
}

/**
 * Fetch is_key_term drill cards for a unit and map them to {term, definition} pairs
 * for display in the study guide Key Terms section.
 *
 * Mapping (mirrors normalizeCard):
 *   definition_to_term   → { term: card.answer, definition: card.prompt }
 *   all other modes      → { term: card.prompt, definition: card.answer }
 */
export async function fetchDrillKeyTerms(
  subject: string,
  unitNumber: number
): Promise<{ term: string; definition: string }[]> {
  try {
    const res = await fetch(`/data/${subject}/drills/unit-${unitNumber}.json`)
    if (!res.ok) return []
    const data = (await res.json()) as { cards: DrillCard[] }
    return data.cards
      .filter(c => c.is_key_term === true)
      .map(c => {
        const norm = normalizeCard(c)
        return { term: norm.term, definition: norm.definition }
      })
  } catch {
    return []
  }
}
