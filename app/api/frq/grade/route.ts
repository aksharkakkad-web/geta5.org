import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase-server'
import { checkAndIncrementUsage } from '@/utils/adiRateLimit'
import { buildFRQGradingPrompt, buildFRQAuditorPrompt } from '@/utils/frqGradingPrompt'
import type { FRQ, FRQGradingResult, FRQGradingPart, FRQGradingPointResult, GradingStrictness } from '@/utils/frqSession'
import { readFile } from 'fs/promises'
import path from 'path'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getCallCost(strictness: GradingStrictness): number {
  return strictness === 'strict' ? 3 : 2
}

function getModelForStrictness(strictness: GradingStrictness) {
  return strictness === 'strict' ? openai('gpt-4o') : openai('gpt-4o-mini')
}

function isBlankResponse(text: unknown): boolean {
  if (typeof text !== 'string') return true
  return text.trim().length === 0
}

function buildBlankResult(question: FRQ): FRQGradingResult {
  const gradableParts = question.parts.filter(p => !p.requires_drawing)
  const max_score = gradableParts.reduce((sum, p) => sum + p.point_value, 0)
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

function sanitizeGrading(question: FRQ, raw: FRQGradingResult): FRQGradingResult {
  const gradableParts = question.parts.filter(p => !p.requires_drawing)
  const rawParts = Array.isArray(raw.parts) ? raw.parts : []
  const rawByLetter = new Map(rawParts.map(p => [p.letter, p]))

  const parts: FRQGradingPart[] = gradableParts.map(p => {
    const rp = rawByLetter.get(p.letter)
    const maxForPart = p.point_value

    let earned: number
    let pointResults: FRQGradingPointResult[] | undefined

    if (Array.isArray(rp?.point_results) && rp.point_results.length > 0) {
      pointResults = rp.point_results.map((pr: FRQGradingPointResult) => {
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
        return {
          point_id: pr.point_id,
          description: pr.description,
          earned: prEarned,
          max: prMax,
          confidence,
          sub_results: Array.isArray(pr.sub_results) ? pr.sub_results : [],
          reasoning: typeof pr.reasoning === 'string' ? pr.reasoning : '',
          suggestion,
        }
      })
      earned = Math.min(maxForPart, pointResults.reduce((sum, pr) => sum + pr.earned, 0))
    } else {
      const earnedRaw = typeof rp?.earned === 'number' && Number.isFinite(rp.earned) ? rp.earned : 0
      earned = Math.max(0, Math.min(maxForPart, Math.round(earnedRaw)))
    }

    return {
      letter: p.letter,
      earned,
      max: maxForPart,
      feedback: typeof rp?.feedback === 'string' && rp.feedback.trim() ? rp.feedback : 'No feedback provided.',
      missed: typeof rp?.missed === 'string' && rp.missed.trim() ? rp.missed : null,
      ...(pointResults !== undefined ? { point_results: pointResults } : {}),
    }
  })

  const max_score = gradableParts.reduce((sum, p) => sum + p.point_value, 0)
  const total_score = parts.reduce((sum, p) => sum + p.earned, 0)
  const takeaway = typeof raw.takeaway === 'string' && raw.takeaway.trim()
    ? raw.takeaway
    : 'Review the per-part feedback to see where you lost points.'

  // Log if we had to correct the LLM so we can monitor drift
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

// Server-side enforcement of cross-point dependencies.
// The prompt tells the AI about these, but we enforce them here as a safety net.
function enforceDependencies(question: FRQ, grading: FRQGradingResult): FRQGradingResult {
  const frqType = question.frq_type
  const parts = grading.parts.map(part => ({ ...part }))

  // Helper: find a point_result by ID across all parts
  function findPoint(pointId: string): { earned: number } | undefined {
    for (const p of parts) {
      const pr = p.point_results?.find(r => r.point_id === pointId)
      if (pr) return pr
    }
    return undefined
  }

  // Helper: zero out a point_result by ID
  function zeroPoint(pointId: string, reason: string) {
    for (const part of parts) {
      if (!part.point_results) continue
      const pr = part.point_results.find(r => r.point_id === pointId)
      if (pr && pr.earned > 0) {
        pr.earned = 0
        pr.reasoning = `${pr.reasoning} [server: ${reason}]`
        if (pr.sub_results) pr.sub_results = pr.sub_results.map(sr => ({ ...sr, met: false }))
      }
    }
  }

  if (frqType === 'argument_essay') {
    const thesis = findPoint('a1')
    if (!thesis || thesis.earned === 0) {
      // Rebuttal (d1) requires Thesis (a1)
      zeroPoint('d1', 'rebuttal requires thesis')
      // Evidence tier 3 (b3) requires Thesis
      zeroPoint('b3', 'evidence tier 3 requires thesis')
    }
  }

  if (frqType === 'dbq') {
    // Evidence+ (a4) requires Evidence (a3)
    const ev3 = findPoint('a3')
    if (!ev3 || ev3.earned === 0) {
      zeroPoint('a4', 'evidence+ requires evidence base')
    }
  }

  if (frqType === 'leq') {
    // Evidence+ requires basic Evidence
    const ev1 = findPoint('a3')
    if (!ev1 || ev1.earned === 0) {
      zeroPoint('a4', 'evidence+ requires evidence base')
    }
  }

  // Recalculate totals after dependency enforcement
  for (const part of parts) {
    if (part.point_results) {
      part.earned = part.point_results.reduce((sum, pr) => sum + pr.earned, 0)
    }
  }
  const total_score = parts.reduce((sum, p) => sum + p.earned, 0)

  return { ...grading, parts, total_score }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

// Strip LaTeX formatting so math notation differences don't cause false
// negatives in evidence verification. E.g. "\frac{d}{dx}" → "d/dx".
function normalizeLaTeX(s: string): string {
  let r = s
  // Strip $$ and $ delimiters
  r = r.replace(/\$\$/g, '').replace(/\$/g, '')
  // Replace \frac{a}{b} with a/b (handle nested braces via repeated passes)
  for (let i = 0; i < 5; i++) {
    r = r.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
  }
  // Strip \text{...} → keep inner text
  r = r.replace(/\\text\{([^{}]*)\}/g, '$1')
  // Strip \left and \right prefixes
  r = r.replace(/\\left/g, '').replace(/\\right/g, '')
  // Remove spacing commands
  r = r.replace(/\\(?:,|;|:|!|quad|qquad)\b/g, ' ')
  // Replace multiplication symbols
  r = r.replace(/\\cdot/g, '*').replace(/\\times/g, '*')
  // Replace comparison/equality symbols
  r = r.replace(/\\le\b/g, '<=').replace(/\\ge\b/g, '>=')
  r = r.replace(/\\ne\b/g, '!=').replace(/\\approx\b/g, '≈')
  // Strip style commands
  r = r.replace(/\\(?:displaystyle|textstyle|scriptstyle)\b/g, '')
  // Remove remaining \commandname sequences
  r = r.replace(/\\[a-zA-Z]+/g, '')
  // Collapse whitespace
  r = r.replace(/\s+/g, ' ').trim()
  return r
}

// Server-verify because LLM can fabricate quotes — strip any awarded point
// whose evidence quote is not a verbatim substring of the student's response.
function verifyEvidence(grading: FRQGradingResult, responses: Record<string, string>): FRQGradingResult {
  // Essay-type FRQs store the response under 'essay' key, not part letters
  const essayText = responses['essay'] ?? ''
  const parts = grading.parts.map(part => {
    if (!part.point_results || part.point_results.length === 0) return part
    const studentRaw = responses[part.letter] || essayText || ''
    const studentNorm = normalize(studentRaw)
    const studentLaTeX = normalize(normalizeLaTeX(studentRaw))
    const pointResults = part.point_results.map(pr => {
      const subResults = pr.sub_results.map(sr => {
        if (!sr.met) return sr
        const quote = sr.student_evidence_quote ?? ''
        if (quote.trim() === '') return { ...sr, met: false }
        const quoteNorm = normalize(quote)
        // Pass 1: exact normalized match
        if (studentNorm.includes(quoteNorm)) return sr
        // Pass 2: LaTeX-stripped match (for math subjects)
        const quoteLaTeX = normalize(normalizeLaTeX(quote))
        if (studentLaTeX.includes(quoteLaTeX)) return sr
        // Neither matched
        return { ...sr, met: false }
      })
      const allMet = subResults.length > 0 && subResults.every(sr => sr.met)
      const earned = allMet ? pr.max : 0
      const reasoning = earned < pr.earned
        ? `${pr.reasoning} [server: evidence not verified]`
        : pr.reasoning
      return { ...pr, sub_results: subResults, earned, reasoning }
    })
    const partEarned = pointResults.reduce((sum, pr) => sum + pr.earned, 0)
    return { ...part, point_results: pointResults, earned: partEarned }
  })
  const total_score = parts.reduce((sum, p) => sum + p.earned, 0)
  return { ...grading, parts, total_score }
}

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '')
}

async function loadFRQ(subject: string, questionId: string): Promise<FRQ | null> {
  try {
    const abs = path.join(process.cwd(), 'public', 'data', subject, 'frq', `${questionId}.json`)
    const raw = await readFile(abs, 'utf-8')
    return JSON.parse(raw) as FRQ
  } catch {
    return null
  }
}

async function loadStimulusImage(stimulusImagePath: string): Promise<Buffer | null> {
  try {
    const abs = path.join(process.cwd(), 'public', stimulusImagePath)
    const data = await readFile(abs)
    return data
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized', message: 'Please sign in to use FRQ grading.' }, { status: 401 })
  }

  // 2. Parse and validate request
  const rawBody = await req.text()
  if (rawBody.length > 100_000) {
    return Response.json({ error: 'payload_too_large' }, { status: 413 })
  }

  let body: { questionId?: string; subject?: string; responses?: Record<string, string>; strictness?: GradingStrictness }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { questionId, subject, responses, strictness = 'moderate' } = body
  if (!questionId || !subject || !responses || typeof responses !== 'object') {
    return Response.json({ error: 'invalid_request', message: 'Missing questionId, subject, or responses.' }, { status: 400 })
  }

  const safeSubject = sanitize(subject)
  const safeQuestionId = sanitize(questionId)

  // 3. Load the FRQ question data
  const question = await loadFRQ(safeSubject, safeQuestionId)
  if (!question) {
    return Response.json({ error: 'not_found', message: 'FRQ question not found.' }, { status: 404 })
  }

  // 3b. Short-circuit fully-blank submissions before touching the LLM.
  // Without this, an empty response hash means the grading prompt would
  // show no student text but the full answer key — the model hallucinates
  // credit (observed: 5/6 on a blank precalc FRQ). Also saves rate-limit calls.
  // Note: essay-type FRQs (DBQ, LEQ, essay, argument_essay) store their response
  // under the 'essay' key, not under part letters. Check both.
  const gradableLetters = question.parts.filter(p => !p.requires_drawing).map(p => p.letter)
  const allResponseValues = Object.values(responses)
  const allBlank = allResponseValues.every(v => isBlankResponse(v)) &&
    gradableLetters.every(letter => isBlankResponse(responses[letter]))

  const admin = getSupabaseAdmin()

  // 4. Create submission record
  const { data: submission, error: insertError } = await admin
    .from('frq_submissions')
    .insert({
      user_id: user.id,
      question_id: safeQuestionId,
      subject: safeSubject,
      responses,
      grading_status: 'pending',
    })
    .select('id')
    .single()

  if (insertError || !submission) {
    console.error('Failed to create FRQ submission:', insertError)
    return Response.json({ error: 'server_error', message: 'Failed to save submission.' }, { status: 500 })
  }

  // 4b. If everything is blank, synthesize a 0/max result — no LLM call,
  // no rate-limit charge, no hallucination risk.
  if (allBlank) {
    const grading = buildBlankResult(question)
    await admin
      .from('frq_results')
      .insert({
        submission_id: submission.id,
        total_score: grading.total_score,
        max_score: grading.max_score,
        part_breakdown: grading.parts,
        adi_takeaway: grading.takeaway,
      })
    await admin
      .from('frq_submissions')
      .update({ grading_status: 'graded' })
      .eq('id', submission.id)
    return Response.json({
      status: 'graded',
      submissionId: submission.id,
      result: grading,
    })
  }

  const validStrictness: GradingStrictness = ['light', 'moderate', 'strict'].includes(strictness) ? strictness : 'moderate'

  // Load stimulus image for image-only questions (stimulus_image set, stimulus null)
  let stimulusImageBuffer: Buffer | null = null
  if (question.stimulus_image && !question.stimulus) {
    stimulusImageBuffer = await loadStimulusImage(question.stimulus_image)
  }

  // 5. Check rate limit
  const usage = await checkAndIncrementUsage(user.id, getCallCost(validStrictness))

  if (!usage.allowed) {
    // Queue for later grading
    await admin
      .from('frq_submissions')
      .update({ grading_status: 'queued' })
      .eq('id', submission.id)

    return Response.json({
      status: 'queued',
      submissionId: submission.id,
      message: 'Your response has been saved. Adi will grade it when your daily limit resets.',
      resetAtEST: usage.resetAtEST,
    })
  }

  // 6. Grade with model routed by strictness
  try {
    const systemPrompt = buildFRQGradingPrompt(question, responses, validStrictness)

    const gradingUserContent = stimulusImageBuffer
      ? [
          { type: 'image' as const, image: stimulusImageBuffer },
          { type: 'text' as const, text: 'Grade this FRQ submission according to the rubric. Respond with the JSON scoring object only.' },
        ]
      : 'Grade this FRQ submission according to the rubric. Respond with the JSON scoring object only.'

    const result = await generateText({
      model: getModelForStrictness(validStrictness),
      system: systemPrompt,
      messages: [{ role: 'user', content: gradingUserContent }],
      maxOutputTokens: 3072,
      temperature: 0,
    })

    // Parse the primary grading result
    let grading: FRQGradingResult
    try {
      const cleanText = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleanText) as FRQGradingResult
      grading = sanitizeGrading(question, parsed)
    } catch {
      console.error('Failed to parse FRQ grading response:', result.text)
      await admin
        .from('frq_submissions')
        .update({ grading_status: 'queued' })
        .eq('id', submission.id)

      return Response.json({
        status: 'queued',
        submissionId: submission.id,
        message: 'Grading encountered an issue. Adi will retry shortly.',
      })
    }

    // Two-pass grading for strict: auditor only lowers scores, never raises them.
    if (validStrictness === 'strict') {
      try {
        const auditorPrompt = buildFRQAuditorPrompt(question, responses, grading, validStrictness)
        const auditorUserContent = stimulusImageBuffer
          ? [
              { type: 'image' as const, image: stimulusImageBuffer },
              { type: 'text' as const, text: 'Audit the grading result. Respond with the corrected JSON scoring object only.' },
            ]
          : 'Audit the grading result. Respond with the corrected JSON scoring object only.'

        const auditorResult = await generateText({
          model: getModelForStrictness(validStrictness),
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

    // 7. Save grading result
    const { error: resultError } = await admin
      .from('frq_results')
      .insert({
        submission_id: submission.id,
        total_score: grading.total_score,
        max_score: grading.max_score,
        part_breakdown: grading.parts,
        adi_takeaway: grading.takeaway,
      })

    if (resultError) {
      console.error('Failed to save FRQ result:', resultError)
    }

    // Update submission status
    await admin
      .from('frq_submissions')
      .update({ grading_status: 'graded' })
      .eq('id', submission.id)

    return Response.json({
      status: 'graded',
      submissionId: submission.id,
      result: grading,
    })

  } catch (error) {
    console.error('FRQ grading error:', error)
    // Queue for retry on API failure
    await admin
      .from('frq_submissions')
      .update({ grading_status: 'queued' })
      .eq('id', submission.id)

    return Response.json({
      status: 'queued',
      submissionId: submission.id,
      message: 'Grading temporarily unavailable. Adi will grade this when possible.',
    })
  }
}
