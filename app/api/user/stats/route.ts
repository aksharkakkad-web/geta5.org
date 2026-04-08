import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { error } = await supabase
    .from('user_stats')
    .upsert(
      {
        user_id: user.id,
        total_questions: body.totalQuestions ?? 0,
        streak_count: body.streakCount ?? 0,
        streak_last_date: body.streakLastDate ?? null,
        drill_count: body.drillCount ?? 0,
        mcq_count: body.mcqCount ?? 0,
        frq_count: body.frqCount ?? 0,
        drill_correct: body.drillCorrect ?? 0,
        mcq_correct: body.mcqCorrect ?? 0,
        total_seconds: body.totalSeconds ?? 0,
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
