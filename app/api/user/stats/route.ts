import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { totalQuestions, streakCount, streakLastDate, drillCount, mcqCount, frqCount } = await req.json()

  const { error } = await supabase
    .from('user_stats')
    .upsert(
      {
        user_id: user.id,
        total_questions: totalQuestions,
        streak_count: streakCount,
        streak_last_date: streakLastDate,
        drill_count: drillCount ?? 0,
        mcq_count: mcqCount ?? 0,
        frq_count: frqCount ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('user/stats upsert error:', error.message)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  return NextResponse.json({ ok: true })
}
