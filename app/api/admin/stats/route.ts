import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_token')?.value
}

interface RawEvent {
  event_type: string
  subject: string
  unit: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: events, error: dbError } = await supabase
    .from('events')
    .select('event_type, subject, unit, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(10000)

  if (dbError) {
    console.error('Supabase query error:', dbError.message)
    return NextResponse.json({ error: dbError.message, empty: true })
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ empty: true })
  }

  const allEvents = events as RawEvent[]

  // Unique users — anon_id appears in metadata of any event
  const anonIds = new Set<string>()
  allEvents.forEach(e => {
    const id = e.metadata?.anon_id
    if (typeof id === 'string') anonIds.add(id)
  })

  // Session-level events (what the app actually logs)
  const drills = allEvents.filter(e => e.event_type === 'drill_completed')
  const mcqs = allEvents.filter(e => e.event_type === 'mcq_completed')
  const tests = allEvents.filter(e => e.event_type === 'test_completed')
  const guides = allEvents.filter(e => e.event_type === 'study_guide_view')

  // Question counts derived from session metadata
  // drills: metadata.cards_count, accuracy
  // mcqs:   metadata.question_count, accuracy
  // tests:  metadata.total, metadata.correct (already exact)
  const drillAnswersCount = drills.reduce((acc, e) => acc + (Number(e.metadata?.cards_count) || 0), 0)
  const mcqAnswersCount = mcqs.reduce((acc, e) => acc + (Number(e.metadata?.question_count) || 0), 0)
  const testAnswersCount = tests.reduce((acc, e) => acc + (Number(e.metadata?.total) || 0), 0)

  const drillCorrectCount = drills.reduce((acc, e) => {
    const count = Number(e.metadata?.cards_count) || 0
    const accuracy = Number(e.metadata?.accuracy) || 0
    return acc + Math.round(accuracy * count)
  }, 0)
  const mcqCorrectCount = mcqs.reduce((acc, e) => {
    const count = Number(e.metadata?.question_count) || 0
    const accuracy = Number(e.metadata?.accuracy) || 0
    return acc + Math.round(accuracy * count)
  }, 0)
  const testCorrectCount = tests.reduce((acc, e) => acc + (Number(e.metadata?.correct) || 0), 0)

  const totalAnswers = drillAnswersCount + mcqAnswersCount + testAnswersCount
  const totalCorrect = drillCorrectCount + mcqCorrectCount + testCorrectCount

  function sumDuration(evts: RawEvent[]): number {
    return evts.reduce((acc, e) => acc + (Number(e.metadata?.duration_ms) || 0), 0)
  }

  // By subject — question counts from metadata
  const subjects = [...new Set(allEvents.map(e => e.subject).filter(Boolean))]
  const bySubject = subjects.map(s => ({
    subject: s,
    drills: drills.filter(e => e.subject === s).reduce((acc, e) => acc + (Number(e.metadata?.cards_count) || 0), 0),
    mcqs: mcqs.filter(e => e.subject === s).reduce((acc, e) => acc + (Number(e.metadata?.question_count) || 0), 0),
    tests: tests.filter(e => e.subject === s).length,
    guides: guides.filter(e => e.subject === s).length,
  })).sort((a, b) => (b.drills + b.mcqs + b.tests + b.guides) - (a.drills + a.mcqs + a.tests + a.guides))

  // Daily (last 30 days) — session counts for chart
  const daily: Record<string, { events: number; users: Set<string>; drills: number; mcqs: number; tests: number; guides: number }> = {}
  allEvents.forEach(e => {
    const day = e.created_at.slice(0, 10)
    if (!daily[day]) daily[day] = { events: 0, users: new Set(), drills: 0, mcqs: 0, tests: 0, guides: 0 }
    daily[day].events++
    const id = e.metadata?.anon_id
    if (typeof id === 'string') daily[day].users.add(id)
    if (e.event_type === 'drill_completed') daily[day].drills++
    if (e.event_type === 'mcq_completed') daily[day].mcqs++
    if (e.event_type === 'test_completed') daily[day].tests++
    if (e.event_type === 'study_guide_view') daily[day].guides++
  })

  const dailyClean = Object.entries(daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([day, v]) => ({ day, events: v.events, users: v.users.size, drills: v.drills, mcqs: v.mcqs, tests: v.tests, guides: v.guides }))

  return NextResponse.json({
    overview: {
      uniqueUsers: anonIds.size,
      totalEvents: allEvents.length,
      totalDrillSessions: drills.length,
      totalMCQSessions: mcqs.length,
      totalTests: tests.length,
      totalGuideViews: guides.length,
      drillAnswers: drillAnswersCount,
      mcqAnswers: mcqAnswersCount,
      testAnswers: testAnswersCount,
      totalAnswers,
      totalCorrect,
    },
    averages: {
      drillAccuracy: drillAnswersCount > 0 ? drillCorrectCount / drillAnswersCount : 0,
      mcqAccuracy: mcqAnswersCount > 0 ? mcqCorrectCount / mcqAnswersCount : 0,
      testAccuracy: testAnswersCount > 0 ? testCorrectCount / testAnswersCount : 0,
      drillCardsPerSession: drills.length > 0 ? drillAnswersCount / drills.length : 0,
      mcqQuestionsPerSession: mcqs.length > 0 ? mcqAnswersCount / mcqs.length : 0,
    },
    time: {
      totalMs: sumDuration(drills) + sumDuration(mcqs) + sumDuration(tests),
      drillMs: sumDuration(drills),
      mcqMs: sumDuration(mcqs),
      testMs: sumDuration(tests),
    },
    bySubject,
    daily: dailyClean,
    recentEvents: allEvents.slice(0, 30).map(e => ({
      event_type: e.event_type,
      subject: e.subject,
      unit: e.unit,
      created_at: e.created_at,
    })),
  })
}
