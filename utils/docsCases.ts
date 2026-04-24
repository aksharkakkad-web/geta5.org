export type DocCaseType = 'document' | 'case'

export interface DocCasePairedWith {
  id: string
  title: string
  relation: string
}

export interface DocCaseAdiPrompts {
  quiz: string
  explain: string
}

export interface DocCaseSection {
  label: string
  title: string
  blurb: string
  adi_prompt?: string
}

export interface DocCaseItem {
  id: string
  type: DocCaseType
  title: string
  year: number
  unit: 'unit-1' | 'unit-2' | 'unit-3' | 'unit-4' | 'unit-5'
  author?: string
  vote?: string
  byline: string
  key_takeaway: string
  summary: string
  key_terms: string[]
  paired_with: DocCasePairedWith[]
  constitutional_link?: string
  exam_appearance: string
  sections?: DocCaseSection[]
  adi_prompts: DocCaseAdiPrompts
}

export interface DocsCasesData {
  subject: 'ap-government'
  items: DocCaseItem[]
}

/** Check if a subject has a Docs & Cases hub. Only AP Gov for now. */
export function hasDocsCases(subject: string): boolean {
  return subject === 'ap-government'
}

/** Human-readable unit label for a unit slug. */
export function unitNumberLabel(unit: string): string {
  const n = unit.replace('unit-', '')
  return `Unit ${n}`
}

/** Kicker string shown on detail pages and index cards. */
export function kickerForItem(item: Pick<DocCaseItem, 'type' | 'year' | 'unit'>): string {
  const typeLabel = item.type === 'document' ? 'Foundational Document' : 'Supreme Court Case'
  return `${typeLabel} · ${item.year} · ${unitNumberLabel(item.unit)}`
}
