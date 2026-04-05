import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, unit, drillAccuracy, mcqAccuracy, totalAttempts } = await req.json()

  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: user.id,
        subject,
        unit,
        drill_accuracy: drillAccuracy,
        mcq_accuracy: mcqAccuracy,
        total_attempts: totalAttempts,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,subject,unit' }
    )

  if (error) {
    console.error('user/progress upsert error:', error.message)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  return NextResponse.json({ ok: true })
}
