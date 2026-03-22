// utils/analytics.ts
// Fire-and-forget — NEVER awaited by UI code, NEVER throws to caller

interface EventPayload {
  event_type: string
  subject: string
  unit?: string
  metadata?: Record<string, unknown>
}

export function logEvent(payload: EventPayload): void {
  if (typeof window === 'undefined') return
  fetch('/api/log-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently ignore all failures — never block UI
  })
}
