import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [progressResult, statsResult] = await Promise.all([
    supabase.from('user_progress').select('*').eq('user_id', user.id),
    supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
  ])

  return NextResponse.json({
    progress: progressResult.data ?? [],
    stats: statsResult.data ?? { total_questions: 0, streak_count: 0, streak_last_date: null },
  })
}
