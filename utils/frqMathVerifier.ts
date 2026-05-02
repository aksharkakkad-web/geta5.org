// utils/frqMathVerifier.ts
// Pure-code numerical verification for math-type FRQs (multi_part_math).
// Runs AFTER the LLM grades and conservatively overrides earned=0 to earned=max
// when the student's final numerical answer demonstrably matches the rubric's
// expected value. Never overrides in the other direction — the LLM may credit
// equivalent symbolic forms that the verifier can't recognize.

import type { FRQ, FRQGradingResult, FRQPart, FRQScoringPoint } from './frqSession'

const APPROX_REL_TOLERANCE = 0.005   // 0.5% — accommodates AP rounding
const APPROX_ABS_TOLERANCE = 0.0005  // for values near zero

// A scoring point is treated as an "answer point" — eligible for numerical
// override — when its description / official_rubric language signals that
// the criterion is the final value, not the setup or the work shown.
function isAnswerPoint(sp: FRQScoringPoint): boolean {
  const haystack = `${sp.description} ${sp.official_rubric ?? ''}`.toLowerCase()
  // Positive signals: phrases that indicate a numerical-answer criterion.
  const ANSWER_SIGNALS = [
    'correct answer',
    'correct value',
    'numerical answer',
    'final answer',
    'answer:',
    'computes the',
    'evaluates to',
    'arrives at',
  ]
  if (!ANSWER_SIGNALS.some(s => haystack.includes(s))) return false
  // Negative signals: phrases that indicate setup / justification / work,
  // even when the description also mentions "answer."
  const NEG_SIGNALS = [
    'setup',
    'integrand',
    'limits of integration',
    'justification',
    'reasoning',
    'differential equation',
    'separates variables',
    'antiderivative',
    'shows work',
    'sets up',
    'writes the',
    'expression for',
  ]
  if (NEG_SIGNALS.some(s => haystack.includes(s))) return false
  return true
}

// Pulls every parseable number out of a string. Handles:
//   - Plain decimals: "0.064", "1.203", "-2.5"
//   - Scientific notation: "1.6e-3", "1.6E-3"
//   - LaTeX scientific: "1.6\times10^{-3}", "1.6 × 10^-3", "1.6 x 10^{-3}"
//   - LaTeX dollar wrapping: "$0.064$"
//   - Caret exponents: "10^-3", "10^{-3}"
// Skips obvious non-answer numbers like "(1)", "(2)" labels.
function extractNumbers(text: string): number[] {
  if (!text) return []
  const out: number[] = []

  // Strip LaTeX dollar signs and \text{} wrappers; normalize × × × \times.
  let s = text
    .replace(/\$/g, ' ')
    .replace(/\\text\{[^}]*\}/g, ' ')
    .replace(/\\times|×|\bx\b(?=\s*10)/gi, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\,|\\;|\\:|\\!|\\quad|\\qquad/g, ' ')

  // Pattern A: scientific notation with caret. Matches "1.6 * 10^-3" /
  // "1.6 * 10^{-3}" / "1.6e-3" / "1.6E-3". The 10^ form is more common in
  // student responses; the e form is rare.
  // Use a non-greedy match for the mantissa so we don't capture across blanks.
  const sciCaret = /(-?\d+(?:\.\d+)?)\s*\*\s*10\s*\^\s*\{?\s*(-?\d+)\s*\}?/g
  let m: RegExpExecArray | null
  while ((m = sciCaret.exec(s)) !== null) {
    const mantissa = parseFloat(m[1])
    const exp = parseInt(m[2], 10)
    if (Number.isFinite(mantissa) && Number.isFinite(exp)) {
      out.push(mantissa * Math.pow(10, exp))
    }
  }

  // Pattern B: raw "10^-3" without a mantissa (treated as 1 × 10^-3).
  const bareExp = /(?<![\d.])10\s*\^\s*\{?\s*(-?\d+)\s*\}?/g
  while ((m = bareExp.exec(s)) !== null) {
    const exp = parseInt(m[1], 10)
    if (Number.isFinite(exp)) out.push(Math.pow(10, exp))
  }

  // Pattern C: standard scientific (1.6e-3, 1.6E+3).
  const sciE = /(-?\d+(?:\.\d+)?)[eE]([+-]?\d+)/g
  while ((m = sciE.exec(s)) !== null) {
    const mantissa = parseFloat(m[1])
    const exp = parseInt(m[2], 10)
    if (Number.isFinite(mantissa) && Number.isFinite(exp)) {
      out.push(mantissa * Math.pow(10, exp))
    }
  }

  // Pattern D: plain decimals. Done last so scientific-form numbers above
  // were already consumed. We scan a copy where the matched scientific
  // substrings have been blanked out so their components don't double-count.
  let plain = s
  plain = plain.replace(sciCaret, ' ')
  plain = plain.replace(bareExp, ' ')
  plain = plain.replace(sciE, ' ')
  const dec = /-?\d+(?:\.\d+)?/g
  while ((m = dec.exec(plain)) !== null) {
    const n = parseFloat(m[0])
    if (Number.isFinite(n)) out.push(n)
  }

  return out
}

// Pulls expected numerical values from a scoring point's rubric data.
// Looks at required_elements first (most reliable), then official_rubric,
// then correct_example. Dedupes within tolerance.
function extractExpectedNumbers(sp: FRQScoringPoint): number[] {
  const sources: string[] = []
  for (const alt of sp.alternatives ?? []) {
    if (alt.required_elements?.length) sources.push(...alt.required_elements)
    if (alt.correct_example) sources.push(alt.correct_example)
  }
  if (sp.official_rubric) sources.push(sp.official_rubric)

  const all = sources.flatMap(extractNumbers)
  const deduped: number[] = []
  for (const n of all) {
    if (!deduped.some(d => approximatelyEqual(d, n))) {
      deduped.push(n)
    }
  }
  return deduped
}

function approximatelyEqual(a: number, b: number): boolean {
  if (a === b) return true
  const diff = Math.abs(a - b)
  if (diff < APPROX_ABS_TOLERANCE) return true
  const scale = Math.max(Math.abs(a), Math.abs(b))
  if (scale === 0) return false
  return diff / scale < APPROX_REL_TOLERANCE
}

// The student's "final answer" is heuristically the LAST number they wrote
// before any conclusion mark. We also look at numbers immediately following
// "=", "answer:", or "≈" because students often label them. If multiple
// candidates are close to an expected value, that's a match.
function findStudentAnswerCandidates(response: string): number[] {
  if (!response) return []
  const numbers = extractNumbers(response)
  if (numbers.length === 0) return []
  // Candidate set: last 5 numbers (the conclusion is typically at the end)
  // plus any number that follows "=" or "answer:". Combining both keeps the
  // set small but covers students who write the answer mid-response with
  // explicit labeling.
  const candidates = new Set<number>()
  for (const n of numbers.slice(-5)) candidates.add(n)

  // Find numbers immediately after "=", "answer:", "≈", "≃".
  const labeled = response.match(/(?:=|answer\s*:|≈|≃|\bso\b)\s*(?:\$)?(-?\d+(?:\.\d+)?(?:\s*[*xX×]\s*10\s*\^\s*\{?-?\d+\}?)?)/gi)
  if (labeled) {
    for (const lbl of labeled) {
      const lblNums = extractNumbers(lbl)
      for (const n of lblNums) candidates.add(n)
    }
  }
  return [...candidates]
}

export interface MathVerificationDelta {
  point_id: string
  before: number
  after: number
  expected: number[]
  matched_value: number
  reason: string
}

export interface MathVerificationOutcome {
  applied: boolean
  deltas: MathVerificationDelta[]
}

// Conservatively override earned=0 → earned=max on "answer" points where
// the student's numerical answer demonstrably matches the rubric. Never
// override the other way: an LLM-credited symbolic answer the verifier
// can't parse must stay credited.
//
// Returns the new grading + a list of deltas for logging.
export function applyMathVerification(
  question: FRQ,
  responses: Record<string, string>,
  grading: FRQGradingResult
): { grading: FRQGradingResult; outcome: MathVerificationOutcome } {
  if (question.frq_type !== 'multi_part_math') {
    return { grading, outcome: { applied: false, deltas: [] } }
  }

  const deltas: MathVerificationDelta[] = []
  const newParts = grading.parts.map(part => {
    const partDef = question.parts.find(qp => qp.letter === part.letter) as FRQPart | undefined
    if (!partDef?.scoring_points?.length || !part.point_results?.length) {
      return part
    }

    const studentText = responses[part.letter] ?? responses['essay'] ?? ''
    if (!studentText.trim()) return part

    const observed = findStudentAnswerCandidates(studentText)
    if (observed.length === 0) return part

    const newPointResults = part.point_results.map(pr => {
      const sp = partDef.scoring_points!.find(s => s.point_id === pr.point_id)
      if (!sp) return pr
      if (!isAnswerPoint(sp)) return pr
      if (pr.earned > 0) return pr  // already credited — don't second-guess

      const expected = extractExpectedNumbers(sp)
      if (expected.length === 0) return pr  // can't verify — leave LLM decision

      const match = observed.find(o => expected.some(e => approximatelyEqual(o, e)))
      if (match === undefined) return pr  // no match — leave LLM's 0

      // Override.
      deltas.push({
        point_id: pr.point_id,
        before: pr.earned,
        after: pr.max,
        expected,
        matched_value: match,
        reason: 'numerical answer matches rubric within tolerance',
      })
      return {
        ...pr,
        earned: pr.max,
        confidence: 0.95,
        reasoning: `Student's numerical answer ${match} matches the expected value (${expected.map(formatNum).join(' or ')}). [server: math verifier]`,
        suggestion: null,
      }
    })

    // Clamp to part.max — defense against rubrics whose scoring_points sum higher
    // than the part's point_value (tiered rubrics encoded additively).
    const summedPart = newPointResults.reduce((sum, pr) => sum + pr.earned, 0)
    const partEarned = Math.min(part.max, summedPart)
    return { ...part, point_results: newPointResults, earned: partEarned }
  })

  const summedTotal = newParts.reduce((sum, p) => sum + p.earned, 0)
  const total_score = Math.min(grading.max_score, summedTotal)
  return {
    grading: { ...grading, parts: newParts, total_score },
    outcome: { applied: deltas.length > 0, deltas },
  }
}

function formatNum(n: number): string {
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 0.001 && abs < 10000) return n.toString()
  // Scientific notation for very small/large
  return n.toExponential(2)
}

// Exported for unit/regression tests.
export const __testing = {
  extractNumbers,
  extractExpectedNumbers,
  findStudentAnswerCandidates,
  isAnswerPoint,
  approximatelyEqual,
}
