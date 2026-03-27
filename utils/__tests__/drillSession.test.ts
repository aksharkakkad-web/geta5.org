import { handleSessionComplete, insertRetryCard, RETRY_INTERVAL, SessionState, DrillCard, DrillMode, normalizeCard } from '../drillSession'
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
  function makeCard(mode: DrillMode, overrides: Partial<DrillCard> = {}): DrillCard {
    return {
      id: 'test-1',
      unit: 'unit-1',
      subject: 'ap-psychology',
      mode,
      prompt: 'PROMPT',
      answer: 'ANSWER',
      difficulty: 'medium',
      ...overrides,
    }
  }

  it('definition_to_term: term=answer, definition=prompt', () => {
    const card = makeCard('definition_to_term')
    const norm = normalizeCard(card)
    expect(norm.term).toBe('ANSWER')
    expect(norm.definition).toBe('PROMPT')
  })

  it('significance_to_person: term=prompt, definition=answer', () => {
    const card = makeCard('significance_to_person')
    const norm = normalizeCard(card)
    expect(norm.term).toBe('PROMPT')
    expect(norm.definition).toBe('ANSWER')
  })

  it('significance_to_event: term=prompt, definition=answer', () => {
    const card = makeCard('significance_to_event')
    const norm = normalizeCard(card)
    expect(norm.term).toBe('PROMPT')
    expect(norm.definition).toBe('ANSWER')
  })

  it('significance_to_case: term=prompt, definition=answer', () => {
    const card = makeCard('significance_to_case')
    const norm = normalizeCard(card)
    expect(norm.term).toBe('PROMPT')
    expect(norm.definition).toBe('ANSWER')
  })

  it('name_to_formula: term=prompt (formula name), definition=answer (KaTeX)', () => {
    const card = makeCard('name_to_formula', { katex_required: true })
    const norm = normalizeCard(card)
    expect(norm.term).toBe('PROMPT')
    expect(norm.definition).toBe('ANSWER')
  })

  it('concept_mc: term=prompt, definition=answer (may be undefined)', () => {
    const card = makeCard('concept_mc', {
      choices: [{ text: 'A', is_correct: true, explanation: 'Because A' }],
    })
    const norm = normalizeCard(card)
    expect(norm.term).toBe('PROMPT')
    // definition comes from answer — may be undefined for concept_mc
    expect(norm.definition).toBe('ANSWER')
  })

  it('preserves id and katex_required', () => {
    const card = makeCard('name_to_formula', { id: 'abc-123', katex_required: true })
    const result = normalizeCard(card)
    expect(result.id).toBe('abc-123')
    expect(result.katex_required).toBe(true)
  })
})

describe('insertRetryCard', () => {
  function card(id: string): DrillCard {
    return {
      id,
      unit: 'unit-1',
      subject: 'ap-psychology',
      mode: 'definition_to_term',
      prompt: `Prompt ${id}`,
      answer: `Answer ${id}`,
      difficulty: 'easy',
    }
  }

  it('inserts RETRY_INTERVAL+1 positions ahead of currentIndex', () => {
    // deck: [a, b, c, d, e], currentIndex=0
    // insertAt = min(0+3+1, 5) = 4
    // result: [a, b, c, d, a, e]
    const deck = [card('a'), card('b'), card('c'), card('d'), card('e')]
    const result = insertRetryCard(deck, deck[0], 0)
    expect(result.length).toBe(6)
    expect(result[4]).toEqual(deck[0])
  })

  it('inserts at end when deck is shorter than RETRY_INTERVAL', () => {
    // deck: [a, b], currentIndex=0
    // insertAt = min(0+3+1, 2) = 2
    // result: [a, b, a]
    const deck = [card('a'), card('b')]
    const result = insertRetryCard(deck, deck[0], 0)
    expect(result.length).toBe(3)
    expect(result[result.length - 1]).toEqual(deck[0])
  })

  it('does not mutate the original deck', () => {
    const deck = [card('a'), card('b'), card('c'), card('d'), card('e')]
    const snapshot = [...deck]
    insertRetryCard(deck, deck[0], 0)
    expect(deck).toEqual(snapshot)
  })

  it('handles currentIndex at the last card', () => {
    // deck: [a, b, c], currentIndex=2 (last card)
    // insertAt = min(2+3+1, 3) = 3 = end
    const deck = [card('a'), card('b'), card('c')]
    const result = insertRetryCard(deck, deck[2], 2)
    expect(result.length).toBe(4)
    expect(result[3]).toEqual(deck[2])
  })

  it('works with mid-session currentIndex', () => {
    // deck: [a, b, c, d, e, f, g], currentIndex=2
    // insertAt = min(2+3+1, 7) = 6
    // result: [a, b, c, d, e, f, c, g]
    const deck = [card('a'), card('b'), card('c'), card('d'), card('e'), card('f'), card('g')]
    const result = insertRetryCard(deck, deck[2], 2)
    expect(result.length).toBe(8)
    expect(result[6]).toEqual(deck[2])
  })
})
