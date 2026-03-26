import { handleSessionComplete, SessionState, DrillCard, normalizeCard } from '../drillSession'
import { lsGet, lsSet, LS_KEYS } from '../localStorage'
import { logEvent } from '../analytics'

jest.mock('../localStorage')
jest.mock('../analytics')

const mockedLsGet = lsGet as jest.MockedFunction<typeof lsGet>
const mockedLsSet = lsSet as jest.MockedFunction<typeof lsSet>
const mockedLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

function makeCard(overrides: Partial<DrillCard> = {}): DrillCard {
  return {
    id: 'psych-u1-d001',
    unit: 'unit-1',
    subject: 'ap-psychology',
    mode: 'definition_to_term',
    prompt: 'The study of behavior',
    answer: 'Psychology',
    difficulty: 'easy',
    ...overrides,
  }
}

function makeSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    cards: [makeCard({ id: 'c1' }), makeCard({ id: 'c2' }), makeCard({ id: 'c3' })],
    index: 3,
    answers: {
      c1: { verdict: 'correct', userInput: 'Psychology' },
      c2: { verdict: 'correct', userInput: 'psychology' },
      c3: { verdict: 'wrong', userInput: 'Biology' },
    },
    isRetry: false,
    unitSlug: 'unit-1',
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedLsGet.mockReturnValue(0 as never)
})

describe('handleSessionComplete', () => {
  it('writes drillAccuracy for normal session (isRetry=false, unitSlug=unit-1)', () => {
    mockedLsGet.mockImplementation((key: string, fallback: unknown) => {
      if (key === LS_KEYS.totalQuestions) return 0 as never
      // mastery key returns existing state
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: false, unitSlug: 'unit-1' })
    handleSessionComplete(session, 'ap-psychology')

    const masteryKey = LS_KEYS.mastery('ap-psychology', 'unit-1')
    const masteryCall = mockedLsSet.mock.calls.find(([k]) => k === masteryKey)
    expect(masteryCall).toBeDefined()
    expect(masteryCall![1]).toMatchObject({
      drillAccuracy: 2 / 3,
      mcqAccuracy: 0,
      totalAttempts: 3,
    })
  })

  it('does NOT write drillAccuracy when isRetry=true', () => {
    mockedLsGet.mockReturnValue(0 as never)

    const session = makeSession({ isRetry: true, unitSlug: 'unit-1' })
    handleSessionComplete(session, 'ap-psychology')

    const masteryKey = LS_KEYS.mastery('ap-psychology', 'unit-1')
    const masteryCall = mockedLsSet.mock.calls.find(([k]) => k === masteryKey)
    expect(masteryCall).toBeUndefined()
  })

  it('does NOT write any mastery key when unitSlug=all', () => {
    mockedLsGet.mockReturnValue(0 as never)

    const session = makeSession({ isRetry: false, unitSlug: 'all' })
    handleSessionComplete(session, 'ap-psychology')

    const masteryCall = mockedLsSet.mock.calls.find(([k]) =>
      (k as string).startsWith('ascendly_mastery_')
    )
    expect(masteryCall).toBeUndefined()
  })

  it('always increments totalQuestions for normal session', () => {
    mockedLsGet.mockImplementation((key: string, fallback: unknown) => {
      if (key === LS_KEYS.totalQuestions) return 10 as never
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: false, unitSlug: 'unit-1' })
    handleSessionComplete(session, 'ap-psychology')

    const totalCall = mockedLsSet.mock.calls.find(([k]) => k === LS_KEYS.totalQuestions)
    expect(totalCall).toBeDefined()
    expect(totalCall![1]).toBe(13) // 10 + 3 cards
  })

  it('always increments totalQuestions for retry session', () => {
    mockedLsGet.mockImplementation((key: string, fallback: unknown) => {
      if (key === LS_KEYS.totalQuestions) return 5 as never
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: true, unitSlug: 'unit-1' })
    handleSessionComplete(session, 'ap-psychology')

    const totalCall = mockedLsSet.mock.calls.find(([k]) => k === LS_KEYS.totalQuestions)
    expect(totalCall).toBeDefined()
    expect(totalCall![1]).toBe(8) // 5 + 3 cards
  })

  it('calls logEvent with correct fields for normal session', () => {
    mockedLsGet.mockImplementation((key: string, fallback: unknown) => {
      if (key === LS_KEYS.totalQuestions) return 0 as never
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: false, unitSlug: 'unit-1' })
    handleSessionComplete(session, 'ap-psychology')

    expect(mockedLogEvent).toHaveBeenCalledWith({
      event_type: 'drill_completed',
      subject: 'ap-psychology',
      unit: 'unit-1',
      metadata: {
        accuracy: 2 / 3,
        cards_count: 3,
        is_retry: false,
      },
    })
  })

  it('sets is_retry=true in logEvent metadata for retry sessions', () => {
    mockedLsGet.mockReturnValue(0 as never)

    const session = makeSession({ isRetry: true, unitSlug: 'unit-1' })
    handleSessionComplete(session, 'ap-psychology')

    expect(mockedLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ is_retry: true }),
      })
    )
  })
})

describe('normalizeCard', () => {
  it('swaps prompt/answer for definition_to_term so answer becomes the term', () => {
    const card = makeCard({ mode: 'definition_to_term', prompt: 'A nerve cell', answer: 'Neuron' })
    const result = normalizeCard(card)
    expect(result.term).toBe('Neuron')
    expect(result.definition).toBe('A nerve cell')
    expect(result.mode).toBe('definition_to_term')
  })

  it('keeps prompt as term for term_to_definition', () => {
    const card = makeCard({ mode: 'term_to_definition', prompt: 'Dopamine', answer: 'Neurotransmitter involved in reward' })
    const result = normalizeCard(card)
    expect(result.term).toBe('Dopamine')
    expect(result.definition).toBe('Neurotransmitter involved in reward')
  })

  it('keeps prompt as term for person_to_significance', () => {
    const card = makeCard({ mode: 'person_to_significance', prompt: 'Roger Sperry', answer: 'Split-brain research' })
    const result = normalizeCard(card)
    expect(result.term).toBe('Roger Sperry')
    expect(result.definition).toBe('Split-brain research')
  })

  it('keeps prompt as term for formula_to_type', () => {
    const card = makeCard({ mode: 'formula_to_type', prompt: "f'(x)", answer: 'Derivative' })
    const result = normalizeCard(card)
    expect(result.term).toBe("f'(x)")
    expect(result.definition).toBe('Derivative')
  })

  it('keeps prompt as term for event_to_date', () => {
    const card = makeCard({ mode: 'event_to_date', prompt: 'French Revolution', answer: '1789' })
    const result = normalizeCard(card)
    expect(result.term).toBe('French Revolution')
    expect(result.definition).toBe('1789')
  })

  it('keeps prompt as term for concept_to_example', () => {
    const card = makeCard({ mode: 'concept_to_example', prompt: 'Classical conditioning', answer: "Pavlov's dogs salivating at a bell" })
    const result = normalizeCard(card)
    expect(result.term).toBe('Classical conditioning')
    expect(result.definition).toBe("Pavlov's dogs salivating at a bell")
  })

  it('preserves id and katex_required', () => {
    const card = makeCard({ id: 'abc-123', mode: 'term_to_definition', katex_required: true })
    const result = normalizeCard(card)
    expect(result.id).toBe('abc-123')
    expect(result.katex_required).toBe(true)
  })
})
