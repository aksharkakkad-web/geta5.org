import { createClient } from '@/lib/supabase-server'
import type { FRQ, GradingStrictness } from '@/utils/frqSession'
import { runFRQGrading, isBlankResponse, buildBlankResult } from '@/utils/frqGrading'
import { readFile } from 'fs/promises'
import path from 'path'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
  const validStrictness: GradingStrictness = ['light', 'moderate', 'strict'].includes(strictness) ? strictness : 'moderate'

  // 3. Load the FRQ question data
  const question = await loadFRQ(safeSubject, safeQuestionId)
  if (!question) {
    return Response.json({ error: 'not_found', message: 'FRQ question not found.' }, { status: 404 })
  }

  // 3b. Detect fully-blank submissions before touching the LLM. Without this,
  // an empty response hash means the grading prompt would show no student text
  // but the full answer key — the model hallucinates credit. Also saves
  // rate-limit calls. Note: essay-type FRQs (DBQ, LEQ, essay, argument_essay)
  // store their response under the 'essay' key, not under part letters.
  const gradableLetters = question.parts.filter(p => !p.requires_drawing).map(p => p.letter)
  const allResponseValues = Object.values(responses)
  const allBlank = allResponseValues.every(v => isBlankResponse(v)) &&
    gradableLetters.every(letter => isBlankResponse(responses[letter]))

  const admin = getSupabaseAdmin()

  // 4. Create submission record (persist strictness so we can regrade later
  // with the same rigor the user originally chose)
  const { data: submission, error: insertError } = await admin
    .from('frq_submissions')
    .insert({
      user_id: user.id,
      question_id: safeQuestionId,
      subject: safeSubject,
      responses,
      strictness: validStrictness,
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

  // 5. Load stimulus image for image-only questions (stimulus_image set, stimulus null)
  let stimulusImageBuffer: Buffer | null = null
  if (question.stimulus_image && !question.stimulus) {
    stimulusImageBuffer = await loadStimulusImage(question.stimulus_image)
  }

  // 6. Hand off to the shared grading pipeline. This handles rate limiting,
  // LLM grading, completeness retry, strict-mode auditor, dependency
  // enforcement, evidence verification, and persisting the result.
  const payload = await runFRQGrading({
    submissionId: submission.id,
    userId: user.id,
    question,
    responses,
    strictness: validStrictness,
    stimulusImageBuffer,
  })

  return Response.json(payload)
}
