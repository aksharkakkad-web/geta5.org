import { composeTest, computePerUnitAccuracy, handleTestComplete, TestSessionState, TestAnswer, PerUnitResult } from '@/utils/testSession'
import { MCQ } from '@/utils/mcqSession'

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@/utils/localStorage', () => ({
  lsGet: jest.fn(),
  lsSet: jest.fn(),
  LS_KEYS: {
    streak: 'ascendly_streak',
    mastery: (subject: string, unit: string) => `ascendly_mastery_${subject}_${unit}`,
    score: (subject: string) => `ascendly_score_${subject}`,
    totalQuestions: 'ascendly_total_questions',
    activeSubject: 'ascendly_active_subject',
  },
}))

jest.mock('@/utils/analytics', () => ({
  logEvent: jest.fn(),
}))

// Default: scramble is identity (deterministic), overridden in Test 6
jest.mock('@/utils/scramble', () => ({
  scramble: jest.fn((arr: unknown[]) => [...arr]),
}))

import { lsGet, lsSet } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'
import { scramble } from '@/utils/scramble'

const mockLsGet = lsGet as jest.Mock
const mockLsSet = lsSet as jest.Mock
const mockLogEvent = logEvent as jest.Mock
const mockScramble = scramble as jest.Mock

// ─── Fixture factory ────────────────────────────────────────────────────────

let _idCounter = 0
function makeMCQ(overrides: Partial<MCQ> = {}): MCQ {
  _idCounter++
  return {
    id: `q${_idCounter}`,
    unit: 'unit-1',
    subject: 'ap-psychology',
    difficulty: 'medium',
    stimulus: { type: 'none' },
    question: `Question ${_idCounter}`,
    choices: [
      { id: 'A', text: 'Choice A', is_correct: true, explanation: 'Correct' },
      { id: 'B', text: 'Choice B', is_correct: false, explanation: 'Wrong' },
      { id: 'C', text: 'Choice C', is_correct: false, explanation: 'Wrong' },
      { id: 'D', text: 'Choice D', is_correct: false, explanation: 'Wrong' },
    ],
    unit_objective: 'Test objective',
    ...overrides,
  }
}

function makeSessionState(overrides: Partial<TestSessionState> = {}): TestSessionState {
  const q1 = makeMCQ({ id: 's-q1' })
  const q2 = makeMCQ({ id: 's-q2' })
  return {
    questions: [q1, q2],
    answers: {
      's-q1': { selectedChoiceId: 'A', isCorrect: true },
      's-q2': { selectedChoiceId: 'B', isCorrect: false },
    },
    flagged: {},
    currentIndex: 0,
    timed: true,
    showTimer: true,
    durationSeconds: 5400,
    subjectSlug: 'ap-psychology',
    ...overrides,
  }
}

// ─── Reset mocks before each test ──────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  _idCounter = 0
  // Default scramble = identity
  mockScramble.mockImplementation((arr: unknown[]) => [...arr])
  // Default lsGet returns 0 for totalQuestions
  mockLsGet.mockReturnValue(0)
})

// ─── composeTest tests ──────────────────────────────────────────────────────

describe('composeTest', () => {
  test('Test 1: returns exactly targetCount questions when all units have enough', () => {
    const unit1Qs = Array.from({ length: 10 }, () => makeMCQ({ unit: 'unit-1' }))
    const unit2Qs = Array.from({ length: 10 }, () => makeMCQ({ unit: 'unit-2' }))
    const qByUnit = new Map([['unit-1', unit1Qs], ['unit-2', unit2Qs]])
    const result = composeTest(qByUnit, 8)
    expect(result).toHaveLength(8)
  })

  test('Test 2: with 4 units and targetCount=8, each unit contributes 2 questions (proportional)', () => {
    const units = ['unit-1', 'unit-2', 'unit-3', 'unit-4']
    const qByUnit = new Map(
      units.map(u => [u, Array.from({ length: 10 }, () => makeMCQ({ unit: u }))])
    )
    const result = composeTest(qByUnit, 8)
    expect(result).toHaveLength(8)
    // Each unit should contribute exactly 2
    units.forEach(u => {
      const unitCount = result.filter(q => q.unit === u).length
      expect(unitCount).toBe(2)
    })
  })

  test('Test 3: when one unit has fewer than its quota, backfills from other units', () => {
    const unit1Qs = Array.from({ length: 1 }, () => makeMCQ({ unit: 'unit-1' })) // only 1 (quota would be 2)
    const unit2Qs = Array.from({ length: 10 }, () => makeMCQ({ unit: 'unit-2' }))
    const qByUnit = new Map([['unit-1', unit1Qs], ['unit-2', unit2Qs]])
    const result = composeTest(qByUnit, 4)
    // Should still get 4 total by backfilling from unit-2
    expect(result).toHaveLength(4)
  })

  test('Test 4: returns all available questions when total available < targetCount', () => {
    const unit1Qs = Array.from({ length: 2 }, () => makeMCQ({ unit: 'unit-1' }))
    const unit2Qs = Array.from({ length: 2 }, () => makeMCQ({ unit: 'unit-2' }))
    const qByUnit = new Map([['unit-1', unit1Qs], ['unit-2', unit2Qs]])
    const result = composeTest(qByUnit, 100)
    expect(result).toHaveLength(4) // only 4 available
  })

  test('Test 5: returns empty array when no questions provided', () => {
    const qByUnit = new Map<string, MCQ[]>()
    const result = composeTest(qByUnit, 10)
    expect(result).toEqual([])
  })

  test('Test 6: final output is shuffled (scramble called on final array)', () => {
    let scrambleCalled = false
    mockScramble.mockImplementation((arr: unknown[]) => {
      scrambleCalled = true
      return [...arr].reverse() // non-identity to verify it was called
    })
    const unit1Qs = Array.from({ length: 5 }, () => makeMCQ({ unit: 'unit-1' }))
    const qByUnit = new Map([['unit-1', unit1Qs]])
    composeTest(qByUnit, 3)
    expect(scrambleCalled).toBe(true)
  })
})

// ─── computePerUnitAccuracy tests ───────────────────────────────────────────

describe('computePerUnitAccuracy', () => {
  test('Test 7: correctly groups questions by unit and computes accuracy per unit', () => {
    const q1 = makeMCQ({ id: 'q-u1-1', unit: 'unit-1' })
    const q2 = makeMCQ({ id: 'q-u1-2', unit: 'unit-1' })
    const q3 = makeMCQ({ id: 'q-u2-1', unit: 'unit-2' })
    const questions = [q1, q2, q3]
    const answers: Record<string, TestAnswer> = {
      'q-u1-1': { selectedChoiceId: 'A', isCorrect: true },
      'q-u1-2': { selectedChoiceId: 'B', isCorrect: false },
      'q-u2-1': { selectedChoiceId: 'A', isCorrect: true },
    }
    const results = computePerUnitAccuracy(questions, answers)
    const u1 = results.find(r => r.unitNumber === 'unit-1')
    const u2 = results.find(r => r.unitNumber === 'unit-2')
    expect(u1).toBeDefined()
    expect(u1!.correct).toBe(1)
    expect(u1!.total).toBe(2)
    expect(u1!.accuracy).toBeCloseTo(0.5)
    expect(u2).toBeDefined()
    expect(u2!.correct).toBe(1)
    expect(u2!.total).toBe(1)
    expect(u2!.accuracy).toBeCloseTo(1.0)
  })

  test('Test 8: unanswered questions count as incorrect (not in answers map)', () => {
    const q1 = makeMCQ({ id: 'q-ans', unit: 'unit-1' })
    const q2 = makeMCQ({ id: 'q-unans', unit: 'unit-1' }) // unanswered
    const questions = [q1, q2]
    const answers: Record<string, TestAnswer> = {
      'q-ans': { selectedChoiceId: 'A', isCorrect: true },
      // q-unans not in answers
    }
    const results = computePerUnitAccuracy(questions, answers)
    const u1 = results.find(r => r.unitNumber === 'unit-1')
    expect(u1!.correct).toBe(1)
    expect(u1!.total).toBe(2)
    expect(u1!.accuracy).toBeCloseTo(0.5)
  })

  test('Test 9: returns empty array for empty questions array', () => {
    const results = computePerUnitAccuracy([], {})
    expect(results).toEqual([])
  })
})

// ─── handleTestComplete tests ────────────────────────────────────────────────

describe('handleTestComplete', () => {
  test('Test 10: writes ascendly_score_[subject] with projectedScore and accuracy', () => {
    const session = makeSessionState()
    // 1 correct out of 2 = 0.5 accuracy → projectScore(0.5) = 3
    handleTestComplete(session, 'ap-psychology')
    expect(mockLsSet).toHaveBeenCalledWith(
      'ascendly_score_ap-psychology',
      expect.objectContaining({
        projectedScore: 3,
        accuracy: 0.5,
      })
    )
  })

  test('Test 11: increments ascendly_total_questions by number of questions', () => {
    mockLsGet.mockReturnValue(10) // existing total = 10
    const session = makeSessionState() // 2 questions
    handleTestComplete(session, 'ap-psychology')
    expect(mockLsSet).toHaveBeenCalledWith('ascendly_total_questions', 12)
  })

  test('Test 12: calls logEvent with event_type test_completed, subject, and metadata', () => {
    const session = makeSessionState()
    handleTestComplete(session, 'ap-psychology')
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'test_completed',
        subject: 'ap-psychology',
        metadata: expect.objectContaining({
          total: 2,
          correct: 1,
          timed: true,
          projected_score: 3,
        }),
      })
    )
  })

  test('Test 13: does NOT write to any mastery key (per D-24)', () => {
    const session = makeSessionState()
    handleTestComplete(session, 'ap-psychology')
    const masteryCallArgs = mockLsSet.mock.calls.filter(
      ([key]: [string]) => typeof key === 'string' && key.startsWith('ascendly_mastery_')
    )
    expect(masteryCallArgs).toHaveLength(0)
  })
})
