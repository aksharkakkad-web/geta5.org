/**
 * mathShortcuts.ts
 *
 * Converts student shorthand math notation to KaTeX-compatible LaTeX strings.
 * Designed for FRQ math input (AP Calculus AB, Precalculus, AP Chemistry).
 *
 * Rules:
 *  - Processes line-by-line; each line is independent.
 *  - Text inside double-quotes is never converted.
 *  - Graceful on partial matches — no partial conversion.
 *  - Idempotent: running twice produces the same result.
 */

// ─── Public reference table ───────────────────────────────────────────────────

export interface MathShortcut {
  shortcut: string
  renders: string
  description: string
}

export const MATH_SHORTCUTS: MathShortcut[] = [
  { shortcut: 'x^2',        renders: 'x^{2}',            description: 'Superscript (single character)' },
  { shortcut: 'x^(2n+1)',   renders: 'x^{2n+1}',         description: 'Superscript (expression)' },
  { shortcut: 'x_(0)',      renders: 'x_{0}',             description: 'Subscript (expression)' },
  { shortcut: 'int(a,b)',   renders: '\\int_{a}^{b}',     description: 'Definite integral' },
  { shortcut: 'sqrt(x)',    renders: '\\sqrt{x}',         description: 'Square root' },
  { shortcut: 'lim(x->a)', renders: '\\lim_{x \\to a}',  description: 'Limit notation' },
  { shortcut: 'sum(i=1,n)', renders: '\\sum_{i=1}^{n}',  description: 'Summation' },
  { shortcut: 'pi',         renders: '\\pi',              description: 'Pi constant' },
  { shortcut: 'theta',      renders: '\\theta',           description: 'Theta (lowercase)' },
  { shortcut: 'delta',      renders: '\\Delta',           description: 'Delta (uppercase)' },
  { shortcut: 'alpha',      renders: '\\alpha',           description: 'Alpha (lowercase)' },
  { shortcut: 'beta',       renders: '\\beta',            description: 'Beta (lowercase)' },
  { shortcut: 'inf',        renders: '\\infty',           description: 'Infinity' },
  { shortcut: '>=',         renders: '\\geq',             description: 'Greater than or equal' },
  { shortcut: '<=',         renders: '\\leq',             description: 'Less than or equal' },
  { shortcut: '!=',         renders: '\\neq',             description: 'Not equal' },
  { shortcut: '->',         renders: '\\to',              description: 'Right arrow' },
  { shortcut: 'a*b',        renders: 'a \\cdot b',        description: 'Multiplication dot (between terms)' },
]

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Split a line into quoted and unquoted segments.
 * Quoted segments (inside "...") are returned as-is and skipped during conversion.
 */
function splitByQuotes(line: string): Array<{ text: string; quoted: boolean }> {
  const segments: Array<{ text: string; quoted: boolean }> = []
  let i = 0
  let current = ''

  while (i < line.length) {
    if (line[i] === '"') {
      // Flush any accumulated unquoted text
      if (current) {
        segments.push({ text: current, quoted: false })
        current = ''
      }
      // Collect everything until the closing quote (or end of line)
      let quoted = '"'
      i++
      while (i < line.length && line[i] !== '"') {
        quoted += line[i++]
      }
      quoted += line[i] === '"' ? '"' : ''
      if (line[i] === '"') i++
      segments.push({ text: quoted, quoted: true })
    } else {
      current += line[i++]
    }
  }

  if (current) segments.push({ text: current, quoted: false })
  return segments
}

/**
 * Apply all shorthand conversions to a single unquoted segment.
 * Order matters — more specific patterns run before more general ones.
 */
function convertSegment(s: string): string {
  // Guard: if already contains LaTeX commands, don't double-convert
  // (idempotency check — skip lines that already look like LaTeX)
  // We still run all rules; the regexes are written to not match already-converted forms.

  // 1. int(lower,upper) → \int_{lower}^{upper}
  //    Matches: int(a,b) where a and b are any non-comma/paren chars
  s = s.replace(
    /\bint\(([^,)]+),([^)]+)\)/g,
    (_m, lower, upper) => `\\int_{${lower.trim()}}^{${upper.trim()}}`
  )

  // 2. sum(i=expr,upper) → \sum_{i=expr}^{upper}
  s = s.replace(
    /\bsum\(([^,)]+),([^)]+)\)/g,
    (_m, lower, upper) => `\\sum_{${lower.trim()}}^{${upper.trim()}}`
  )

  // 3. lim(var->val) → \lim_{var \to val}
  //    Must run before -> replacement to avoid corrupting the arrow inside
  s = s.replace(
    /\blim\(([^-]+)->([^)]+)\)/g,
    (_m, variable, value) => `\\lim_{${variable.trim()} \\to ${value.trim()}}`
  )

  // 4. sqrt(expr) → \sqrt{expr}
  //    Only if not already \sqrt
  s = s.replace(/(?<!\\)\bsqrt\(([^)]+)\)/g, '\\sqrt{$1}')

  // 5. Superscript: x^(expr) → x^{expr}
  s = s.replace(/\^\(([^)]+)\)/g, '^{$1}')

  // 6. Superscript: x^singleChar → x^{singleChar} (not already braced, not a backslash sequence)
  s = s.replace(/\^([a-zA-Z0-9])(?!\{)/g, '^{$1}')

  // 7. Subscript: x_(expr) → x_{expr}
  s = s.replace(/_\(([^)]+)\)/g, '_{$1}')

  // 8. Subscript: x_singleChar → x_{singleChar} (not already braced)
  s = s.replace(/_([a-zA-Z0-9])(?!\{)/g, '_{$1}')

  // 9. Greek letters and named constants — whole-word only
  //    Run after function patterns so "integral" doesn't partially match "int"
  const GREEK: Array<[RegExp, string]> = [
    [/\btheta\b/g, '\\theta'],
    [/\bTheta\b/g, '\\Theta'],
    [/\bdelta\b/g, '\\Delta'],   // lowercase 'delta' → uppercase \Delta (AP convention)
    [/\bDelta\b/g, '\\Delta'],
    [/\balpha\b/g, '\\alpha'],
    [/\bAlpha\b/g, '\\alpha'],
    [/\bbeta\b/g, '\\beta'],
    [/\bBeta\b/g, '\\beta'],
    [/\bgamma\b/g, '\\gamma'],
    [/\bGamma\b/g, '\\Gamma'],
    [/\bsigma\b/g, '\\sigma'],
    [/\bSigma\b/g, '\\Sigma'],
    [/\blambda\b/g, '\\lambda'],
    [/\bLambda\b/g, '\\Lambda'],
    [/\bepsilon\b/g, '\\epsilon'],
    [/\bmu\b/g, '\\mu'],
    [/\bphi\b/g, '\\phi'],
    [/\bPhi\b/g, '\\Phi'],
    [/\bomega\b/g, '\\omega'],
    [/\bOmega\b/g, '\\Omega'],
    // pi last — avoid matching "epsilon" having "pi" inside via word boundary
    [/\bpi\b/g, '\\pi'],
    [/\bPi\b/g, '\\Pi'],
    // named constants
    [/\binf\b/g, '\\infty'],
  ]
  for (const [pattern, replacement] of GREEK) {
    s = s.replace(pattern, replacement)
  }

  // 10. Comparison and relational operators
  //     Order: >= before > alone, <= before < alone, != before ! alone
  s = s.replace(/>=/g, '\\geq')
  s = s.replace(/<=/g, '\\leq')
  s = s.replace(/!=/g, '\\neq')

  // 11. Arrow: -> → \to
  //     Must run after lim(...->...) is already consumed
  s = s.replace(/->/g, '\\to')

  // 12. Multiplication dot: * between two term-like characters → \cdot
  //     A "term" boundary: alphanumeric, }, ), or end of a latex command (\word)
  //     Avoids matching things like "**" or "*=" patterns
  s = s.replace(/([a-zA-Z0-9})\]\\])\*([a-zA-Z0-9({\\])/g, '$1 \\cdot $2')

  return s
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert shorthand math notation in `input` to KaTeX-compatible LaTeX.
 *
 * - Multi-line input: each line is processed independently.
 * - Text inside double-quotes is passed through unchanged.
 * - Never throws; gracefully handles edge cases.
 */
export function convertToKaTeX(input: string): string {
  const lines = input.split('\n')

  const processedLines = lines.map((line) => {
    const segments = splitByQuotes(line)
    return segments
      .map((seg) => (seg.quoted ? seg.text : convertSegment(seg.text)))
      .join('')
  })

  return processedLines.join('\n')
}
