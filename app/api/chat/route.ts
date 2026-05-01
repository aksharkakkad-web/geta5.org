import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { buildSystemPrompt, type AdiContext } from '@/utils/adiPrompt'
import { checkAndIncrementAdiUsage } from '@/utils/adiRateLimit'
import { createClient } from '@/lib/supabase-server'

export const maxDuration = 60

// IP burst protection: 10 requests/minute per IP (defense against rapid-fire scripts)
const ipBurst = new Map<string, { count: number; resetAt: number }>()
const IP_BURST_LIMIT = 10
const IP_BURST_WINDOW_MS = 60 * 1000
const IP_MAP_MAX = 10_000

function checkIPBurst(ip: string): boolean {
  const now = Date.now()

  // Evict stale entries if map grows too large (prevents memory exhaustion)
  if (ipBurst.size > IP_MAP_MAX) {
    for (const [key, val] of ipBurst) {
      if (now > val.resetAt) ipBurst.delete(key)
    }
  }

  const entry = ipBurst.get(ip)
  if (!entry || now > entry.resetAt) {
    ipBurst.set(ip, { count: 1, resetAt: now + IP_BURST_WINDOW_MS })
    return true
  }
  if (entry.count >= IP_BURST_LIMIT) return false
  entry.count++
  return true
}

// Sanitize path segments to prevent directory traversal
function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '')
}

export async function POST(req: Request) {
  // 1. IP burst check — first line of defense against scripts
  // On Vercel, take the last value of x-forwarded-for (proxy-appended, not client-controlled)
  const xff = req.headers.get('x-forwarded-for')
  const ip = xff ? xff.split(',').pop()!.trim() : req.headers.get('x-real-ip') ?? 'unknown'

  if (!checkIPBurst(ip)) {
    return Response.json({ error: 'too_many_requests', message: 'Slow down — too many requests.' }, { status: 429 })
  }

  // 2. Auth check — Adi requires login
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'unauthorized', message: 'Please sign in to use Adi.' }, { status: 401 })
  }

  // 3. Per-user + global rate limit check
  const usage = await checkAndIncrementAdiUsage(user.id)

  if (!usage.allowed) {
    const message = usage.reason === 'global_limit'
      ? 'Adi is taking a break — daily limit reached. Back tomorrow!'
      : `You've used all ${usage.limit} Adi messages for today. Resets at ${usage.resetAtEST}.`

    return Response.json(
      { error: 'rate_limited', reason: usage.reason, message, resetAtEST: usage.resetAtEST },
      { status: 429 }
    )
  }

  // 4. Request body validation — reject oversized payloads before parsing
  const rawBody = await req.text()
  if (rawBody.length > 50_000) {
    return Response.json({ error: 'payload_too_large' }, { status: 413 })
  }

  let body: { messages?: unknown; context?: unknown }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!body || !Array.isArray(body.messages)) {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }

  const { messages, context } = body as {
    messages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }>
    context: AdiContext
  }

  // 5. Sanitize context to prevent path traversal
  if (context) {
    context.subject = sanitize(context.subject ?? '')
    context.unit = sanitize(context.unit ?? '')
    if (context.questionId) context.questionId = sanitize(context.questionId)
  }

  // 6. Filter roles — only user and assistant allowed (prevents system prompt injection)
  const recentMessages = messages
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .slice(-10)
    .map((msg) => {
      const text = msg.content ?? msg.parts?.filter((p) => p.type === 'text').map((p) => p.text).join('') ?? ''
      // Cap individual message length
      return { role: msg.role as 'user' | 'assistant', content: text.slice(0, 4000) }
    })

  const systemPrompt = await buildSystemPrompt(context)

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: recentMessages,
    maxOutputTokens: 1024,
    maxRetries: 3,
  })

  return result.toTextStreamResponse()
}
