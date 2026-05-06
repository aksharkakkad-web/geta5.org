import { createClient } from '@/lib/supabase-server'
import type { FRQ, FRQGradingResult, GradingStrictness } from '@/utils/frqSession'
import { FRQ_AI_GRADING_ENABLED } from '@/utils/frqSession'
import { runFRQGrading } from '@/utils/frqGrading'
import { readFile } from 'fs/promises'
import path from 'path'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const maxDuration = 60

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

// POST /api/frq/grade-queued
// Re-runs grading on a previously queued submission using the user's fresh
// daily allotment. The original responses + strictness are stored on the
// submission row, so we don't accept any grading inputs from the client —
// the user just authorizes spending credits on a specific submission ID.
export async function POST(req: Request) {
  // Kill-switch — AI grading is paused.
  if (!FRQ_AI_GRADING_ENABLED) {
    return Response.json(
      {
        status: 'paused',
        message: 'AI grading is temporarily paused due to high demand. Save your response and grade externally with your own AI.',
      },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized', message: 'Please sign in to use FRQ grading.' }, { status: 401 })
  }

  let body: { submissionId?: string }
  try {
    body = JSON.parse(await req.text())
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const submissionId = typeof body.submissionId === 'string' ? body.submissionId : ''
  // Submission IDs are uuids — anything else is a fast reject.
  if (!/^[0-9a-fA-F-]{36}$/.test(submissionId)) {
    return Response.json({ error: 'invalid_request', message: 'Missing or invalid submissionId.' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()
  const { data: submission, error: fetchError } = await admin
    .from('frq_submissions')
    .select('id, user_id, question_id, subject, responses, strictness, grading_status')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) {
    return Response.json({ error: 'not_found', message: 'Submission not found.' }, { status: 404 })
  }

  if (submission.user_id !== user.id) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  // Idempotency: if already graded, return the existing result instead of
  // billing again. Guards against accidental double-taps and tab duplication.
  if (submission.grading_status === 'graded') {
    const { data: existing } = await admin
      .from('frq_results')
      .select('total_score, max_score, part_breakdown, adi_takeaway')
      .eq('submission_id', submissionId)
      .single()

    if (existing) {
      const result: FRQGradingResult = {
        total_score: existing.total_score,
        max_score: existing.max_score,
        parts: Array.isArray(existing.part_breakdown) ? existing.part_breakdown : [],
        takeaway: existing.adi_takeaway ?? '',
      }
      return Response.json({
        status: 'graded',
        submissionId,
        result,
        responses: (submission.responses ?? {}) as Record<string, string>,
        questionId: submission.question_id,
        strictness: submission.strictness,
      })
    }
  }

  // Only queued submissions are eligible for re-grading. 'pending' shouldn't
  // be reachable here in practice (the submit flow always transitions it), but
  // we treat it as queued-equivalent.
  if (submission.grading_status !== 'queued' && submission.grading_status !== 'pending') {
    return Response.json({ error: 'invalid_state', message: 'This submission is not awaiting grading.' }, { status: 409 })
  }

  const safeSubject = sanitize(submission.subject)
  const safeQuestionId = sanitize(submission.question_id)
  const question = await loadFRQ(safeSubject, safeQuestionId)
  if (!question) {
    return Response.json({ error: 'not_found', message: 'FRQ question no longer available.' }, { status: 404 })
  }

  const validStrictness: GradingStrictness = ['light', 'moderate', 'strict'].includes(submission.strictness)
    ? (submission.strictness as GradingStrictness)
    : 'moderate'

  let stimulusImageBuffer: Buffer | null = null
  if (question.stimulus_image && !question.stimulus) {
    stimulusImageBuffer = await loadStimulusImage(question.stimulus_image)
  }

  const responses = (submission.responses ?? {}) as Record<string, string>

  const payload = await runFRQGrading({
    submissionId,
    userId: user.id,
    question,
    responses,
    strictness: validStrictness,
    stimulusImageBuffer,
  })

  // Enrich the response so the client can render the results screen without
  // needing to refetch the submission. Local state was lost when the original
  // submission got queued.
  if (payload.status === 'graded') {
    return Response.json({
      ...payload,
      responses,
      questionId: submission.question_id,
      strictness: validStrictness,
    })
  }

  return Response.json(payload)
}
