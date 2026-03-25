import { AP_TEST_CONFIG, TestConfig } from '@/utils/testConfig'

describe('AP_TEST_CONFIG', () => {
  const expectedSubjects = [
    'ap-psychology',
    'ap-world-history',
    'ap-government',
    'ap-calculus-ab',
    'ap-precalculus',
    'ap-csp',
    'ap-chemistry',
  ]

  test('Test 1: has entries for all 7 subject slugs', () => {
    expectedSubjects.forEach(slug => {
      expect(AP_TEST_CONFIG).toHaveProperty(slug)
    })
  })

  test('Test 2: ap-psychology config is { questionCount: 75, durationMinutes: 90 }', () => {
    expect(AP_TEST_CONFIG['ap-psychology']).toEqual({ questionCount: 75, durationMinutes: 90 })
  })

  test('Test 3: ap-world-history config is { questionCount: 55, durationMinutes: 55 }', () => {
    expect(AP_TEST_CONFIG['ap-world-history']).toEqual({ questionCount: 55, durationMinutes: 55 })
  })

  test('Test 4: ap-government config is { questionCount: 55, durationMinutes: 80 }', () => {
    expect(AP_TEST_CONFIG['ap-government']).toEqual({ questionCount: 55, durationMinutes: 80 })
  })

  test('Test 5: ap-calculus-ab config is { questionCount: 45, durationMinutes: 105 }', () => {
    expect(AP_TEST_CONFIG['ap-calculus-ab']).toEqual({ questionCount: 45, durationMinutes: 105 })
  })

  test('Test 6: ap-precalculus config is { questionCount: 40, durationMinutes: 120 }', () => {
    expect(AP_TEST_CONFIG['ap-precalculus']).toEqual({ questionCount: 40, durationMinutes: 120 })
  })

  test('Test 7: ap-csp config is { questionCount: 70, durationMinutes: 120 }', () => {
    expect(AP_TEST_CONFIG['ap-csp']).toEqual({ questionCount: 70, durationMinutes: 120 })
  })

  test('Test 8: ap-chemistry config is { questionCount: 60, durationMinutes: 90 }', () => {
    expect(AP_TEST_CONFIG['ap-chemistry']).toEqual({ questionCount: 60, durationMinutes: 90 })
  })

  test('Test 9: every config has questionCount > 0 and durationMinutes > 0', () => {
    expectedSubjects.forEach(slug => {
      const config: TestConfig = AP_TEST_CONFIG[slug]
      expect(config.questionCount).toBeGreaterThan(0)
      expect(config.durationMinutes).toBeGreaterThan(0)
    })
  })
})
