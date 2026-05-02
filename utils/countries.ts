export type RegimeCategory = 'democratic' | 'hybrid' | 'authoritarian'

export interface CountryPairedWith {
  id: string
  title: string
  relation: string
}

export interface CountryAdiPrompts {
  quiz: string
  explain: string
}

export interface CountrySection {
  label: string
  title: string
  blurb: string
  adi_prompt: string
}

export interface CountryItem {
  id: 'uk' | 'russia' | 'china' | 'iran' | 'mexico' | 'nigeria'
  title: string
  regime_type: string
  regime_category: RegimeCategory
  byline: string
  key_takeaway: string
  summary: string
  key_institutions: string[]
  required_cases: string[]
  comparative_themes: string[]
  paired_with: CountryPairedWith[]
  exam_appearance: string
  sections: CountrySection[]
  adi_prompts: CountryAdiPrompts
}

export interface CountriesData {
  subject: 'ap-comparative-government'
  items: CountryItem[]
}

/** Check if a subject has a Countries hub. Only AP Comparative Government. */
export function hasCountriesHub(slug: string): boolean {
  return slug === 'ap-comparative-government'
}

/** Human-readable regime category label for the tab UI. */
export function regimeCategoryLabel(category: RegimeCategory): string {
  switch (category) {
    case 'democratic': return 'Democratic'
    case 'hybrid': return 'Hybrid'
    case 'authoritarian': return 'Authoritarian'
  }
}

/** Kicker string shown on detail pages and index cards. */
export function kickerForCountry(item: Pick<CountryItem, 'regime_type' | 'regime_category'>): string {
  const categoryLabel = regimeCategoryLabel(item.regime_category)
  return `${categoryLabel} · ${item.regime_type}`
}
