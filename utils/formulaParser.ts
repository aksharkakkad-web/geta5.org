/**
 * Simple notation → KaTeX converter for name_to_formula drill cards.
 *
 * Students type shorthand (x^2, (a)/(b), sqrt(x), Delta, etc.).
 * This module converts their input to a KaTeX string for live preview
 * and for comparison against the canonical answer.
 */

const GREEK: Record<string, string> = {
  Delta: '\\Delta', delta: '\\delta',
  Theta: '\\Theta', theta: '\\theta',
  Pi: '\\Pi',       pi: '\\pi',
  Lambda: '\\Lambda', lambda: '\\lambda',
  Alpha: '\\Alpha', alpha: '\\alpha',
  Beta: '\\Beta',   beta: '\\beta',
  Gamma: '\\Gamma', gamma: '\\gamma',
  Sigma: '\\Sigma', sigma: '\\sigma',
  Mu: '\\Mu',       mu: '\\mu',
  Epsilon: '\\Epsilon', epsilon: '\\epsilon',
  Phi: '\\Phi',     phi: '\\phi',
  Omega: '\\Omega', omega: '\\omega',
}

/**
 * Convert simple student notation to a KaTeX string.
 * Safe to call on every keystroke — never throws.
 */
export function parseFormula(input: string): string {
  let s = input

  // Greek letters — whole-word only to avoid substring collisions
  for (const [word, katex] of Object.entries(GREEK)) {
    s = s.replace(new RegExp(`\\b${word}\\b`, 'g'), katex)
  }

  // Symbols
  s = s.replace(/\+-/g, '\\pm')
  s = s.replace(/\binf\b/g, '\\infty')

  // Functions: sqrt(expr) → \sqrt{expr}
  s = s.replace(/\bsqrt\(([^)]+)\)/g, '\\sqrt{$1}')

  // Functions: int(expr) → \int expr
  s = s.replace(/\bint\(([^)]+)\)/g, '\\int $1')

  // Fractions: (num)/(den) → \frac{num}{den}
  s = s.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}')

  // Superscripts: x^a (single char, not already braced) → x^{a}
  s = s.replace(/\^([a-zA-Z0-9])(?!\{)/g, '^{$1}')

  // Subscripts: x_a (single char, not already braced) → x_{a}
  s = s.replace(/_([a-zA-Z0-9])(?!\{)/g, '_{$1}')

  return s
}

/**
 * Compare student input against canonical KaTeX answer.
 * Both sides run through parseFormula so shorthand notation is accepted.
 * Whitespace differences are ignored.
 */
export function compareFormulas(student: string, canonical: string): boolean {
  if (!student.trim()) return false
  const normalize = (s: string) => parseFormula(s).replace(/\s+/g, '').toLowerCase()
  return normalize(student) === normalize(canonical)
}
