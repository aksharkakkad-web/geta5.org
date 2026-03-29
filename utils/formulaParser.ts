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
 *
 * Operation order (matters):
 *  1. Greek letters & symbols
 *  2. Functions: sqrt(...) → \sqrt{...}, int(...) → \int ...
 *  3. Explicit grouped fractions: (a+b)/(c+d) → \frac{a+b}{c+d}
 *  4. Simple token fractions: a/b → \frac{a}{b}  (loop, left-associative)
 *     Token = adjacent chars with no +/- separators; {} blocks treated as units
 *     so \sqrt{x}, x^2, 2x etc. are each one token.
 *  5. Superscript / subscript bracing — runs AFTER fractions so x^2
 *     is captured as a single token in step 4.
 */
export function parseFormula(input: string): string {
  let s = input

  // 1. Greek letters — whole-word only to avoid substring collisions
  for (const [word, katex] of Object.entries(GREEK)) {
    s = s.replace(new RegExp(`\\b${word}\\b`, 'g'), katex)
  }

  // 1b. Symbols
  s = s.replace(/\+-/g, '\\pm')
  s = s.replace(/\binf\b/g, '\\infty')

  // 2. Functions: sqrt(expr) → \sqrt{expr},  int(expr) → \int expr
  s = s.replace(/\bsqrt\(([^)]+)\)/g, '\\sqrt{$1}')
  s = s.replace(/\bint\(([^)]+)\)/g, '\\int $1')

  // 3. Explicit grouped fractions: (num)/(den) → \frac{num}{den}
  s = s.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}')

  // 4. Simple token fractions: a/b → \frac{a}{b}
  //    A token is: one or more non-separator chars  [^+\-/\s{}]
  //    optionally followed by one or more {}-braced blocks (e.g. \sqrt{x}, \frac{a}{b}).
  //    +  and  -  act as separators so  a+b/c+d  →  a+\frac{b}{c}+d.
  //    Loop for left-associativity: a/b/c → \frac{\frac{a}{b}}{c}.
  const TOKEN = '[^+\\-\\/\\s{}]+(?:\\{[^{}]*\\}[^+\\-\\/\\s{}]*)*'
  const simpleFrac = new RegExp(`(${TOKEN})\\/(${TOKEN})`)
  let guard = 30
  while (guard-- > 0 && simpleFrac.test(s)) {
    s = s.replace(simpleFrac, '\\frac{$1}{$2}')
  }

  // 5. Superscripts — most specific patterns first
  // 5a. Function-call exponent: x^log(x) → x^{log(x)},  x^sin(theta) → x^{sin(theta)}
  s = s.replace(/\^([a-zA-Z]+\([^)]*\))/g, '^{$1}')
  // 5b. Parenthesized exponent: x^(2+3) → x^{2+3}
  s = s.replace(/\^\(([^)]+)\)/g, '^{$1}')
  // 5c. Single char (existing): x^2 → x^{2},  x^n → x^{n}
  s = s.replace(/\^([a-zA-Z0-9])(?!\{)/g, '^{$1}')

  // 5b. Subscripts: x_a (single char, not already braced) → x_{a}
  s = s.replace(/_([a-zA-Z0-9])(?!\{)/g, '_{$1}')

  return s
}

/**
 * Compare student input against canonical KaTeX answer.
 * Both sides run through parseFormula so shorthand notation is accepted.
 * Whitespace differences are ignored.
 * Also accepts just the right-hand side of an equation —
 * e.g. "mx+b" is marked correct when the answer is "y=mx+b".
 */
export function compareFormulas(student: string, canonical: string): boolean {
  if (!student.trim()) return false
  const norm = (s: string) => parseFormula(s).replace(/\s+/g, '').replace(/\\/g, '').toLowerCase()
  const normStudent = norm(student)
  if (normStudent === norm(canonical)) return true
  const eqIdx = canonical.indexOf('=')
  if (eqIdx !== -1) {
    const rhs = canonical.slice(eqIdx + 1).trim()
    if (normStudent === norm(rhs)) return true
  }
  return false
}
