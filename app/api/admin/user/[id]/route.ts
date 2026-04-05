import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ascendly-admin-2026'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get('x-admin-password')
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const [profileResult, progressResult, statsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('user_progress').select('*').eq('user_id', id).order('subject'),
    supabase.from('user_stats').select('*').eq('user_id', id).single(),
  ])

  if (!profileResult.data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    profile: profileResult.data,
    progress: progressResult.data ?? [],
    stats: statsResult.data ?? { total_questions: 0, streak_count: 0 },
  })
}
