import { handleMCQSessionComplete, MCQSessionState, MCQ, MCQChoice } from '../mcqSession'
import { lsGet, lsSet, LS_KEYS } from '../localStorage'
import { logEvent } from '../analytics'
import { scramble } from '../scramble'

jest.mock('../localStorage')
jest.mock('../analytics')

const mockedLsGet = lsGet as jest.MockedFunction<typeof lsGet>
const mockedLsSet = lsSet as jest.MockedFunction<typeof lsSet>
const mockedLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

function makeChoice(overrides: Partial<MCQChoice> = {}): MCQChoice {
  return {
    id: 'A',
    text: 'Choice A',
    is_correct: false,
    explanation: 'This is the explanation for A',
    ...overrides,
  }
}

function makeQuestion(overrides: Partial<MCQ> = {}): MCQ {
  return {
    id: 'mcq-u1-001',
    unit: 'unit-1',
    subject: 'ap-psychology',
    difficulty: 'medium',
    stimulus: { type: 'none' },
    question: 'What is psychology?',
    choices: [
      makeChoice({ id: 'A', text: 'Study of behavior', is_correct: true, explanation: 'Correct!' }),
      makeChoice({ id: 'B', text: 'Study of rocks', is_correct: false, explanation: 'Geology' }),
      makeChoice({ id: 'C', text: 'Study of plants', is_correct: false, explanation: 'Botany' }),
      makeChoice({ id: 'D', text: 'Study of animals', is_correct: false, explanation: 'Zoology' }),
    ],
    unit_objective: 'Define psychology',
    ...overrides,
  }
}

function makeSession(overrides: Partial<MCQSessionState> = {}): MCQSessionState {
  return {
    questions: [
      makeQuestion({ id: 'q1' }),
      makeQuestion({ id: 'q2' }),
      makeQuestion({ id: 'q3' }),
    ],
    answers: {
      q1: { selectedChoiceId: 'A', isCorrect: true },
      q2: { selectedChoiceId: 'A', isCorrect: true },
      q3: { selectedChoiceId: 'B', isCorrect: false },
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

describe('handleMCQSessionComplete', () => {
  it('Test 1: writes mcqAccuracy to localStorage for normal session', () => {
    mockedLsGet.mockImplementation((key: string) => {
      if (key === LS_KEYS.totalQuestions) return 0 as never
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: false, unitSlug: 'unit-1' })
    handleMCQSessionComplete(session, 'ap-psychology')

    const masteryKey = LS_KEYS.mastery('ap-psychology', 'unit-1')
    const masteryCall = mockedLsSet.mock.calls.find(([k]) => k === masteryKey)
    expect(masteryCall).toBeDefined()
    expect(masteryCall![1]).toMatchObject({
      mcqAccuracy: 2 / 3,
      drillAccuracy: 0,
      totalAttempts: 3,
    })
  })

  it('Test 2: does NOT write mcqAccuracy when isRetry=true, but still increments totalQuestions', () => {
    mockedLsGet.mockImplementation((key: string) => {
      if (key === LS_KEYS.totalQuestions) return 5 as never
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: true, unitSlug: 'unit-1' })
    handleMCQSessionComplete(session, 'ap-psychology')

    const masteryKey = LS_KEYS.mastery('ap-psychology', 'unit-1')
    const masteryCall = mockedLsSet.mock.calls.find(([k]) => k === masteryKey)
    expect(masteryCall).toBeUndefined()

    const totalCall = mockedLsSet.mock.calls.find(([k]) => k === LS_KEYS.totalQuestions)
    expect(totalCall).toBeDefined()
    expect(totalCall![1]).toBe(8) // 5 + 3 questions
  })

  it('Test 3: does NOT write any mastery key when unitSlug=all, but increments totalQuestions', () => {
    mockedLsGet.mockImplementation((key: string) => {
      if (key === LS_KEYS.totalQuestions) return 10 as never
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: false, unitSlug: 'all' })
    handleMCQSessionComplete(session, 'ap-psychology')

    const masteryCall = mockedLsSet.mock.calls.find(([k]) =>
      (k as string).startsWith('ascendly_mastery_')
    )
    expect(masteryCall).toBeUndefined()

    const totalCall = mockedLsSet.mock.calls.find(([k]) => k === LS_KEYS.totalQuestions)
    expect(totalCall).toBeDefined()
    expect(totalCall![1]).toBe(13) // 10 + 3 questions
  })

  it('Test 4: always increments LS_KEYS.totalQuestions by session.questions.length', () => {
    mockedLsGet.mockImplementation((key: string) => {
      if (key === LS_KEYS.totalQuestions) return 20 as never
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: false, unitSlug: 'unit-1' })
    handleMCQSessionComplete(session, 'ap-psychology')

    const totalCall = mockedLsSet.mock.calls.find(([k]) => k === LS_KEYS.totalQuestions)
    expect(totalCall).toBeDefined()
    expect(totalCall![1]).toBe(23) // 20 + 3 questions
  })

  it('Test 5: always calls logEvent with event_type mcq_completed and correct metadata', () => {
    mockedLsGet.mockImplementation((key: string) => {
      if (key === LS_KEYS.totalQuestions) return 0 as never
      return { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 } as never
    })

    const session = makeSession({ isRetry: false, unitSlug: 'unit-1' })
    handleMCQSessionComplete(session, 'ap-psychology')

    expect(mockedLogEvent).toHaveBeenCalledWith({
      event_type: 'mcq_completed',
      subject: 'ap-psychology',
      unit: 'unit-1',
      metadata: {
        accuracy: 2 / 3,
        question_count: 3,
        is_retry: false,
      },
    })
  })

  it('Test 6: scramble produces no positional bias — correct answer appears at each of 4 positions across 100 runs', () => {
    const choices: MCQChoice[] = [
      { id: 'A', text: 'Correct', is_correct: true, explanation: 'Right' },
      { id: 'B', text: 'Wrong1', is_correct: false, explanation: 'Nope' },
      { id: 'C', text: 'Wrong2', is_correct: false, explanation: 'Nope' },
      { id: 'D', text: 'Wrong3', is_correct: false, explanation: 'Nope' },
    ]

    // Track which positions the correct answer (is_correct=true) appears at
    const positionCounts = [0, 0, 0, 0]
    for (let i = 0; i < 100; i++) {
      const shuffled = scramble(choices)
      const correctIndex = shuffled.findIndex(c => c.is_correct)
      positionCounts[correctIndex]++
    }

    // Each position must have received the correct answer at least once
    positionCounts.forEach((count, idx) => {
      expect(count).toBeGreaterThan(0)
    })
  })
})
