import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkAndIncrementFRQUsage } from './adiRateLimit'
import { buildFRQGradingPrompt } from './frqGradingPrompt'
import type { FRQ, FRQGradingResult, FRQGradingPart, FRQGradingPointResult, GradingStrictness } from './frqSession'

// Three-tier routing by FRQ type. Cheaper models for simpler rubrics; gpt-4o
// kept for the essay-types where deep reasoning carries the most weight.
// Strictness is expressed via the prompt, not the model choice.
function getModelForFRQ(frqType: string) {
  // Cheap tier — short, structured, deterministic. Gemini Flash handles fine.
  if (frqType === 'saq' || frqType === 'concept_application') {
    return google('gemini-2.5-flash')
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

function sanitizeGrading(question: FRQ, raw: FRQGradingResult): FRQGradingResult {
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
      const returnedByPointId = new Map<string, FRQGradingPointResult>()
      for (const pr of rp.point_results) {
        const prMax = typeof pr.max === 'number' && Number.isFinite(pr.max) ? pr.max : 1
        const prEarned = typeof pr.earned === 'number' && Number.isFinite(pr.earned)
          ? Math.max(0, Math.min(prMax, Math.round(pr.earned)))
          : 0
        const confidence = typeof pr.confidence === 'number' && Number.isFinite(pr.confidence)
          ? Math.max(0, Math.min(1, pr.confidence))
          : 0.5
        const suggestion = prEarned === 0 && typeof pr.suggestion === 'string' && pr.suggestion.trim()
          ? pr.suggestion
          : null
        returnedByPointId.set(pr.point_id, {
          point_id: pr.point_id,
          description: pr.description,
          earned: prEarned,
          max: prMax,
          confidence,
          sub_results: Array.isArray(pr.sub_results) ? pr.sub_results : [],
          reasoning: typeof pr.reasoning === 'string' ? pr.reasoning : '',
          suggestion,
        })
      }

      if (expectedPoints.length > 0) {
        pointResults = expectedPoints.map(sp => {
          const returned = returnedByPointId.get(sp.point_id)
          return returned ?? synthesizeZeroPointResult(sp)
        })
      } else {
        pointResults = Array.from(returnedByPointId.values())
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

function enforceDependencies(question: FRQ, grading: FRQGradingResult): FRQGradingResult {
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
      part.earned = part.point_results.reduce((sum, pr) => sum + pr.earned, 0)
    }
  }
  const total_score = parts.reduce((sum, p) => sum + p.earned, 0)

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

function verifyEvidence(grading: FRQGradingResult, responses: Record<string, string>): FRQGradingResult {
  const essayText = responses['essay'] ?? ''
  const parts = grading.parts.map(part => {
    if (!part.point_results || part.point_results.length === 0) return part
    const studentRaw = responses[part.letter] || essayText || ''
    const studentNorm = normalize(studentRaw)
    const studentLaTeX = normalize(normalizeLaTeX(studentRaw))
    const studentWordSet = new Set(studentNorm.split(/\s+/))
    const pointResults = part.point_results.map(pr => {
      const subResults = pr.sub_results.map(sr => {
        if (!sr.met) return sr
        const quote = sr.student_evidence_quote ?? ''
        if (quote.trim() === '') return { ...sr, met: false }
        const quoteNorm = normalize(quote)
        if (studentNorm.includes(quoteNorm)) return sr
        const quoteLaTeX = normalize(normalizeLaTeX(quote))
        if (studentLaTeX.includes(quoteLaTeX)) return sr
        const sentences = quoteNorm.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10)
        if (sentences.length > 1 && sentences.every(s => studentNorm.includes(s))) return sr
        const quoteWords = quoteNorm.split(/\s+/).filter(w => w.length >= 4)
        if (quoteWords.length >= 4) {
          const matches = quoteWords.filter(w => studentWordSet.has(w)).length
          if (matches / quoteWords.length >= 0.85) return sr
        }
        return { ...sr, met: false }
      })
      const allMet = subResults.length > 0 && subResults.every(sr => sr.met)
      const earned = allMet ? pr.max : 0
      const reasoning = earned < pr.earned
        ? 'The specific evidence quote the grader cited could not be matched to the text of your response. The grader may have paraphrased your wording. Rewrite your evidence more explicitly in your essay, or resubmit for another grading attempt.'
        : pr.reasoning
      return { ...pr, sub_results: subResults, earned, reasoning }
    })
    const partEarned = pointResults.reduce((sum, pr) => sum + pr.earned, 0)
    return { ...part, point_results: pointResults, earned: partEarned }
  })
  const total_score = parts.reduce((sum, p) => sum + p.earned, 0)
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
      ? `Adi has hit today's grading budget. Your response is saved — come back after ${usage.resetAtEST} to grade it.`
      : `Your response has been saved. You can grade it after your daily limit resets at ${usage.resetAtEST}.`

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
        message: 'Grading encountered an issue. Adi will retry shortly.',
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
      message: 'Grading temporarily unavailable. Adi will grade this when possible.',
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
