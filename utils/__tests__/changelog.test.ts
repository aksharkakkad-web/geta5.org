import { findUnseen, type ChangelogEntry } from '../changelog'

const entries: ChangelogEntry[] = [
  { id: 'c', date: '2026-04-28', type: 'feature', title: 'C', body: 'c' },
  { id: 'b', date: '2026-04-27', type: 'fix', title: 'B', body: 'b' },
  { id: 'a', date: '2026-04-26', type: 'content', title: 'A', body: 'a' },
]

describe('findUnseen', () => {
  it('returns null when stored is empty (signal: silent first-visit init)', () => {
    expect(findUnseen(entries, '')).toBe(null)
    expect(findUnseen(entries, null)).toBe(null)
  })

  it('returns null when entries is empty regardless of stored value', () => {
    expect(findUnseen([], '')).toBe(null)
    expect(findUnseen([], 'something')).toEqual([])
  })

  it('returns empty array when stored matches latest', () => {
    expect(findUnseen(entries, 'c')).toEqual([])
  })

  it('returns all entries newer than stored, newest first', () => {
    expect(findUnseen(entries, 'a')).toEqual([entries[0], entries[1]])
    expect(findUnseen(entries, 'b')).toEqual([entries[0]])
  })

  it('returns all entries when stored id is unknown (treats as fully unseen)', () => {
    expect(findUnseen(entries, 'unknown-id')).toEqual(entries)
  })
})
