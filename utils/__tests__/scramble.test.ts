import { scramble } from '../scramble'

describe('scramble', () => {
  it('preserves all elements', () => {
    const input = ['A', 'B', 'C', 'D']
    const result = scramble(input)
    expect([...result].sort()).toEqual([...input].sort())
  })
  it('preserves length', () => {
    expect(scramble([1, 2, 3, 4]).length).toBe(4)
  })
  it('does not mutate input array', () => {
    const input = [1, 2, 3, 4]
    scramble(input)
    expect(input).toEqual([1, 2, 3, 4])
  })
})
