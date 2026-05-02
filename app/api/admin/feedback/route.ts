import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ascendly-admin-2026'

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status') ?? 'all'
  const categoryParam = searchParams.get('category') ?? 'all'
  const limitParam = Math.min(parseInt(searchParams.get('limit') ?? '200', 10), 500)

  const admin = getSupabaseAdmin()

  // Build main query
  let query = admin
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limitParam)

  if (statusParam !== 'all') {
    query = query.eq('status', statusParam)
  }
  if (categoryParam !== 'all') {
    query = query.eq('category', categoryParam)
  }

  const { data: rows, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = rows ?? []

  // Join user emails from profiles
  const userIds = Array.from(new Set(items.map((r: any) => r.user_id).filter(Boolean)))
  let profileMap = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email')
      .in('id', userIds)
    for (const p of profiles ?? []) {
      if (p.email) profileMap.set(p.id, p.email)
    }
  }

  const enrichedItems = items.map((r: any) => ({
    ...r,
    user_email: r.user_id ? (profileMap.get(r.user_id) ?? null) : null,
  }))

  // Aggregate counts — tally from all rows (without status filter) to always return totals
  const { data: allStatuses } = await admin
    .from('feedback')
    .select('status')

  const counts = { new: 0, reviewed: 0, resolved: 0 }
  for (const row of allStatuses ?? []) {
    const s = row.status as keyof typeof counts
    if (s in counts) counts[s]++
  }

  return NextResponse.json({ items: enrichedItems, counts })
}
