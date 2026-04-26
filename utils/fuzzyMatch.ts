// utils/fuzzyMatch.ts

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function normalizeBase(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

// Expands "Term (Alias) Suffix" into three candidates:
//   1. original normalized:         "necessary and proper (elastic) clause"
//   2. without parenthetical:       "necessary and proper clause"
//   3. inner term + trailing words: "elastic clause"
// Guard: inner content must be >= 4 chars to generate candidate 3,
// preventing single-letter parentheticals from becoming valid answers.
function expandParentheticals(s: string): string[] {
  const base = normalizeBase(s)
  const parenMatch = base.match(/\(([^)]+)\)/)
  if (!parenMatch) return [base]

  const inner = parenMatch[1].trim()
  const withoutParen = base.replace(/\s*\([^)]+\)\s*/, ' ').replace(/\s+/g, ' ').trim()

  if (inner.length < 4) return [base, withoutParen]

  const parenEnd = base.indexOf(parenMatch[0]) + parenMatch[0].length
  const afterParen = base.slice(parenEnd).trim()
  const innerExpanded = afterParen ? `${inner} ${afterParen}` : inner

  return [base, withoutParen, innerExpanded]
}

// Returns a canonical form ("federalist 10" / "brutus 1") only when the
// input contains a clear publication reference prefix. Bare numbers ("10")
// return null and are NOT credited as Federalist answers.
function normalizeFederalistStyle(s: string): string | null {
  const norm = normalizeBase(s)
  const fedMatch = norm.match(/^fed(?:eralist)?\.?\s*(?:no\.?\s*|#\s*)?(\d+)$/)
  if (fedMatch) return `federalist ${fedMatch[1]}`
  const brutusMatch = norm.match(/^brutus\.?\s*(?:no\.?\s*|#\s*)?(\d+)$/)
  if (brutusMatch) return `brutus ${brutusMatch[1]}`
  return null
}

const ROMAN_MAP: Record<string, number> = {
  XX: 20, XIX: 19, XVIII: 18, XVII: 17, XVI: 16, XV: 15, XIV: 14,
  XIII: 13, XII: 12, XI: 11, IX: 9, VIII: 8, VII: 7, VI: 6,
  IV: 4, III: 3, II: 2, I: 1, V: 5, X: 10,
}
// Longest tokens first so XVIII is matched before III, II, I, etc.
const ROMAN_PATTERN = /\b(XX|XIX|XVIII|XVII|XVI|XV|XIV|XIII|XII|XI|IX|VIII|VII|VI|IV|III|II|I|V|X)\b/g

function normalizeRomanNumerals(s: string): string {
  return s.replace(ROMAN_PATTERN, (m) => String(ROMAN_MAP[m.toUpperCase() as keyof typeof ROMAN_MAP]))
}

/**
 * Returns true if student answer matches correct answer or any accepted alternate.
 *
 * Matching strategy (in order):
 * 1. Exact base match (lowercase, trim, collapse spaces)
 * 2. Parenthetical expansion: "Necessary and Proper (Elastic) Clause" accepts
 *    "necessary and proper clause" and "elastic clause"
 * 3. Roman numeral normalization: "World War I" accepts "World War 1"
 * 4. Federalist/Brutus pattern: "Federalist No. 10" accepts "fed 10" but NOT bare "10"
 * 5. Levenshtein fuzzy match on all candidates (1/2/3 edits by candidate length)
 *
 * Blank vs blank returns true — reject empty submissions at the call site.
 */
export function fuzzyMatch(
  studentAnswer: string,
  correctAnswer: string,
  alternates: string[] = []
): boolean {
  const studentBase = normalizeBase(studentAnswer)
  const studentRoman = normalizeBase(normalizeRomanNumerals(studentAnswer))

  // Build all candidate forms from canonical answer + alternates
  const candidateSet = new Set<string>()
  for (const ans of [correctAnswer, ...alternates]) {
    for (const exp of expandParentheticals(ans)) {
      candidateSet.add(exp)
    }
    const romanNorm = normalizeBase(normalizeRomanNumerals(ans))
    if (romanNorm !== normalizeBase(ans)) candidateSet.add(romanNorm)
  }
  const candidates = [...candidateSet]

  // Steps 1-3: exact match covering parens expansion and roman normalization
  for (const c of candidates) {
    if (studentBase === c || studentRoman === c) return true
  }

  // Step 4: Federalist/Brutus — requires publication prefix on student side
  const studentFed = normalizeFederalistStyle(studentAnswer)
  if (studentFed !== null) {
    for (const ans of [correctAnswer, ...alternates]) {
      if (normalizeFederalistStyle(ans) === studentFed) return true
    }
  }

  // Step 5: Levenshtein fallback on all candidates
  for (const c of candidates) {
    const maxDist = c.length <= 5 ? 1 : c.length <= 10 ? 2 : 3
    if (levenshtein(studentBase, c) <= maxDist) return true
    if (studentRoman !== studentBase && levenshtein(studentRoman, c) <= maxDist) return true
  }

  return false
}
