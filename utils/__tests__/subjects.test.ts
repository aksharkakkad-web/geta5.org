import { getSubject, getAllSubjects } from '@/utils/subjects'

describe('getSubject', () => {
  it('spot-checks all 7 exam dates are in May 2026', () => {
    getAllSubjects().forEach(s => {
      expect(s.examDate).toMatch(/^2026-05-/)
    })
  })

  it('returns the subject for a valid slug', () => {
    const s = getSubject('ap-psychology')
    expect(s).toBeDefined()
    expect(s!.name).toBe('AP Psychology')
    expect(s!.slug).toBe('ap-psychology')
  })

  it('returns undefined for an invalid slug', () => {
    expect(getSubject('ap-physics')).toBeUndefined()
    expect(getSubject('')).toBeUndefined()
    expect(getSubject('AP-PSYCHOLOGY')).toBeUndefined()
  })

  it('includes an ISO examDate string', () => {
    const s = getSubject('ap-chemistry')
    expect(s!.examDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('includes a non-empty units array', () => {
    const s = getSubject('ap-calculus-ab')
    expect(Array.isArray(s!.units)).toBe(true)
    expect(s!.units.length).toBeGreaterThan(0)
    expect(s!.units[0]).toHaveProperty('number')
    expect(s!.units[0]).toHaveProperty('name')
  })
})

describe('getAllSubjects', () => {
  it('returns exactly 7 subjects', () => {
    expect(getAllSubjects()).toHaveLength(7)
  })

  it('every subject has required fields', () => {
    getAllSubjects().forEach(s => {
      expect(s.slug).toBeTruthy()
      expect(s.name).toBeTruthy()
      expect(s.examDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(s.units.length).toBeGreaterThan(0)
    })
  })

  it('unit counts match College Board curricula', () => {
    const counts: Record<string, number> = {
      'ap-psychology': 8,
      'ap-world-history': 9,
      'ap-government': 5,
      'ap-calculus-ab': 8,
      'ap-precalculus': 4,
      'ap-csp': 5,
      'ap-chemistry': 9,
    }
    getAllSubjects().forEach(s => {
      expect(s.units).toHaveLength(counts[s.slug])
    })
  })
})
