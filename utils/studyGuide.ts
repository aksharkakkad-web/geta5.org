export interface StudyGuide {
  id: string
  unit: string
  subject: string
  theme: string
  core_concepts: string[]
  key_terms: { term: string; definition: string }[]
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

export async function fetchStudyGuide(subject: string, unitNumber: number): Promise<StudyGuide | null> {
  try {
    const res = await fetch(`/data/${subject}/study-guide/unit-${unitNumber}.json`)
    if (!res.ok) return null
    return (await res.json()) as StudyGuide
  } catch {
    return null
  }
}
