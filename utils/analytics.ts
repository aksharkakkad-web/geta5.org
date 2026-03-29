// utils/analytics.ts
// Fire-and-forget — NEVER awaited by UI code, NEVER throws to caller

interface EventPayload {
  event_type: string
  subject: string
  unit?: string
  metadata?: Record<string, unknown>
}

function getAnonId(): string {
  const key = 'ascendly_anon_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function logEvent(payload: EventPayload): void {
  if (typeof window === 'undefined') return
  const anon_id = getAnonId()
  fetch('/api/log-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      metadata: { ...payload.metadata, anon_id },
    }),
  }).catch(() => {
    // Silently ignore all failures — never block UI
  })
}
