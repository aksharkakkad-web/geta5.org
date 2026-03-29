import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_token')?.value
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Total events
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  // All events with metadata for processing
  const { data: events } = await supabase
    .from('events')
    .select('event_type, subject, unit, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(10000)

  if (!events) {
    return NextResponse.json({
      totalEvents: totalEvents ?? 0,
      uniqueUsers: 0,
      questionsAnswered: 0,
      bySubject: {},
      byDay: {},
      recentEvents: [],
    })
  }

  // Unique users by anon_id in metadata
  const anonIds = new Set<string>()
  events.forEach(e => {
    const id = (e.metadata as Record<string, unknown>)?.anon_id
    if (typeof id === 'string') anonIds.add(id)
  })

  // Questions answered (drill_complete, mcq_complete, test_complete events)
  const questionEvents = events.filter(e =>
    ['drill_complete', 'mcq_complete', 'test_complete'].includes(e.event_type)
  )

  // By subject
  const bySubject: Record<string, number> = {}
  events.forEach(e => {
    bySubject[e.subject] = (bySubject[e.subject] || 0) + 1
  })

  // By day (last 30 days)
  const byDay: Record<string, { events: number; users: Set<string> }> = {}
  events.forEach(e => {
    const day = e.created_at.slice(0, 10)
    if (!byDay[day]) byDay[day] = { events: 0, users: new Set() }
    byDay[day].events++
    const id = (e.metadata as Record<string, unknown>)?.anon_id
    if (typeof id === 'string') byDay[day].users.add(id)
  })

  const byDayClean: Record<string, { events: number; users: number }> = {}
  Object.entries(byDay).forEach(([day, v]) => {
    byDayClean[day] = { events: v.events, users: v.users.size }
  })

  // By event type
  const byType: Record<string, number> = {}
  events.forEach(e => {
    byType[e.event_type] = (byType[e.event_type] || 0) + 1
  })

  return NextResponse.json({
    totalEvents: totalEvents ?? 0,
    uniqueUsers: anonIds.size,
    questionsAnswered: questionEvents.length,
    bySubject,
    byDay: byDayClean,
    byType,
    recentEvents: events.slice(0, 50).map(e => ({
      event_type: e.event_type,
      subject: e.subject,
      unit: e.unit,
      created_at: e.created_at,
    })),
  })
}
