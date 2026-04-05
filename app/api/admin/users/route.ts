import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ascendly-admin-2026'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, display_name, created_at')
    .order('created_at', { ascending: false })

  const { data: stats } = await supabase
    .from('user_stats')
    .select('user_id, total_questions, streak_count, updated_at')

  const statsMap = new Map((stats ?? []).map(s => [s.user_id, s]))

  const users = (profiles ?? []).map(p => ({
    id: p.id,
    email: p.email,
    displayName: p.display_name,
    createdAt: p.created_at,
    totalQuestions: statsMap.get(p.id)?.total_questions ?? 0,
    streakCount: statsMap.get(p.id)?.streak_count ?? 0,
    lastActive: statsMap.get(p.id)?.updated_at ?? p.created_at,
  }))

  return NextResponse.json({ users, total: users.length })
}
