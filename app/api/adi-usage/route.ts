import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getUserUsageToday } from '@/utils/adiRateLimit'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const usage = await getUserUsageToday(user.id)
  return NextResponse.json(usage)
}
