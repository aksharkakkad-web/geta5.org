import { createClient } from '@/lib/supabase-server'

// ── Rate limiter ──────────────────────────────────────────────────────────────
const RATE_LIMIT_BUCKET = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5

let lastSweep = Date.now()
const SWEEP_INTERVAL_MS = 30 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()

  // Periodic global sweep — drop IPs whose timestamps have all aged out
  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    for (const [key, arr] of RATE_LIMIT_BUCKET) {
      const fresh = arr.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
      if (fresh.length === 0) RATE_LIMIT_BUCKET.delete(key)
      else RATE_LIMIT_BUCKET.set(key, fresh)
    }
    lastSweep = now
  }

  const arr = (RATE_LIMIT_BUCKET.get(ip) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  if (arr.length >= RATE_LIMIT_MAX) return false
  arr.push(now)
  RATE_LIMIT_BUCKET.set(ip, arr)
  return true
}

// ── Validators ────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = ['bug', 'feature', 'content', 'other'] as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'rate_limited' }, { status: 429 })
  }

  // Parse body
  let body: { category?: unknown; message?: unknown; contact_email?: unknown; page_url?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 })
  }

  const { category, message, contact_email, page_url } = body

  // Validate category
  if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return Response.json({ error: 'invalid' }, { status: 400 })
  }

  // Validate message
  if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 5000) {
    return Response.json({ error: 'invalid' }, { status: 400 })
  }

  // Validate contact_email (optional)
  if (contact_email !== undefined && contact_email !== null && contact_email !== '') {
    if (typeof contact_email !== 'string' || contact_email.length > 254 || !EMAIL_RE.test(contact_email)) {
      return Response.json({ error: 'invalid' }, { status: 400 })
    }
  }

  // Validate page_url (optional)
  if (page_url !== undefined && page_url !== null && page_url !== '') {
    if (typeof page_url !== 'string' || page_url.length > 500) {
      return Response.json({ error: 'invalid' }, { status: 400 })
    }
  }

  // Get authenticated user (nullable — anon OK)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const user_id = user?.id ?? null

  // Capture user agent
  const user_agent = req.headers.get('user-agent') ?? null

  // Insert
  const { error } = await supabase.from('feedback').insert({
    user_id,
    category,
    message: (message as string).trim(),
    contact_email: contact_email || null,
    page_url: page_url || null,
    user_agent,
  })

  if (error) {
    console.error('Failed to insert feedback:', error)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
