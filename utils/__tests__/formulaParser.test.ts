import { parseFormula, compareFormulas } from '../formulaParser'

describe('parseFormula', () => {
  it('wraps single-char superscripts in braces', () => {
    expect(parseFormula('x^2')).toBe('x^{2}')
  })

  it('leaves multi-char superscripts already in braces alone', () => {
    expect(parseFormula('x^{10}')).toBe('x^{10}')
  })

  it('wraps single-char subscripts in braces', () => {
    expect(parseFormula('x_0')).toBe('x_{0}')
  })

  it('converts (a)/(b) to \\frac{a}{b}', () => {
    expect(parseFormula('(a)/(b)')).toBe('\\frac{a}{b}')
  })

  it('converts fraction with expressions', () => {
    expect(parseFormula('(-b)/(2a)')).toBe('\\frac{-b}{2a}')
  })

  it('converts sqrt(x) to \\sqrt{x}', () => {
    expect(parseFormula('sqrt(x)')).toBe('\\sqrt{x}')
  })

  it('converts sqrt with expression', () => {
    expect(parseFormula('sqrt(b^{2} - 4ac)')).toBe('\\sqrt{b^{2} - 4ac}')
  })

  it('converts +- to \\pm', () => {
    expect(parseFormula('x +- y')).toBe('x \\pm y')
  })

  it('converts inf to \\infty', () => {
    expect(parseFormula('inf')).toBe('\\infty')
  })

  it('converts int(f) to \\int f', () => {
    expect(parseFormula('int(f)')).toBe('\\int f')
  })

  it('converts Delta to \\Delta (word boundary)', () => {
    expect(parseFormula('Delta x')).toBe('\\Delta x')
  })

  it('converts theta to \\theta', () => {
    expect(parseFormula('theta')).toBe('\\theta')
  })

  it('converts pi to \\pi but does not mangle words containing "pi"', () => {
    expect(parseFormula('2 pi r')).toBe('2 \\pi r')
    expect(parseFormula('spine')).toBe('spine')
  })

  it('converts lambda to \\lambda', () => {
    expect(parseFormula('lambda')).toBe('\\lambda')
  })

  it('converts mu to \\mu', () => {
    expect(parseFormula('mu')).toBe('\\mu')
  })

  it('leaves already-valid KaTeX untouched', () => {
    expect(parseFormula('\\frac{a}{b}')).toBe('\\frac{a}{b}')
  })
})

describe('compareFormulas', () => {
  it('matches identical input', () => {
    expect(compareFormulas('x^{2}', 'x^{2}')).toBe(true)
  })

  it('matches after parsing simple notation', () => {
    expect(compareFormulas('x^2', 'x^{2}')).toBe(true)
  })

  it('ignores whitespace differences', () => {
    expect(compareFormulas('x + y', 'x+y')).toBe(true)
  })

  it('matches fraction written in shorthand vs canonical KaTeX', () => {
    expect(compareFormulas('(a)/(b)', '\\frac{a}{b}')).toBe(true)
  })

  it('rejects wrong formula', () => {
    expect(compareFormulas('x^2', 'x^{3}')).toBe(false)
  })

  it('rejects empty input', () => {
    expect(compareFormulas('', 'x^{2}')).toBe(false)
  })
})
