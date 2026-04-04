import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

interface MasteryPayload {
  subject: string
  unit: string
  drillAccuracy: number
  mcqAccuracy: number
  totalAttempts: number
}

interface MigrationPayload {
  mastery: MasteryPayload[]
  totalQuestions: number
  streakCount: number
  streakLastDate: string | null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload: MigrationPayload = await req.json()

  const { data: existingStats } = await supabase
    .from('user_stats')
    .select('total_questions')
    .eq('user_id', user.id)
    .single()

  const mergedTotalQuestions = Math.max(
    payload.totalQuestions,
    existingStats?.total_questions ?? 0
  )

  await supabase
    .from('user_stats')
    .upsert({
      user_id: user.id,
      total_questions: mergedTotalQuestions,
      streak_count: payload.streakCount,
      streak_last_date: payload.streakLastDate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  for (const m of payload.mastery) {
    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject', m.subject)
      .eq('unit', m.unit)
      .single()

    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        subject: m.subject,
        unit: m.unit,
        drill_accuracy: Math.max(m.drillAccuracy, existing?.drill_accuracy ?? 0),
        mcq_accuracy: Math.max(m.mcqAccuracy, existing?.mcq_accuracy ?? 0),
        total_attempts: (existing?.total_attempts ?? 0) + m.totalAttempts,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,subject,unit' })
  }

  return NextResponse.json({ ok: true })
}
