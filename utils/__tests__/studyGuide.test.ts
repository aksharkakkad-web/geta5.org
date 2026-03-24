import { StudyGuide, StudyGuideSection, SECTIONS, getVisibleSections, fetchStudyGuide } from '../studyGuide'

// ─── Test 1: StudyGuide type matches schema required fields ───────────────────

describe('StudyGuide interface', () => {
  it('has all required schema fields', () => {
    const guide: StudyGuide = {
      id: 'psy-sg-unit-1',
      unit: 'Unit 1',
      subject: 'AP Psychology',
      theme: 'The nervous system coordinates behavior',
      core_concepts: ['Neurons transmit signals', 'Neurotransmitters relay messages'],
      key_terms: [{ term: 'Neuron', definition: 'A nerve cell' }],
      exam_tip: 'Know the brain regions',
    }
    // All required fields present — TypeScript would catch missing ones at compile time
    expect(guide.id).toBeDefined()
    expect(guide.unit).toBeDefined()
    expect(guide.subject).toBeDefined()
    expect(guide.theme).toBeDefined()
    expect(guide.core_concepts).toBeDefined()
    expect(guide.key_terms).toBeDefined()
    expect(guide.exam_tip).toBeDefined()
  })

  it('allows optional formulas and diagrams', () => {
    const guide: StudyGuide = {
      id: 'psy-sg-unit-1',
      unit: 'Unit 1',
      subject: 'AP Psychology',
      theme: 'Test theme',
      core_concepts: ['Concept 1'],
      key_terms: [{ term: 'Term', definition: 'Def' }],
      formulas: [{ name: 'Resting Potential', katex_string: 'V_{rest} \\approx -70 \\text{ mV}' }],
      exam_tip: 'Tip',
    }
    expect(guide.formulas).toBeDefined()
    expect(guide.formulas?.[0].katex_string).toBe('V_{rest} \\approx -70 \\text{ mV}')
  })
})

// ─── Test 2: SECTIONS array has exactly 5 entries ────────────────────────────

describe('SECTIONS', () => {
  it('has exactly 5 entries', () => {
    expect(SECTIONS).toHaveLength(5)
  })

  it('has keys: theme, core_concepts, key_terms, formulas, exam_tip', () => {
    const keys = SECTIONS.map(s => s.key)
    expect(keys).toContain('theme')
    expect(keys).toContain('core_concepts')
    expect(keys).toContain('key_terms')
    expect(keys).toContain('formulas')
    expect(keys).toContain('exam_tip')
  })
})

// ─── Test 3: SECTIONS labels ─────────────────────────────────────────────────

describe('SECTIONS labels', () => {
  it('has correct labels for each section', () => {
    const labelMap = Object.fromEntries(SECTIONS.map(s => [s.key, s.label]))
    expect(labelMap['theme']).toBe('Central Theme')
    expect(labelMap['core_concepts']).toBe('Core Concepts')
    expect(labelMap['key_terms']).toBe('Key Terms')
    expect(labelMap['formulas']).toBe('Formulas & Diagrams')
    expect(labelMap['exam_tip']).toBe('Exam Tip')
  })
})

// ─── Test 4: fetchStudyGuide returns null for 404 ────────────────────────────

describe('fetchStudyGuide', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns null when fetch returns 404', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 })
    const result = await fetchStudyGuide('ap-psychology', 999)
    expect(result).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    const result = await fetchStudyGuide('ap-psychology', 999)
    expect(result).toBeNull()
  })

  it('returns parsed JSON on success', async () => {
    const mockGuide: StudyGuide = {
      id: 'psy-sg-unit-1',
      unit: 'Unit 1',
      subject: 'AP Psychology',
      theme: 'Test',
      core_concepts: ['Concept'],
      key_terms: [{ term: 'T', definition: 'D' }],
      exam_tip: 'Tip',
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGuide,
    })
    const result = await fetchStudyGuide('ap-psychology', 1)
    expect(result).toEqual(mockGuide)
  })
})

// ─── Test 5: getVisibleSections filters 'formulas' when empty ────────────────

describe('getVisibleSections', () => {
  const baseGuide: StudyGuide = {
    id: 'test',
    unit: 'Unit 1',
    subject: 'AP Psychology',
    theme: 'Theme',
    core_concepts: ['C1'],
    key_terms: [{ term: 'T', definition: 'D' }],
    exam_tip: 'Tip',
  }

  it('filters out formulas when formulas is undefined', () => {
    const visible = getVisibleSections({ ...baseGuide, formulas: undefined })
    const keys = visible.map(s => s.key)
    expect(keys).not.toContain('formulas')
  })

  it('filters out formulas when formulas is empty array', () => {
    const visible = getVisibleSections({ ...baseGuide, formulas: [] })
    const keys = visible.map(s => s.key)
    expect(keys).not.toContain('formulas')
  })

  it('returns 4 sections when formulas is empty', () => {
    const visible = getVisibleSections({ ...baseGuide, formulas: [] })
    expect(visible).toHaveLength(4)
  })
})

// ─── Test 6: getVisibleSections includes 'formulas' when items exist ──────────

describe('getVisibleSections with formulas', () => {
  it('includes formulas when formulas has items', () => {
    const guide: StudyGuide = {
      id: 'test',
      unit: 'Unit 1',
      subject: 'AP Psychology',
      theme: 'Theme',
      core_concepts: ['C1'],
      key_terms: [{ term: 'T', definition: 'D' }],
      formulas: [{ name: 'Formula 1', katex_string: 'E = mc^2' }],
      exam_tip: 'Tip',
    }
    const visible = getVisibleSections(guide)
    const keys = visible.map(s => s.key)
    expect(keys).toContain('formulas')
    expect(visible).toHaveLength(5)
  })
})
