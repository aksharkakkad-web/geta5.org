import { fuzzyMatch } from '../fuzzyMatch'

describe('fuzzyMatch — baseline', () => {
  it('exact match returns true', () => expect(fuzzyMatch('neuron', 'neuron')).toBe(true))
  it('case insensitive match', () => expect(fuzzyMatch('NEURON', 'neuron')).toBe(true))
  it('within tolerance (1 edit for short word)', () => expect(fuzzyMatch('neron', 'neuron')).toBe(true))
  it('rejects clearly wrong answer', () => expect(fuzzyMatch('synapse', 'neuron')).toBe(false))
  it('accepts alternate answer', () => expect(fuzzyMatch('nerve cell', 'neuron', ['nerve cell'])).toBe(true))
  it('trims whitespace', () => expect(fuzzyMatch('  neuron  ', 'neuron')).toBe(true))
})

describe('fuzzyMatch — parenthetical expansion', () => {
  it('accepts answer without parenthetical', () =>
    expect(fuzzyMatch('Necessary and Proper Clause', 'Necessary and Proper (Elastic) Clause')).toBe(true))
  it('accepts inner term with suffix (elastic clause)', () =>
    expect(fuzzyMatch('elastic clause', 'Necessary and Proper (Elastic) Clause')).toBe(true))
  it('accepts case-insensitive inner term', () =>
    expect(fuzzyMatch('Elastic Clause', 'Necessary and Proper (Elastic) Clause')).toBe(true))
  it('rejects bare inner term without required suffix', () =>
    expect(fuzzyMatch('elastic', 'Necessary and Proper (Elastic) Clause')).toBe(false))
  it('accepts full answer with parens', () =>
    expect(fuzzyMatch('Necessary and Proper (Elastic) Clause', 'Necessary and Proper (Elastic) Clause')).toBe(true))
  it('does not expand short parentheticals as standalone candidates', () =>
    expect(fuzzyMatch('a clause', 'Something (a) Clause')).toBe(false))
})

describe('fuzzyMatch — Federalist/Brutus pattern', () => {
  it('accepts "federalist 10" for "Federalist No. 10"', () =>
    expect(fuzzyMatch('federalist 10', 'Federalist No. 10')).toBe(true))
  it('accepts "fed 10"', () =>
    expect(fuzzyMatch('fed 10', 'Federalist No. 10')).toBe(true))
  it('accepts "fed. no. 10"', () =>
    expect(fuzzyMatch('fed. no. 10', 'Federalist No. 10')).toBe(true))
  it('accepts "Federalist 10" (no "No.")', () =>
    expect(fuzzyMatch('Federalist 10', 'Federalist No. 10')).toBe(true))
  it('rejects bare "10" — too vague', () =>
    expect(fuzzyMatch('10', 'Federalist No. 10')).toBe(false))
  it('rejects bare "51" for Federalist No. 51', () =>
    expect(fuzzyMatch('51', 'Federalist No. 51')).toBe(false))
  it('accepts "brutus 1" for "Brutus No. 1"', () =>
    expect(fuzzyMatch('brutus 1', 'Brutus No. 1')).toBe(true))
  it('accepts "brutus no. 1"', () =>
    expect(fuzzyMatch('brutus no. 1', 'Brutus No. 1')).toBe(true))
  it('rejects bare "1" for Brutus No. 1', () =>
    expect(fuzzyMatch('1', 'Brutus No. 1')).toBe(false))
  it('does not cross-match — fed 10 does not match Federalist No. 51', () =>
    expect(fuzzyMatch('fed 10', 'Federalist No. 51')).toBe(false))
})

describe('fuzzyMatch — roman numeral normalization', () => {
  it('accepts "World War 1" for "World War I"', () =>
    expect(fuzzyMatch('World War 1', 'World War I')).toBe(true))
  it('accepts "World War 2" for "World War II"', () =>
    expect(fuzzyMatch('World War 2', 'World War II')).toBe(true))
  it('accepts "Amendment 14" for "Amendment XIV"', () =>
    expect(fuzzyMatch('Amendment 14', 'Amendment XIV')).toBe(true))
  it('accepts roman numeral input for arabic answer', () =>
    expect(fuzzyMatch('World War II', 'World War 2')).toBe(true))
  it('rejects bare "1" for "World War I"', () =>
    expect(fuzzyMatch('1', 'World War I')).toBe(false))
})

describe('fuzzyMatch — accepted_answers alternates', () => {
  it('accepted_answers are tried alongside canonical', () =>
    expect(fuzzyMatch('fed govt', 'Federal Government', ['fed govt'])).toBe(true))
  it('accepted_answers also get parenthetical expansion', () =>
    expect(fuzzyMatch('elastic clause', 'Something', ['Necessary and Proper (Elastic) Clause'])).toBe(true))
})
