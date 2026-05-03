import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkAndIncrementFRQUsage } from './adiRateLimit'
import { buildFRQGradingPrompt } from './frqGradingPrompt'
import { applyMathVerification } from './frqMathVerifier'
import type { FRQ, FRQGradingResult, FRQGradingPart, FRQGradingPointResult, GradingStrictness } from './frqSession'

// Phrases that indicate the LLM thinks the student wrote nothing. Used by
// validateFeedbackStrings to detect the "non-blank response, blank-feedback"
// hallucination class.
const BLANK_FEEDBACK_MARKERS = [
  'no response submitted',
  'no response provided',
  'no answer was written',
  'no attempt was made',
  'did not provide a response',
  'the student did not provide',
  "didn't provide a response",
]

function looksLikeBlankFeedback(text: string | null | undefined): boolean {
  if (!text) return false
  const lower = text.toLowerCase()
  return BLANK_FEEDBACK_MARKERS.some(m => lower.includes(m))
}

// Replaces feedback strings that claim "no response submitted" when the
// student actually wrote ≥ 50 chars. The grader hallucinates this class
// when a long essay touches one rubric row only tangentially — instead of
// marking "criterion not addressed" it sometimes emits the blank-response
// template. Pure code, no LLM call.
export function validateFeedbackStrings(
  question: FRQ,
  responses: Record<string, string>,
  grading: FRQGradingResult
): FRQGradingResult {
  const essayText = (responses['essay'] ?? '').trim()
  const isEssay = ['dbq', 'leq', 'essay', 'argument_essay', 'ebq', 'aaq'].includes(question.frq_type)
  const newParts = grading.parts.map(part => {
    const studentText = isEssay
      ? essayText
      : ((responses[part.letter] ?? '').trim() || essayText)
    // Only fix feedback when the response clearly is non-blank. A 30-char
    // attempt could legitimately fail to address the criterion.
    if (studentText.length < 50) return part

    const next = { ...part }
    if (looksLikeBlankFeedback(part.feedback)) {
      next.feedback = part.earned > 0
        ? 'Adi credited this row but the original feedback string was malformed. Score is based on the rubric criteria.'
        : 'Adi did not credit this row. The response did not clearly satisfy the rubric criteria for this row — review the criteria above and the per-point reasoning for what was missing.'
    }
    if (looksLikeBlankFeedback(part.missed)) {
      next.missed = part.earned >= part.max
        ? null
        : 'See the per-point reasoning below for which criteria were not satisfied.'
    }
    if (next.point_results) {
      next.point_results = next.point_results.map(pr => {
        if (looksLikeBlankFeedback(pr.reasoning)) {
          return {
            ...pr,
            reasoning: pr.earned > 0
              ? 'Credited based on rubric criteria.'
              : 'This rubric row was not satisfied by the response. Review the rubric description above for the specific criterion.',
          }
        }
        return pr
      })
    }
    return next
  })
  return { ...grading, parts: newParts }
}

// Phrases that signal positive evaluation in feedback / reasoning strings.
// Used by reconcileFeedbackScoreContradictions to detect cases where Adi
// wrote praise but assigned earned=0 (the contradictory output class seen
// in submission 2b24b1fc-c).
const POSITIVE_FEEDBACK_MARKERS = [
  'effectively',
  'clearly identifies',
  'clearly explains',
  'clearly draws',
  'correctly identifies',
  'correctly explains',
  'correctly describes',
  'correctly notes',
  'accurately identifies',
  'accurately describes',
  'accurately explains',
  'well articulated',
  'well-articulated',
  'well supported',
  'well-supported',
  'demonstrates a clear',
  'demonstrates strong',
  'shows a clear',
  'meets the rubric',
]

// Phrases that, even when present, signal the response did NOT fully earn —
// these neutralize a positive marker that appears alongside them.
const NEGATING_QUALIFIERS = [
  'but',
  'however',
  'lacks',
  'missing',
  'fails to',
  'did not',
  "didn't",
  'does not',
  "doesn't",
  'incomplete',
  'partial',
  'unclear',
  'vague',
]

function hasOnlyPositiveSignal(text: string | null | undefined): boolean {
  if (!text) return false
  const lower = text.toLowerCase()
  const hasPositive = POSITIVE_FEEDBACK_MARKERS.some(m => lower.includes(m))
  if (!hasPositive) return false
  const hasNegating = NEGATING_QUALIFIERS.some(q => {
    // Word-boundary check so "but" doesn't match "tribute" and "fails to"
    // is matched as a phrase, not a substring of "fails too".
    const re = new RegExp(`\\b${q.replace(/'/g, "\\'")}\\b`, 'i')
    return re.test(lower)
  })
  return !hasNegating
}

// Detects and resolves the "praise + earned=0" contradiction class. When the
// LLM produced internally inconsistent JSON (positive prose, zero score),
// the prose is the more reliable signal — score hallucination is more
// common than reasoning hallucination on top of correct evaluation.
// Conservatively raises earned to max only when the feedback is purely
// positive (no negating qualifier anywhere). Logs every override.
export function reconcileFeedbackScoreContradictions(
  question: FRQ,
  grading: FRQGradingResult
): FRQGradingResult {
  const overrides: Array<{ part: string; point_id: string; before: number; after: number; reasoning: string }> = []
  const newParts = grading.parts.map(part => {
    if (!part.point_results || part.point_results.length === 0) return part
    const newPointResults = part.point_results.map(pr => {
      if (pr.earned >= pr.max) return pr
      // Only fire when BOTH reasoning and the part-level feedback are purely
      // positive — single-source positive could be a tone artifact.
      const reasoningPositive = hasOnlyPositiveSignal(pr.reasoning)
      if (!reasoningPositive) return pr
      overrides.push({
        part: part.letter,
        point_id: pr.point_id,
        before: pr.earned,
        after: pr.max,
        reasoning: pr.reasoning,
      })
      return {
        ...pr,
        earned: pr.max,
        confidence: 0.85,
        reasoning: `${pr.reasoning} [server: feedback/score contradiction reconciled — Adi's feedback was unambiguously positive while the score was 0; score raised to match feedback.]`,
        suggestion: null,
      }
    })
    const partEarned = Math.min(part.max, newPointResults.reduce((sum, pr) => sum + pr.earned, 0))
    return { ...part, point_results: newPointResults, earned: partEarned }
  })
  const total_score = Math.min(grading.max_score, newParts.reduce((sum, p) => sum + p.earned, 0))
  if (overrides.length > 0) {
    console.warn('FRQ feedback/score contradiction reconciled', {
      question_id: question.id,
      overrides,
    })
  }
  return { ...grading, parts: newParts, total_score }
}

// Some essay-type FRQs (DBQ, LEQ, argument_essay) historically returned a
// single rubric row when the rubric calls for 5–6. sanitizeGrading already
// fills missing rows with synthesized 0-placeholders, but we additionally
// log when the LLM returned an unexpectedly small set so we can spot the
// regression in production logs without blocking the response.
function logEssayShapeIssues(question: FRQ, raw: { parts?: { letter: string }[] }): void {
  const ESSAY_TYPES = new Set(['dbq', 'leq', 'argument_essay', 'essay', 'ebq', 'aaq'])
  if (!ESSAY_TYPES.has(question.frq_type)) return
  const expected = question.parts.filter(p => !p.requires_drawing).length
  const got = Array.isArray(raw.parts) ? raw.parts.length : 0
  // LEQ legitimately has the LLM grade 1 of 3 choose-one parts, so single-row
  // output is correct for that type.
  if (question.frq_type === 'leq' && got === 1) return
  if (got < expected) {
    console.warn('FRQ essay shape: LLM returned fewer parts than rubric expects', {
      question_id: question.id,
      frq_type: question.frq_type,
      expected_parts: expected,
      returned_parts: got,
    })
  }
}

// Three-tier routing by FRQ type. Cheaper models for simpler rubrics; gpt-4o
// kept for the essay-types where deep reasoning carries the most weight.
// Strictness is expressed via the prompt, not the model choice.
//
// 2026-05-01: SAQ + concept_application TEMPORARILY moved off Gemini Flash
// because the production Google AI Studio key is on free tier and was
// 429'ing under normal traffic. Once billing is enabled on that key,
// move both back to gemini-2.5-flash — Flash is ~50% cheaper than
// gpt-4o-mini for the same accuracy on short structured rubrics.
function getModelForFRQ(frqType: string) {
  // Cheap tier — short, structured, deterministic. gpt-4o-mini is the
  // fallback while Gemini billing is still pending; restore Flash later.
  if (frqType === 'saq' || frqType === 'concept_application') {
    return openai('gpt-4o-mini')
  }
  // Mid tier — tiered rubrics with subtle distinctions. gpt-4o-mini is sharper
  // than Flash on these but ~94% cheaper than gpt-4o.
  // multi_part_math is intentionally NOT in this tier — production data shows
  // it's already running ~24pp below the AP benchmark on gpt-4o, so moving it
  // to a weaker model would compound the calibration gap. Keep on gpt-4o until
  // we can understand whether the harshness is rubric-side or grader-side.
  if (
    frqType === 'multi_part_text' ||
    frqType === 'quantitative_analysis' ||
    frqType === 'scotus_comparison'
  ) {
    return openai('gpt-4o-mini')
  }
  // Premium tier — DBQ, LEQ, argument_essay, essay, ebq, aaq, plus any
  // unrecognized type. These need depth: rebuttal traps, HAPP analysis,
  // multi-step argumentation. gpt-4o stays.
  return openai('gpt-4o')
}

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export function sanitizeGrading(question: FRQ, raw: FRQGradingResult): FRQGradingResult {
  let gradableParts = question.parts.filter(p => !p.requires_drawing)
  const rawParts = Array.isArray(raw.parts) ? raw.parts : []
  const rawByLetter = new Map(rawParts.map(p => [p.letter, p]))

  // LEQ presents 3 choose-one options; the AI grades only the chosen one.
  // Filter to that single part so max_score stays 6, not 18.
  if (question.frq_type === 'leq' && rawParts.length === 1) {
    const chosenLetter = rawParts[0].letter
    const chosenPart = gradableParts.find(p => p.letter === chosenLetter)
    if (chosenPart) gradableParts = [chosenPart]
  }

  function synthesizeZeroPointResult(
    sp: { point_id: string; point_value: number; description: string; alternatives?: { required_elements: string[]; correct_example: string }[] }
  ): FRQGradingPointResult {
    const firstAlt = sp.alternatives?.[0]
    const requiredElements = firstAlt?.required_elements?.filter(Boolean) ?? []
    const correctExample = firstAlt?.correct_example?.trim() ?? ''

    const reasoning = requiredElements.length > 0
      ? `This point is earned when the response: ${requiredElements.join('; ')}.`
      : `This rubric row requires: ${sp.description}`

    const suggestion = correctExample
      ? `To earn this point, your response would need to meet the criterion above. Example of an earning response: "${correctExample}"`
      : `Your response did not demonstrate the criterion for this row. Review the rubric description above and revise to address it directly.`

    return {
      point_id: sp.point_id,
      description: sp.description,
      earned: 0,
      max: sp.point_value,
      confidence: 0.5,
      sub_results: [],
      reasoning,
      suggestion,
      synthesized: true,
    }
  }

  const parts: FRQGradingPart[] = gradableParts.map(p => {
    const rp = rawByLetter.get(p.letter)
    const maxForPart = p.point_value
    const expectedPoints = Array.isArray(p.scoring_points) ? p.scoring_points : []

    let earned: number
    let pointResults: FRQGradingPointResult[] | undefined

    if (Array.isArray(rp?.point_results) && rp.point_results.length > 0) {
      // Build a normalized version of every returned point_result with the
      // numeric clamps and field defaults applied. We'll then map them onto
      // expected points using a multi-strategy match:
      //   1. exact point_id match (verbatim copy from rubric — preferred)
      //   2. case-insensitive match (model dropped or capitalized differently)
      //   3. positional fallback (LLM returned the right N results but with
      //      non-matching IDs; trust the order). This is critical for smaller
      //      models like gpt-4o-mini which sometimes invent IDs like "1"/"2"
      //      or "Part A" instead of copying "a"/"b"/"c" verbatim.
      // Without #3, every mismatched-ID case used to collapse all expected
      // points to synthesizeZeroPointResult — silently zeroing valid grading.
      const normalize = (pr: Record<string, unknown>, fallbackId: string, fallbackMax: number, fallbackDescription: string): FRQGradingPointResult => {
        const rawMax = pr.max
        const prMax = typeof rawMax === 'number' && Number.isFinite(rawMax) ? rawMax : fallbackMax
        const rawEarned = pr.earned
        const prEarned = typeof rawEarned === 'number' && Number.isFinite(rawEarned)
          ? Math.max(0, Math.min(prMax, Math.round(rawEarned)))
          : 0
        const rawConfidence = pr.confidence
        const confidence = typeof rawConfidence === 'number' && Number.isFinite(rawConfidence)
          ? Math.max(0, Math.min(1, rawConfidence))
          : 0.5
        const rawSuggestion = pr.suggestion
        const suggestion = prEarned === 0 && typeof rawSuggestion === 'string' && rawSuggestion.trim()
          ? rawSuggestion
          : null
        return {
          point_id: fallbackId,
          description: typeof pr.description === 'string' ? pr.description : fallbackDescription,
          earned: prEarned,
          max: prMax,
          confidence,
          sub_results: Array.isArray(pr.sub_results) ? pr.sub_results as FRQGradingPointResult['sub_results'] : [],
          reasoning: typeof pr.reasoning === 'string' ? pr.reasoning : '',
          suggestion,
        }
      }

      if (expectedPoints.length > 0) {
        const returnedByExactId = new Map<string, typeof rp.point_results[number]>()
        const returnedByLowerId = new Map<string, typeof rp.point_results[number]>()
        for (const pr of rp.point_results) {
          if (typeof pr.point_id === 'string') {
            returnedByExactId.set(pr.point_id, pr)
            returnedByLowerId.set(pr.point_id.toLowerCase(), pr)
          }
        }

        // Count how many expected ids the model actually returned by exact match.
        const exactHits = expectedPoints.filter(sp => returnedByExactId.has(sp.point_id)).length
        const lowerHits = expectedPoints.filter(sp => returnedByLowerId.has(sp.point_id.toLowerCase())).length
        const usePositional = exactHits === 0 && lowerHits === 0 && rp.point_results.length === expectedPoints.length

        if (usePositional) {
          console.warn('FRQ point_id mismatch — falling back to positional match', {
            question_id: question.id,
            part_letter: p.letter,
            expected_ids: expectedPoints.map(sp => sp.point_id),
            returned_ids: rp.point_results.map(pr => pr.point_id),
          })
          pointResults = expectedPoints.map((sp, i) =>
            normalize(rp.point_results![i] as unknown as Record<string, unknown>, sp.point_id, sp.point_value, sp.description)
          )
        } else {
          pointResults = expectedPoints.map(sp => {
            const exact = returnedByExactId.get(sp.point_id)
            if (exact) return normalize(exact as unknown as Record<string, unknown>, sp.point_id, sp.point_value, sp.description)
            const lower = returnedByLowerId.get(sp.point_id.toLowerCase())
            if (lower) return normalize(lower as unknown as Record<string, unknown>, sp.point_id, sp.point_value, sp.description)
            return synthesizeZeroPointResult(sp)
          })
        }
      } else {
        pointResults = rp.point_results.map(pr =>
          normalize(pr as unknown as Record<string, unknown>, typeof pr.point_id === 'string' ? pr.point_id : 'unknown', 1, '')
        )
      }
      earned = Math.min(maxForPart, pointResults.reduce((sum, pr) => sum + pr.earned, 0))
    } else if (expectedPoints.length > 0) {
      pointResults = expectedPoints.map(synthesizeZeroPointResult)
      earned = 0
    } else {
      const earnedRaw = typeof rp?.earned === 'number' && Number.isFinite(rp.earned) ? rp.earned : 0
      earned = Math.max(0, Math.min(maxForPart, Math.round(earnedRaw)))
    }

    const fallbackFeedback = rp
      ? 'No feedback provided.'
      : 'Adi did not return a scored breakdown for this rubric row. Retry grading to get per-row feedback.'
    const fallbackMissed = rp
      ? null
      : 'This row was not evaluated by the grader on this pass — retry to see specific criteria feedback.'

    return {
      letter: p.letter,
      earned,
      max: maxForPart,
      feedback: typeof rp?.feedback === 'string' && rp.feedback.trim() ? rp.feedback : fallbackFeedback,
      missed: typeof rp?.missed === 'string' && rp.missed.trim() ? rp.missed : fallbackMissed,
      ...(pointResults !== undefined ? { point_results: pointResults } : {}),
    }
  })

  const max_score = gradableParts.reduce((sum, p) => sum + p.point_value, 0)
  const total_score = parts.reduce((sum, p) => sum + p.earned, 0)
  const takeaway = typeof raw.takeaway === 'string' && raw.takeaway.trim()
    ? raw.takeaway
    : 'Review the per-part feedback to see where you lost points.'

  if (raw.total_score !== total_score || raw.max_score !== max_score || rawParts.length !== gradableParts.length) {
    console.warn('FRQ grading result was sanitized', {
      question_id: question.id,
      llm_total: raw.total_score,
      llm_max: raw.max_score,
      llm_part_count: rawParts.length,
      fixed_total: total_score,
      fixed_max: max_score,
      fixed_part_count: gradableParts.length,
    })
  }

  return { total_score, max_score, parts, takeaway }
}

export function enforceDependencies(question: FRQ, grading: FRQGradingResult): FRQGradingResult {
  const frqType = question.frq_type
  const parts = grading.parts.map(part => ({ ...part }))

  // Structural lookup — finds a scoring point by part letter and position
  // within that part. This is robust to point_id naming variation across FRQ
  // data files (some use "a"/"b"/"c"/"d", others use "a1"/"b1"/"c1"/"d1").
  // index can be a number (0 = first, -1 = last) or 'first' / 'last'.
  function findPointAt(letter: string, index: number | 'first' | 'last'): FRQGradingPointResult | undefined {
    const part = parts.find(p => p.letter === letter)
    if (!part?.point_results || part.point_results.length === 0) return undefined
    const i = index === 'first' ? 0
            : index === 'last' ? part.point_results.length - 1
            : index < 0 ? part.point_results.length + index
            : index
    return part.point_results[i]
  }

  function zeroPointResult(pr: FRQGradingPointResult | undefined, reason: string) {
    if (!pr || pr.earned <= 0) return
    pr.earned = 0
    pr.reasoning = `${pr.reasoning} [server: ${reason}]`
    if (pr.sub_results) pr.sub_results = pr.sub_results.map(sr => ({ ...sr, met: false }))
  }

  // A synthesized point means the LLM did not grade it — we filled in a 0
  // placeholder. That is NOT a real "the student failed this row" signal,
  // so cascading other rows off of it would compound the grading error.
  function isUnreliableZero(pr: FRQGradingPointResult | undefined): boolean {
    if (!pr) return true
    if (pr.synthesized) return true
    return false
  }

  if (frqType === 'argument_essay') {
    // Thesis = first scoring point in part 'a'.
    // Tier-3 evidence = last scoring point in part 'b' (highest tier).
    // Rebuttal = first scoring point in part 'd'.
    const thesis = findPointAt('a', 'first')
    if (thesis && thesis.earned === 0 && !isUnreliableZero(thesis)) {
      zeroPointResult(findPointAt('d', 'first'), 'rebuttal requires thesis')
      zeroPointResult(findPointAt('b', 'last'), 'evidence tier 3 requires thesis')
    }
  }

  if (frqType === 'dbq') {
    // a3 / a4 are the document-evidence base and the +1 evidence-supports
    // point on DBQs (rubric is stable across the World History DBQ files).
    const ev3 = parts.flatMap(p => p.point_results ?? []).find(pr => pr.point_id === 'a3')
    const ev4 = parts.flatMap(p => p.point_results ?? []).find(pr => pr.point_id === 'a4')
    if (ev3 && ev3.earned === 0 && !isUnreliableZero(ev3)) {
      zeroPointResult(ev4, 'evidence+ requires evidence base')
    }
  }

  if (frqType === 'leq') {
    const ev1 = parts.flatMap(p => p.point_results ?? []).find(pr => pr.point_id === 'a3')
    const ev2 = parts.flatMap(p => p.point_results ?? []).find(pr => pr.point_id === 'a4')
    if (ev1 && ev1.earned === 0 && !isUnreliableZero(ev1)) {
      zeroPointResult(ev2, 'evidence+ requires evidence base')
    }
  }

  for (const part of parts) {
    if (part.point_results) {
      // Clamp to part.max — some FRQ rubrics encode tiered scoring as multiple
      // scoring_points whose point_values sum higher than part.max (e.g. SCOTUS
      // comparison b1=1pt + b2=2pt for a 2pt part). Without this clamp the
      // grader can report 3/2 on a single part and 5/4 on the question.
      const summed = part.point_results.reduce((sum, pr) => sum + pr.earned, 0)
      part.earned = Math.min(part.max, summed)
    }
  }
  const summedTotal = parts.reduce((sum, p) => sum + p.earned, 0)
  const total_score = Math.min(grading.max_score, summedTotal)

  return { ...grading, parts, total_score }
}

function normalize(s: string): string {
  return s
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/[–—―]/g, '-')
    .replace(/[  -​﻿]/g, ' ')
    .replace(/…/g, '...')
    // Strip markdown emphasis so quote-matching survives **bold**, *italic*,
    // __underline__, and `code` formatting in student text or LLM-returned
    // quotes (LLMs frequently drop these characters when copying).
    // Also strip ASCII single/double quotes — the LLM frequently swaps " for '
    // when citing nested-quote text inside its own JSON string, which would
    // otherwise break substring and word-set match.
    .replace(/[*_`'"]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeLaTeX(s: string): string {
  let r = s
  r = r.replace(/\$\$/g, '').replace(/\$/g, '')
  for (let i = 0; i < 5; i++) {
    r = r.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
  }
  r = r.replace(/\\text\{([^{}]*)\}/g, '$1')
  r = r.replace(/\\left/g, '').replace(/\\right/g, '')
  r = r.replace(/\\(?:,|;|:|!|quad|qquad)\b/g, ' ')
  r = r.replace(/\\cdot/g, '*').replace(/\\times/g, '*')
  r = r.replace(/\\le\b/g, '<=').replace(/\\ge\b/g, '>=')
  r = r.replace(/\\ne\b/g, '!=').replace(/\\approx\b/g, '≈')
  r = r.replace(/\\(?:displaystyle|textstyle|scriptstyle)\b/g, '')
  r = r.replace(/\\[a-zA-Z]+/g, '')
  r = r.replace(/\s+/g, ' ').trim()
  return r
}

// Verifies the LLM's cited evidence quotes against the actual student text as
// a last-ditch defense against quote hallucination. The LLM is the calibrated
// judge of correctness — verifyEvidence's job is NOT to second-guess intent,
// only to catch fabricated quotes. Earlier versions zeroed any point whose
// sub_result quotes couldn't be string-matched; that punished creative answers
// where the LLM paraphrased the student's wording (the most common case for
// open-ended FRQ responses with valid alternate paths).
//
// Current behavior:
//   - Quote matches verbatim / LaTeX-normalized / sentence-by-sentence / 30%+
//     word overlap → treat as real evidence (paraphrase is fine).
//   - Quote has no overlap with the student text AND every sub_result for that
//     point is a hallucination → zero the point as a defense-in-depth check
//     against pure model fabrication.
//   - Mixed: some quotes match, others don't → keep LLM's earned value,
//     append a soft note so the user can spot-check.
export function verifyEvidence(grading: FRQGradingResult, responses: Record<string, string>): FRQGradingResult {
  const essayText = responses['essay'] ?? ''
  const parts = grading.parts.map(part => {
    if (!part.point_results || part.point_results.length === 0) return part
    const studentRaw = responses[part.letter] || essayText || ''
    const studentNorm = normalize(studentRaw)
    const studentLaTeX = normalize(normalizeLaTeX(studentRaw))
    const studentWordSet = new Set(studentNorm.split(/\s+/))
    const pointResults = part.point_results.map(pr => {
      let checked = 0
      let unmatched = 0
      const subResults = pr.sub_results.map(sr => {
        if (!sr.met) return sr
        checked++
        const quote = sr.student_evidence_quote ?? ''
        if (quote.trim() === '') {
          unmatched++
          return { ...sr, met: false }
        }
        const quoteNorm = normalize(quote)
        if (studentNorm.includes(quoteNorm)) return sr
        const quoteLaTeX = normalize(normalizeLaTeX(quote))
        if (studentLaTeX.includes(quoteLaTeX)) return sr
        const sentences = quoteNorm.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10)
        if (sentences.length > 1 && sentences.every(s => studentNorm.includes(s))) return sr
        const quoteWords = quoteNorm.split(/\s+/).filter(w => w.length >= 4)
        if (quoteWords.length >= 4) {
          const matches = quoteWords.filter(w => studentWordSet.has(w)).length
          // 30% overlap means the quote is a paraphrase of real student text,
          // not a hallucination. Treat as matched.
          if (matches / quoteWords.length >= 0.30) return sr
        }
        unmatched++
        return { ...sr, met: false }
      })

      let earned = pr.earned
      let reasoning = pr.reasoning
      if (checked > 0 && unmatched === checked && pr.earned > 0) {
        // Every cited quote is unrecognizable in the student's response. Most
        // likely the model fabricated evidence — zero this row as a safety net.
        earned = 0
        reasoning = 'The evidence Adi cited for this row could not be found anywhere in your response. This row was reset to 0 as a safety check against grading errors. If your response does address this rubric criterion, regrade for a fresh evaluation.'
      } else if (unmatched > 0 && pr.earned > 0) {
        // Partial mismatch — likely paraphrase. Keep the earned value and just
        // flag it so the user can spot-check.
        const note = '\n\nNote: Adi paraphrased part of your evidence when scoring this row. If the grade looks wrong, regrade for a fresh evaluation.'
        reasoning = `${pr.reasoning ?? ''}${note}`
      }

      return { ...pr, sub_results: subResults, earned, reasoning }
    })
    // Clamp to part.max — see enforceDependencies for the tiered-rubric case.
    const summedPart = pointResults.reduce((sum, pr) => sum + pr.earned, 0)
    const partEarned = Math.min(part.max, summedPart)
    return { ...part, point_results: pointResults, earned: partEarned }
  })
  const summedTotal = parts.reduce((sum, p) => sum + p.earned, 0)
  const total_score = Math.min(grading.max_score, summedTotal)
  return { ...grading, parts, total_score }
}

export type FRQGradingApiResponse =
  | { status: 'graded'; submissionId: string; result: FRQGradingResult }
  | { status: 'queued'; submissionId: string; message: string; resetAtEST?: string }

export async function runFRQGrading(params: {
  submissionId: string
  userId: string
  question: FRQ
  responses: Record<string, string>
  strictness: GradingStrictness
  stimulusImageBuffer: Buffer | null
}): Promise<FRQGradingApiResponse> {
  const { submissionId, userId, question, responses, strictness, stimulusImageBuffer } = params
  const admin = getSupabaseAdmin()

  // Rate-limit gate. If over, mark as queued and bounce. The user will see a
  // pending-review card and can tap "Grade now" once their daily allotment
  // resets.
  const usage = await checkAndIncrementFRQUsage(userId, strictness)
  if (!usage.allowed) {
    await admin
      .from('frq_submissions')
      .update({ grading_status: 'queued' })
      .eq('id', submissionId)

    const message = usage.reason === 'global_limit'
      ? `Adi has hit today's grading budget for everyone. Your answer is saved — come back to grade it tomorrow at ${usage.resetAtEST}.`
      : `You've hit your daily limit. Your answer is saved — come back to grade it tomorrow at ${usage.resetAtEST}.`

    return {
      status: 'queued',
      submissionId,
      message,
      resetAtEST: usage.resetAtEST,
    }
  }

  try {
    const systemPrompt = buildFRQGradingPrompt(question, responses, strictness)

    const gradingUserContent = stimulusImageBuffer
      ? [
          { type: 'image' as const, image: stimulusImageBuffer },
          { type: 'text' as const, text: 'Grade this FRQ submission according to the rubric. Respond with the JSON scoring object only.' },
        ]
      : 'Grade this FRQ submission according to the rubric. Respond with the JSON scoring object only.'

    // maxRetries handles transient errors (rate limits, cold-start timeouts,
    // 5xx blips) inside a single function invocation so users don't see
    // "queued" for retryable failures. The SDK does NOT retry 4xx errors
    // (bad request, auth) — those still throw and we mark queued correctly.
    const result = await generateText({
      model: getModelForFRQ(question.frq_type),
      system: systemPrompt,
      messages: [{ role: 'user', content: gradingUserContent }],
      maxOutputTokens: 3072,
      temperature: 0,
      maxRetries: 3,
    })

    let grading: FRQGradingResult
    try {
      // Defensive parsing: models occasionally wrap JSON in fences, prefix
      // with a sentence ("Here is the grading:"), or trail with whitespace.
      // Strip known fences first, then if that fails, fall back to extracting
      // the substring between the first `{` and last `}`.
      const stripped = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      let parsed: FRQGradingResult
      try {
        parsed = JSON.parse(stripped) as FRQGradingResult
      } catch {
        const first = stripped.indexOf('{')
        const last = stripped.lastIndexOf('}')
        if (first === -1 || last === -1 || last <= first) throw new Error('no json object found')
        parsed = JSON.parse(stripped.slice(first, last + 1)) as FRQGradingResult
      }
      logEssayShapeIssues(question, parsed)
      grading = sanitizeGrading(question, parsed)
    } catch (parseErr) {
      console.error('Failed to parse FRQ grading response', {
        error: (parseErr as Error)?.message,
        questionId: question.id,
        frqType: question.frq_type,
        responseLength: result.text?.length,
        responsePreview: result.text?.slice(0, 500),
      })
      await admin
        .from('frq_submissions')
        .update({ grading_status: 'queued' })
        .eq('id', submissionId)

      return {
        status: 'queued',
        submissionId,
        message: 'Adi had trouble reading the grading response. Your answer is saved — try grading it again from your queue in a minute.',
      }
    }

    // Single-call flow: trust the primary grading, then run server-side
    // post-processing. sanitizeGrading already fills in synthesized 0-point
    // placeholders for any rubric point_ids the model dropped, so a
    // completeness retry is no longer necessary. The strict-mode auditor pass
    // was also removed — strictness is now expressed purely via the prompt's
    // mode-specific stance paragraph.
    grading = enforceDependencies(question, grading)
    grading = verifyEvidence(grading, responses)

    // Math verification — pure code, zero LLM cost. Conservatively overrides
    // earned=0 → earned=max on "answer" scoring points where the student's
    // numerical answer demonstrably matches the rubric within tolerance.
    // Never overrides the other direction — a credited symbolic answer the
    // verifier can't parse must stay credited.
    const mathCheck = applyMathVerification(question, responses, grading)
    if (mathCheck.outcome.applied) {
      console.info('FRQ math verifier override applied', {
        question_id: question.id,
        deltas: mathCheck.outcome.deltas,
      })
    }
    grading = mathCheck.grading

    // Feedback sanity — replace "no response submitted" feedback strings on
    // parts where the student actually wrote ≥ 50 chars. Pure code.
    grading = validateFeedbackStrings(question, responses, grading)

    // Score/feedback consistency — when the LLM produced positive prose with
    // earned=0 (a contradictory-JSON failure mode), trust the prose and
    // raise the score. Conservative: requires fully positive reasoning with
    // no negating qualifier. Pure code.
    grading = reconcileFeedbackScoreContradictions(question, grading)

    const { error: resultError } = await admin
      .from('frq_results')
      .insert({
        submission_id: submissionId,
        total_score: grading.total_score,
        max_score: grading.max_score,
        part_breakdown: grading.parts,
        adi_takeaway: grading.takeaway,
      })

    if (resultError) {
      console.error('Failed to save FRQ result:', resultError)
    }

    await admin
      .from('frq_submissions')
      .update({ grading_status: 'graded' })
      .eq('id', submissionId)

    return {
      status: 'graded',
      submissionId,
      result: grading,
    }
  } catch (error) {
    // Log the underlying error so we can diagnose persistent failures.
    // After 3 SDK retries, a thrown error is either a 4xx or a sustained 5xx.
    const e = error as Error & { cause?: unknown; statusCode?: number; status?: number }
    console.error('FRQ grading error:', {
      message: e?.message,
      status: e?.statusCode ?? e?.status,
      cause: e?.cause,
      questionId: question.id,
      frqType: question.frq_type,
    })
    await admin
      .from('frq_submissions')
      .update({ grading_status: 'queued' })
      .eq('id', submissionId)

    return {
      status: 'queued',
      submissionId,
      message: 'Adi is having trouble grading right now. Your answer is saved — try grading it again from your queue in a few minutes.',
    }
  }
}

// Used by both the immediate-grade route (to short-circuit blank submissions
// before billing) and as a safety check in grade-queued.
export function isBlankResponse(text: unknown): boolean {
  if (typeof text !== 'string') return true
  return text.trim().length === 0
}

// Detects responses that have content but are not realistic grading targets
// (gibberish, single-character spam, "idk", etc.) so we can short-circuit
// before paying gpt-4o to grade them. Operates on a SINGLE part response —
// the route layer is responsible for combining per-part decisions.
export function isLowEffortResponse(text: string, frqType?: string): boolean {
  if (typeof text !== 'string') return false
  const trimmed = text.trim()
  if (trimmed.length === 0) return false // blank handled by isBlankResponse — don't double-classify

  // Math types get more lenient handling — short numeric/symbolic answers like
  // "2" or "f'(x)=2x" are perfectly valid grading inputs.
  const isMath = frqType === 'multi_part_math'

  // 1) Type-aware minimum length.
  // Math is intentionally lenient: a single numeric answer like "2" or "x=5"
  // is a valid grading target on multi_part_math FRQs (Calc/Precalc/Chem all
  // include parts where the only correct response is a number). We let any
  // non-blank math response through this gate; the explicit-rejects gate
  // below still catches "?" / "..." / "n/a".
  let minLen: number
  if (isMath) {
    minLen = 1
  } else if (
    frqType === 'saq' ||
    frqType === 'concept_application' ||
    frqType === 'quantitative_analysis' ||
    frqType === 'scotus_comparison' ||
    frqType === 'multi_part_text'
  ) {
    minLen = 20
  } else if (
    frqType === 'dbq' ||
    frqType === 'leq' ||
    frqType === 'essay' ||
    frqType === 'argument_essay' ||
    frqType === 'ebq'
  ) {
    minLen = 80
  } else {
    minLen = 20
  }
  if (trimmed.length < minLen) return true

  // 2) Explicit short-list rejects (case-insensitive, after trim, with light
  //    punctuation normalization for trailing periods/question marks).
  const normalized = trimmed.toLowerCase().replace(/['']/g, "'")
  const REJECTS = new Set([
    'idk', 'i dont know', "i don't know", 'no idea',
    '?', '??', '???',
    'skip', 'n/a', 'na',
    '.', '..', '...',
  ])
  if (REJECTS.has(normalized)) return true

  // Math types skip the remaining text-shape heuristics — formulas legitimately
  // look like "single-character spam" (e.g., "x x x") or lack vowel-bearing
  // English words (e.g., "f(x)=3x^2+2").
  if (isMath) return false

  // 3) Single-character spam: same character ≥80% of the response (whitespace
  //    excluded). Catches "aaaaaaa", ".....", "------".
  const noWs = trimmed.replace(/\s+/g, '')
  if (noWs.length > 0) {
    const counts = new Map<string, number>()
    for (const ch of noWs) {
      const lower = ch.toLowerCase()
      counts.set(lower, (counts.get(lower) ?? 0) + 1)
    }
    let topCount = 0
    for (const c of counts.values()) if (c > topCount) topCount = c
    if (topCount / noWs.length >= 0.8) return true
  }

  // 4) Looks-like-text: must contain at least one alphabetic word of 3+ letters
  //    that includes a vowel. Catches keyboard-mash like "qwertyuiop", "zxcvbn",
  //    "asdfghjkl" — none of those tokens contain a vowel-bearing 3+ letter run.
  //    A "word" here is any maximal run of [A-Za-z].
  const wordMatches = trimmed.match(/[A-Za-z]+/g) ?? []
  const hasRealWord = wordMatches.some(w => w.length >= 3 && /[aeiouAEIOU]/.test(w))
  if (!hasRealWord) return true

  return false
}

export function buildBlankResult(question: FRQ): FRQGradingResult {
  const gradableParts = question.parts.filter(p => !p.requires_drawing)
  // LEQ has 3 choose-one option-parts; use total_points (6) instead of summing all.
  const max_score = question.frq_type === 'leq' ? question.total_points : gradableParts.reduce((sum, p) => sum + p.point_value, 0)
  const parts: FRQGradingPart[] = gradableParts.map(p => ({
    letter: p.letter,
    earned: 0,
    max: p.point_value,
    feedback: 'No response submitted for this part.',
    missed: 'The full set of rubric criteria was not addressed because no answer was written.',
  }))
  return {
    total_score: 0,
    max_score,
    parts,
    takeaway: 'No response was submitted. Even a short attempt at each part gives Adi something to grade — try writing down what you know before submitting next time.',
  }
}

// Mirrors buildBlankResult but for low-effort responses where the user wrote
// something but it's not gradable (gibberish, "idk", under length floor, etc.).
// Same 0/max shape, different copy so the user understands why they got no
// feedback and what to do next.
export function buildLowEffortResult(question: FRQ): FRQGradingResult {
  const gradableParts = question.parts.filter(p => !p.requires_drawing)
  const max_score = question.frq_type === 'leq' ? question.total_points : gradableParts.reduce((sum, p) => sum + p.point_value, 0)
  const parts: FRQGradingPart[] = gradableParts.map(p => ({
    letter: p.letter,
    earned: 0,
    max: p.point_value,
    feedback: 'Response was too short or unclear to grade.',
    missed: 'Add a substantive attempt — at least a sentence or two showing your reasoning — and resubmit.',
  }))
  return {
    total_score: 0,
    max_score,
    parts,
    takeaway: 'Your response was too short or unclear for Adi to grade. Even a few sentences attempting each part will let Adi give you specific feedback.',
  }
}
