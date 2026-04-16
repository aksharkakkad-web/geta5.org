import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { submissionId?: string; pointId?: string; vote?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { submissionId, pointId, vote } = body
  if (!submissionId || !pointId || !vote || !['up', 'down'].includes(vote)) {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  // Verify submission belongs to user
  const { data: submission } = await admin
    .from('frq_submissions')
    .select('user_id')
    .eq('id', submissionId)
    .single()

  if (!submission || submission.user_id !== user.id) {
    return Response.json({ error: 'not_found' }, { status: 404 })
  }

  // Upsert: one vote per point per submission
  const { error } = await admin
    .from('frq_feedback')
    .upsert(
      { submission_id: submissionId, point_id: pointId, vote },
      { onConflict: 'submission_id,point_id' }
    )

  if (error) {
    console.error('Failed to save FRQ feedback:', error)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
