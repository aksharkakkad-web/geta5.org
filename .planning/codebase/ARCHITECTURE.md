# Architecture

**Analysis Date:** 2026-03-23

## App Router Page Hierarchy

```
app/
├── layout.tsx              ← Root layout: Header + <main> with 56px paddingTop
├── page.tsx                ← Homepage: subject grid + streak strip
├── globals.css             ← Theme tokens, base resets
├── not-found.tsx           ← 404 page
├── [subject]/
│   ├── page.tsx            ← Subject hub: mode cards + unit progress
│   ├── drills/page.tsx     ← Stub ("Coming in Phase 2")
│   ├── practice/page.tsx   ← Stub
│   ├── study-guide/page.tsx ← Stub
│   └── practice-test/page.tsx ← Stub
└── api/
    └── log-event/route.ts  ← Analytics Route Handler (POST only)
```

**Layout nesting:**
- `app/layout.tsx` wraps all pages with `<Header>` and `<main style={{ paddingTop: '56px' }}>`
- No nested layouts (no `[subject]/layout.tsx`)
- All pages are independently responsible for their own max-width containers

## Server vs Client Component Boundary

**Server Components (default in App Router):**
- `app/page.tsx` — calls `getAllSubjects()` synchronously, renders static grid
- `app/[subject]/page.tsx` — awaits `params`, calls `getSubject()`, computes exam dates

**Client Components (`'use client'`):**
- `components/ui/StreakStrip.tsx` — reads localStorage on mount
- `components/ui/UnitProgressGrid.tsx` — reads mastery from localStorage on mount
- `components/ui/ProjectedScoreBadge.tsx` — reads score from localStorage on mount
- `components/ui/SubjectAnalytics.tsx` — fires analytics event on mount (renders null)

**Pattern:** Server components handle data-fetching and layout. Client "islands" mount into server pages to read localStorage (SSR-incompatible) or fire side effects. Client islands render nothing until hydrated.

## Data Flow

### Subject Data
```
utils/subjects.ts (in-memory array)
  → getSubject(slug) / getAllSubjects()
  → Server components (page.tsx files)
  → Props drilled to Client components
```

Subject data (names, slugs, exam dates, units) is hardcoded in `utils/subjects.ts`. No JSON files, no database.

### Content Data (Planned — Phases 6–12)
```
data/[subject]/[unit]-drills.json
data/[subject]/[unit]-mcq.json
  → Imported in page components
  → Rendered via KatexRenderer, ChartRenderer, TableRenderer
```
Currently no content JSON files exist — only schemas in `data/schemas/`.

### Mastery / Progress Data
```
localStorage (client only)
  → lsGet / lsSet from utils/localStorage.ts
  → Client components: UnitProgressGrid, ProjectedScoreBadge, StreakStrip
  → utils/scoring.ts: projectScore(accuracy) → 1|2|3|4|5
```

### Analytics Flow
```
Client component (e.g. SubjectAnalytics)
  → logEvent() in utils/analytics.ts
  → POST /api/log-event
  → Supabase events table
```
Fire-and-forget: UI never awaits or catches failures.

## Routing Patterns

**Subject hub:** `/{subject-slug}` → `app/[subject]/page.tsx`
**Mode pages:** `/{subject-slug}/drills`, `/practice`, `/study-guide`, `/practice-test`

Subject slugs are lowercase kebab-case matching `utils/subjects.ts` (`ap-psychology`, `ap-calculus-ab`, etc.).

`notFound()` is called when `getSubject(slug)` returns undefined, giving a proper 404.

`dynamic = 'force-dynamic'` on subject page prevents stale "days to go" countdown from being frozen at build time.

## Key Abstractions

### `utils/subjects.ts`
Single source of truth for all subject metadata. Any component needing subject info imports from here. Not a database — purely static TypeScript.

### `utils/localStorage.ts`
All localStorage access goes through `lsGet<T>()` and `lsSet<T>()`. Guards: SSR check + JSON parse error catch. No raw `localStorage` access in components.

### `utils/analytics.ts`
All analytics calls go through `logEvent()`. Never imported directly into UI — always fire-and-forget. Components import `logEvent`, not `fetch` or `supabase` directly.

### `data/schemas/*.schema.json`
JSON Schema definitions for content data. Four schemas: `drill`, `mcq`, `meta`, `study-guide`. Actual content JSON files will live under `data/[subject]/`.

## Performance Notes

- No `loading.tsx` files yet (streaming not implemented)
- `force-dynamic` on subject page disables ISR for that route
- KaTeX and Chart.js are heavy — not yet evaluated for bundle impact
- No `next/image` usage yet (no images in Phase 1)

---
*Architecture analysis: 2026-03-23*
