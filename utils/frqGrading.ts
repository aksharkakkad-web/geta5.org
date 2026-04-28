import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkAndIncrementFRQUsage } from './adiRateLimit'
import { buildFRQGradingPrompt, buildFRQAuditorPrompt } from './frqGradingPrompt'
import type { FRQ, FRQGradingResult, FRQGradingPart, FRQGradingPointResult, GradingStrictness } from './frqSession'

function getModelForStrictness(_strictness: GradingStrictness) {
  // All tiers share the same model (gpt-4o); rigor differences come from the
  // grading PROMPT, plus strict's bidirectional auditor pass. See the longer
  // note kept in the original grade route for context.
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

function detectMissingPointIds(question: FRQ, parsed: FRQGradingResult): string[] {
  const gradableParts = question.parts.filter(p => !p.requires_drawing)
  const returned = new Set<string>()
  const rawParts = Array.isArray(parsed.parts) ? parsed.parts : []
  for (const rp of rawParts) {
    const pointResults = Array.isArray(rp.point_results) ? rp.point_results : []
    for (const pr of pointResults) {
      if (typeof pr.point_id === 'string' && pr.point_id) returned.add(pr.point_id)
    }
  }
  const missing: string[] = []
  for (const p of gradableParts) {
    const scoringPoints = Array.isArray(p.scoring_points) ? p.scoring_points : []
    for (const sp of scoringPoints) {
      if (!returned.has(sp.point_id)) missing.push(sp.point_id)
    }
  }
  return missing
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

    const result = await generateText({
      model: getModelForStrictness(strictness),
      system: systemPrompt,
      messages: [{ role: 'user', content: gradingUserContent }],
      maxOutputTokens: 3072,
      temperature: 0,
    })

    let grading: FRQGradingResult
    let parsedPrimary: FRQGradingResult
    try {
      const cleanText = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsedPrimary = JSON.parse(cleanText) as FRQGradingResult
      grading = sanitizeGrading(question, parsedPrimary)
    } catch {
      console.error('Failed to parse FRQ grading response:', result.text)
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

    // Completeness retry — re-call with a focused prompt naming missing point_ids.
    const missingPointIds = detectMissingPointIds(question, parsedPrimary)
    if (missingPointIds.length > 0) {
      try {
        const retrySystem = buildFRQGradingPrompt(question, responses, strictness)
        const missingList = missingPointIds.join(', ')
        const retryUserText = `Your previous grading attempt was INCOMPLETE. You did not return point_results for these rubric point_ids: ${missingList}. Grade the student's response AGAIN with a COMPLETE JSON output that includes EVERY rubric part and EVERY point_id — even those that earn 0. Pay special attention to the missing point_ids listed above; they must each appear in your output with a real reasoning explanation (not a generic "not evaluated" message). Respond with the JSON scoring object only.`
        const retryUserContent = stimulusImageBuffer
          ? [
              { type: 'image' as const, image: stimulusImageBuffer },
              { type: 'text' as const, text: retryUserText },
            ]
          : retryUserText

        const retryResult = await generateText({
          model: getModelForStrictness(strictness),
          system: retrySystem,
          messages: [{ role: 'user', content: retryUserContent }],
          maxOutputTokens: 3072,
          temperature: 0,
        })
        const cleanRetry = retryResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsedRetry = JSON.parse(cleanRetry) as FRQGradingResult

        const retryMissing = detectMissingPointIds(question, parsedRetry)
        if (retryMissing.length < missingPointIds.length) {
          grading = sanitizeGrading(question, parsedRetry)
          console.log('FRQ completeness retry improved response', {
            question_id: question.id,
            primary_missing: missingPointIds.length,
            retry_missing: retryMissing.length,
          })
        }
      } catch (retryErr) {
        console.warn('FRQ completeness retry failed, using primary grading', retryErr)
      }
    }

    if (strictness === 'strict') {
      try {
        const auditorPrompt = buildFRQAuditorPrompt(question, responses, grading, strictness)
        const auditorUserContent = stimulusImageBuffer
          ? [
              { type: 'image' as const, image: stimulusImageBuffer },
              { type: 'text' as const, text: 'Audit the grading result. Respond with the corrected JSON scoring object only.' },
            ]
          : 'Audit the grading result. Respond with the corrected JSON scoring object only.'

        const auditorResult = await generateText({
          model: getModelForStrictness(strictness),
          system: auditorPrompt,
          messages: [{ role: 'user', content: auditorUserContent }],
          maxOutputTokens: 3072,
          temperature: 0,
        })
        const cleanAuditor = auditorResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsedAuditor = JSON.parse(cleanAuditor) as FRQGradingResult
        grading = sanitizeGrading(question, parsedAuditor)
      } catch (auditorErr) {
        console.warn('FRQ auditor pass failed to parse, using primary grading', auditorErr)
      }
    }

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
    console.error('FRQ grading error:', error)
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
