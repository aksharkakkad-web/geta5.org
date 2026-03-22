import { fuzzyMatch } from '../fuzzyMatch'

describe('fuzzyMatch', () => {
  it('exact match returns true', () => expect(fuzzyMatch('neuron', 'neuron')).toBe(true))
  it('case insensitive match', () => expect(fuzzyMatch('NEURON', 'neuron')).toBe(true))
  it('within tolerance (1 edit for short word)', () => expect(fuzzyMatch('neron', 'neuron')).toBe(true))
  it('rejects clearly wrong answer', () => expect(fuzzyMatch('synapse', 'neuron')).toBe(false))
  it('accepts alternate answer', () => expect(fuzzyMatch('nerve cell', 'neuron', ['nerve cell'])).toBe(true))
  it('trims whitespace', () => expect(fuzzyMatch('  neuron  ', 'neuron')).toBe(true))
})
