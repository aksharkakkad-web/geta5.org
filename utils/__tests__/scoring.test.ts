import { projectScore } from '../scoring'

describe('projectScore', () => {
  it('returns 5 for accuracy >= 0.80', () => expect(projectScore(0.85)).toBe(5))
  it('returns 4 for accuracy in [0.65, 0.80)', () => expect(projectScore(0.70)).toBe(4))
  it('returns 3 for accuracy in [0.50, 0.65)', () => expect(projectScore(0.55)).toBe(3))
  it('returns 2 for accuracy in [0.35, 0.50)', () => expect(projectScore(0.40)).toBe(2))
  it('returns 1 for accuracy < 0.35', () => expect(projectScore(0.10)).toBe(1))
  it('clamps values above 1', () => expect(projectScore(1.5)).toBe(5))
  it('clamps values below 0', () => expect(projectScore(-0.5)).toBe(1))
  it('handles exact boundary 0.80', () => expect(projectScore(0.80)).toBe(5))
})
