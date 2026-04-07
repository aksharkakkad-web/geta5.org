import { createClient } from '@/lib/supabase-server'

// GET /api/frq/queue — returns user's FRQ submissions with grading status
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')

  let query = supabase
    .from('frq_submissions')
    .select(`
      id,
      question_id,
      subject,
      grading_status,
      created_at,
      frq_results (
        total_score,
        max_score,
        part_breakdown,
        adi_takeaway,
        graded_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (subject) {
    query = query.eq('subject', subject)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch FRQ queue:', error)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }

  return Response.json({ submissions: data ?? [] })
}
