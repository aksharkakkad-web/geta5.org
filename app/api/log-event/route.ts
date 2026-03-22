// app/api/log-event/route.ts
// Server-side only — anonymous event logging, never blocks the UI
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Uses non-public env var to keep key out of client bundle
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, subject, unit, metadata } = body

    if (!event_type || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('events')
      .insert({
        event_type,
        subject,
        unit: unit ?? null,
        metadata: metadata ?? null,
      })

    if (error) {
      // Log server-side but always return 200 — never block clients
      console.error('Supabase insert error:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('log-event route error:', err)
    return NextResponse.json({ ok: false }, { status: 200 }) // Always 200 to client
  }
}
