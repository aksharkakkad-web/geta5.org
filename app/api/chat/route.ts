import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { buildSystemPrompt, type AdiContext } from '@/utils/adiPrompt'

// Simple in-memory rate limit: IP → { count, resetAt }
const ipCounts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, context } = (await req.json()) as {
    messages: Array<{
      role: 'user' | 'assistant'
      content?: string
      parts?: Array<{ type: string; text?: string }>
    }>
    context: AdiContext
  }

  // Convert v6 parts format to content strings for the AI model
  const recentMessages = messages.slice(-10).map((msg) => ({
    role: msg.role,
    content: msg.content ?? msg.parts?.filter((p) => p.type === 'text').map((p) => p.text).join('') ?? '',
  }))

  const systemPrompt = await buildSystemPrompt(context)

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: recentMessages,
  })

  return result.toTextStreamResponse()
}
