# Structure

**Analysis Date:** 2026-03-23

## Directory Tree

```
C:/Ascendly/
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    ← Root layout (Header + main wrapper)
│   ├── page.tsx                      ← Homepage (subject grid)
│   ├── globals.css                   ← Theme tokens + Tailwind base (imported by layout)
│   ├── favicon.ico
│   ├── not-found.tsx                 ← Custom 404
│   ├── [subject]/
│   │   ├── page.tsx                  ← Subject hub (mode cards, unit progress, analytics)
│   │   ├── drills/page.tsx           ← Stub: "Coming in Phase 2"
│   │   ├── practice/page.tsx         ← Stub
│   │   ├── study-guide/page.tsx      ← Stub
│   │   └── practice-test/page.tsx    ← Stub
│   └── api/
│       └── log-event/route.ts        ← Analytics POST handler → Supabase
│
├── components/
│   ├── layout/
│   │   └── Header.tsx                ← Fixed top nav with logo + streak badge
│   ├── ui/
│   │   ├── SubjectCard.tsx           ← Homepage subject card (link to hub)
│   │   ├── ModeCard.tsx              ← Subject hub mode card (Drills/MCQ/Study/Test)
│   │   ├── MasteryBar.tsx            ← Progress bar component (0–100)
│   │   ├── UnitProgressGrid.tsx      ← Client island: unit mastery list
│   │   ├── ProjectedScoreBadge.tsx   ← Client island: projected AP score (1–5)
│   │   ├── StreakStrip.tsx           ← Client island: streak display on homepage
│   │   └── SubjectAnalytics.tsx      ← Client island: fires page_view on mount
│   ├── KatexRenderer.tsx             ← Renders KaTeX math strings
│   ├── ChartRenderer.tsx             ← Renders Chart.js graphs
│   └── TableRenderer.tsx             ← Renders HTML tables for stimulus content
│
├── data/
│   └── schemas/                      ← JSON Schema definitions (no content yet)
│       ├── drill.schema.json
│       ├── mcq.schema.json
│       ├── meta.schema.json
│       └── study-guide.schema.json
│
├── utils/
│   ├── subjects.ts                   ← In-memory subject registry (slugs, units, exam dates)
│   ├── localStorage.ts               ← lsGet/lsSet/lsClear + LS_KEYS map
│   ├── analytics.ts                  ← logEvent() fire-and-forget wrapper
│   ├── scoring.ts                    ← projectScore(accuracy) → 1|2|3|4|5
│   ├── scramble.ts                   ← Fisher-Yates shuffle (render-time only)
│   ├── fuzzyMatch.ts                 ← Fuzzy answer matching for drill free-response
│   ├── streak.ts                     ← Streak calculation helpers
│   └── __tests__/
│       ├── scramble.test.ts
│       ├── scoring.test.ts
│       ├── fuzzyMatch.test.ts
│       └── subjects.test.ts
│
├── lib/
│   └── supabase.ts                   ← Supabase client (client-side, NEXT_PUBLIC_ keys)
│
├── docs/
│   ├── PRD.md                        ← Full product requirements document
│   └── superpowers/specs/
│       └── 2026-03-23-phase2-drill-interface-design.md ← Phase 2 drill UI spec
│
├── design-system/
│   └── ascendly/
│       ├── MASTER.md                 ← Canonical design system reference
│       └── pages/                    ← Per-page design overrides (empty)
│
├── scripts/                          ← (exists, contents unknown)
├── .planning/                        ← GSD planning structure (being created now)
│   └── codebase/                     ← This codebase map
│
├── CLAUDE.md                         ← AI agent instructions + phase tracker
├── tsconfig.json
├── next.config.ts
├── package.json
├── package-lock.json
└── .env.local                        ← Supabase credentials (not committed)
```

## Component Inventory

### Shared Renderers (used across all future phases)
| Component | Purpose |
|-----------|---------|
| `KatexRenderer.tsx` | Render KaTeX math expressions |
| `ChartRenderer.tsx` | Render Chart.js graphs (stimulus content) |
| `TableRenderer.tsx` | Render HTML tables (stimulus content) |

### Layout
| Component | Purpose |
|-----------|---------|
| `layout/Header.tsx` | Fixed top nav (56px height) |

### UI Components
| Component | Server/Client | Purpose |
|-----------|--------------|---------|
| `SubjectCard.tsx` | Server | Homepage card linking to subject hub |
| `ModeCard.tsx` | Server | Subject hub mode navigation card |
| `MasteryBar.tsx` | Server | Progress bar (stateless, value prop) |
| `UnitProgressGrid.tsx` | Client | Reads mastery from localStorage, renders unit bars |
| `ProjectedScoreBadge.tsx` | Client | Reads score from localStorage, shows 1–5 badge |
| `StreakStrip.tsx` | Client | Reads streak from localStorage |
| `SubjectAnalytics.tsx` | Client | Fires `page_view` event on mount, renders null |

## Data Schemas

### `drill.schema.json`
Fields: `id`, `unit`, `subject`, `mode` (enum: 6 types), `prompt`, `answer`, `alternate_answers?`, `difficulty` (easy/medium/hard), `katex_required?`

### `mcq.schema.json`
Not yet read — MCQ schema for Phase 3 practice questions.

### `meta.schema.json`
Not yet read — subject/unit metadata schema.

### `study-guide.schema.json`
Not yet read — study guide content schema.

## Key Files Quick Reference

| File | Why You'd Open It |
|------|------------------|
| `utils/subjects.ts` | Add a new subject or unit, or check slugs |
| `utils/localStorage.ts` | Add new localStorage keys or read patterns |
| `app/globals.css` | Modify design tokens, add CSS classes |
| `CLAUDE.md` | Project rules, critical constraints, phase tracker |
| `design-system/ascendly/MASTER.md` | UI spec before building any component |
| `data/schemas/drill.schema.json` | Validate or extend drill JSON structure |

---
*Structure analysis: 2026-03-23*
