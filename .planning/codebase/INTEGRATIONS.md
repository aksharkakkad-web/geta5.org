# Integrations

**Analysis Date:** 2026-03-23

## Supabase — Anonymous Event Logging

**Purpose:** Track anonymous usage events (page views, session completions) to understand engagement. Zero PII — no user accounts, no session identifiers.

**Client setup:** `lib/supabase.ts`
```ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Event routing architecture:**
- UI code calls `utils/analytics.ts → logEvent()` — client-side, fire-and-forget
- `logEvent()` POSTs to `/api/log-event` (Next.js Route Handler)
- The Route Handler writes to Supabase using `SUPABASE_ANON_KEY` (server-only, not exposed to client bundle)
- All failures caught and suppressed — never throws to UI

**`utils/analytics.ts` pattern:**
```ts
export function logEvent(payload: EventPayload): void {
  if (typeof window === 'undefined') return
  fetch('/api/log-event', { method: 'POST', ... }).catch(() => {})
}
```

**`app/api/log-event/route.ts` behavior:**
- Validates `event_type` + `subject` present
- Always returns HTTP 200 even on Supabase error (logs server-side only)
- Ensures UI is never blocked by analytics failures

**Database table: `events`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Auto-generated |
| event_type | text | e.g. `page_view`, `drill_complete` |
| subject | text | e.g. `ap-psychology` |
| unit | text | Nullable |
| metadata | jsonb | Nullable — extra payload |
| created_at | timestamptz | Auto-generated |

**Required environment variables:**
- `NEXT_PUBLIC_SUPABASE_URL` — exposed to client bundle (URL only, safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client key (for `lib/supabase.ts`)
- `SUPABASE_ANON_KEY` — server-only key (for `/api/log-event/route.ts`)

**Current analytics events fired:**
- `page_view` — fired by `SubjectAnalytics` client component on subject hub mount

## Vercel — Deployment

**Target:** `ascendly.vercel.app` (planned — not yet deployed)
**Config:** `next.config.ts` — minimal, no custom options
**Strategy:** Free tier, standard Next.js deployment
**Environment variables:** Must be set in Vercel project settings: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`

## localStorage — Client-Side Storage

Not an external integration, but the primary data persistence layer.

**Pattern:** All reads/writes go through `utils/localStorage.ts` helpers (`lsGet`, `lsSet`, `lsClear`) which guard against SSR (`typeof window === 'undefined'`) and catch parse errors silently.

**Keys in use:**
| Key | Shape | Purpose |
|-----|-------|---------|
| `ascendly_streak` | `{ count: number, lastPracticeDate: string }` | Daily streak tracking |
| `ascendly_mastery_[subject]_[unit]` | `{ drillAccuracy: number, mcqAccuracy: number, totalAttempts: number }` | Per-unit mastery |
| `ascendly_score_[subject]` | `{ projectedScore: 1–5, accuracy: number }` | Per-subject projected score |
| `ascendly_total_questions` | `number` | Cumulative question count |
| `ascendly_active_subject` | `string` | URL slug of most recent subject |

## No Other External Integrations

- No authentication provider
- No payment processor
- No CDN configuration beyond Vercel defaults
- No third-party analytics (Mixpanel, PostHog, etc.)
- No CMS

---
*Integrations analysis: 2026-03-23*
