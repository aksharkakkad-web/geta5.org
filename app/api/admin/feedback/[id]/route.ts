import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ascendly-admin-2026'

const VALID_STATUSES = ['new', 'reviewed', 'resolved'] as const
type Status = typeof VALID_STATUSES[number]

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get('x-admin-password')
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: { status?: string; admin_note?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, admin_note } = body

  if (status === undefined && admin_note === undefined) {
    return NextResponse.json({ error: 'At least one field (status or admin_note) is required' }, { status: 400 })
  }

  if (status !== undefined && !(VALID_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  if (typeof admin_note === 'string' && admin_note.length > 2000) {
    return NextResponse.json({ error: 'admin_note exceeds 2000 characters' }, { status: 400 })
  }

  const update: Partial<{ status: Status; admin_note: string | null }> = {}
  if (status !== undefined) update.status = status as Status
  if (admin_note !== undefined) update.admin_note = admin_note

  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('feedback')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
