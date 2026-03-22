# Phase 1 — Core Shell & Navigation Design Spec

**Date:** 2026-03-22
**Status:** Approved (v2 — post spec-review)
**Phase:** 1 of 14

---

## Scope

Build the navigational skeleton of Ascendly: a shared fixed header, the homepage (subject picker), and the subject hub page. No content data is required — subject cards and unit grids use static data from `utils/subjects.ts`. Stub pages at the correct route paths are created; incorrect stubs from Phase 0 are deleted.

---

## 1. Route Structure (Authoritative)

The PRD defines these routes. The Phase 0 stubs under `/[subject]/[unit]/` are WRONG and must be deleted.

| Route | File | Phase Built |
|-------|------|-------------|
| `/` | `app/page.tsx` | Phase 1 (this phase) |
| `/[subject]` | `app/[subject]/page.tsx` | Phase 1 (this phase) |
| `/[subject]/drills` | `app/[subject]/drills/page.tsx` | Phase 2 (stub in Phase 1) |
| `/[subject]/practice` | `app/[subject]/practice/page.tsx` | Phase 3 (stub in Phase 1) |
| `/[subject]/study-guide` | `app/[subject]/study-guide/page.tsx` | Phase 4 (stub in Phase 1) |
| `/[subject]/practice-test` | `app/[subject]/practice-test/page.tsx` | Phase 5 (stub in Phase 1) |

**Coder action required:** Delete the following Phase 0 stubs:
- `app/[subject]/[unit]/drills/page.tsx`
- `app/[subject]/[unit]/practice-questions/page.tsx`
- `app/[subject]/[unit]/study-guide/page.tsx`
- `app/[subject]/practice-test/page.tsx` → KEEP this one (already at correct path)

Create new stubs at the correct paths for drills, practice, study-guide (these don't exist yet at the correct level).

---

## 2. SSR / Client Boundary Rules

Next.js App Router renders pages as Server Components by default. `localStorage` is browser-only. All localStorage reads must be wrapped in a `useEffect` + `useState` pattern inside a `'use client'` component.

**Rules:**
- `app/page.tsx` and `app/[subject]/page.tsx` are Server Components (no `'use client'`)
- The streak/stats strip on the homepage is a separate `'use client'` component: `components/ui/StreakStrip.tsx`
- The projected score badge on the subject hub is a separate `'use client'` component: `components/ui/ProjectedScoreBadge.tsx`
- The unit mastery bars on the subject hub are a separate `'use client'` component: `components/ui/UnitProgressGrid.tsx`
- Each localStorage-reading component initializes state as `null`, reads in `useEffect`, renders `null` on first paint, then shows content after mount (prevents hydration mismatch and SSR errors)
- The Supabase `page_view` event in the subject hub is fired inside a `useEffect` in `ProjectedScoreBadge` or a dedicated `SubjectHubAnalytics` client component — never in the render path

**Pattern to follow:**
```tsx
'use client'
import { useEffect, useState } from 'react'

export function StreakStrip() {
  const [streak, setStreak] = useState<number | null>(null)
  const [totalQ, setTotalQ] = useState<number | null>(null)

  useEffect(() => {
    const s = localStorage.getItem('ascendly_streak')
    if (s) setStreak(JSON.parse(s).count ?? 0)
    setTotalQ(Number(localStorage.getItem('ascendly_total_questions') ?? 0))
  }, [])

  if (streak === null) return null // prevents hydration mismatch
  if (streak === 0 && (!totalQ || totalQ === 0)) return null
  // render strip
}
```

---

## 3. Shared Header (`components/layout/Header.tsx`)

- `'use client'` not needed — purely presentational, no browser APIs
- Fixed at top of every page; height 56px
- Background: `var(--bg-secondary)`, bottom border: `1px solid var(--bg-border)`
- Left: "Ascendly" wordmark, `var(--accent)` color, `font-weight: 700`, links to `/` via `<Link>`
- Right: empty — no nav items at launch
- Rendered in `app/layout.tsx` — wraps `{children}` with `<Header />` above and a `<main>` with `padding-top: 56px`
- `app/layout.tsx` remains a Server Component; `<Header />` is also a Server Component

**Coder must update `app/layout.tsx`** to the following structure:
```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Ascendly — Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides. No signup required.',
  openGraph: {
    title: 'Ascendly — Free AP Exam Prep',
    description: 'Free AP practice questions, drills, and study guides for AP Psychology, AP World History, AP Calculus, AP Chemistry, and more. No signup required.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100dvh' }}>
        <Header />
        <main style={{ paddingTop: '56px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
```

---

## 4. Homepage (`app/page.tsx`)

**This file must be a complete rewrite** — the current file contains placeholder text ("Free AP Exam Prep — coming soon") which violates Critical Rule #3. The Coder replaces it entirely.

### Hero (compact — max ~64px vertical space)
- Padding: `padding-top: 48px; padding-bottom: 16px`
- H1: **"Ace your AP exams. Free."** — `font-size: 1.875rem`, `font-weight: 700`
- One line below: "No signup. No paywall. Just practice." — `var(--text-secondary)`, `font-size: 0.875rem`
- No button, no illustration, no badge

### Subject Grid (primary content — immediately below hero)
- Gap between hero and grid: `24px`
- Grid: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px`
- At 768px+: `grid-template-columns: repeat(3, 1fr)`
- 7 `<SubjectCard />` components (one per subject)
- Container: `max-w-3xl`, centered, horizontal padding `16px` on mobile / `24px` on desktop

### `<SubjectCard />` (`components/ui/SubjectCard.tsx`)
- Props: `{ name: string; slug: string }`
- Wraps in `<Link href={/\`/${slug}\`}>`
- Card style: `var(--bg-card)`, `1px solid var(--bg-border)`, `var(--radius-lg)`, `padding: 20px`
- Subject name: H3, `var(--text-primary)`
- "Start Practicing →" label: `var(--accent)`, `font-size: 0.875rem`, `font-weight: 500`
- Hover: `var(--bg-card-hover)` bg + `var(--accent)` border, 150ms ease
- `cursor-pointer`, focus ring: `box-shadow: 0 0 0 3px rgba(99,102,241,0.3)`
- `prefers-reduced-motion`: skip transition

### `<StreakStrip />` (`components/ui/StreakStrip.tsx`)
- `'use client'` — see Section 2 for pattern
- Placed **below** the subject grid with `margin-top: 32px`
- Shows: flame icon (`Flame` from Lucide) + streak count if > 0, and/or total questions answered if > 0
- Text: `var(--text-secondary)`, `font-size: 0.875rem`
- Renders `null` on server and on first client paint

### Page metadata (Server Component static export)
```ts
export const metadata: Metadata = {
  title: 'Ascendly — Free AP Exam Prep. No Signup.',
  description: 'Free AP practice questions, drills, and study guides for 7 AP subjects. No signup required.',
}
```

---

## 5. Subject Hub (`app/[subject]/page.tsx`)

This is a **Server Component** page. It receives `params.subject` and validates it against the subjects map. Client islands (streak, mastery bars, analytics) are imported as `'use client'` components.

### Slug validation
```ts
import { notFound } from 'next/navigation'
import { getSubject } from '@/utils/subjects'

export default function SubjectPage({ params }: { params: { subject: string } }) {
  const subject = getSubject(params.subject)
  if (!subject) notFound()
  // render...
}
```

### `app/not-found.tsx`
A themed 404 page must be created in this phase. It uses `var(--bg-primary)`, `var(--text-primary)`, shows "404 — Page not found", and links back to `/`. This ensures invalid subject slugs show the Ascendly-styled 404, not the default Next.js one.

### Header section
- H1: subject display name (`font-size: 1.875rem`, `font-weight: 700`)
- Subline: "AP Exam: [Date] · [N] days to go" — `var(--text-secondary)`, `font-size: 0.875rem`
  - Exam date computed from `subjects.ts` exam date field + `Date.now()` diff
- `<ProjectedScoreBadge subject={slug} />` — `'use client'`, renders `null` if no localStorage data

### Mode Cards (2×2 grid)
- Grid: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px`
- 4 `<ModeCard />` components

**`<ModeCard />` (`components/ui/ModeCard.tsx`):**
- Props: `{ title: string; description: string; icon: LucideIcon; href: string }`
- Card style: `var(--bg-card)`, `1px solid var(--bg-border)`, `var(--radius-lg)`, `padding: 24px`
- Icon: Lucide icon component, `var(--accent)` color, size 24
- Title: H3, `var(--text-primary)`
- Description: `var(--text-secondary)`, `font-size: 0.875rem`
- Hover: `var(--bg-card-hover)` + `var(--accent)` border, 150ms ease
- `cursor-pointer`, focus ring

| Card | Icon | Description | href |
|------|------|-------------|------|
| Drills | `BookOpen` | Flashcards and term recall | `/[subject]/drills` |
| Practice Questions | `ClipboardList` | MCQs with stimulus | `/[subject]/practice` |
| Study Guide | `BookMarked` | Concepts, terms, formulas | `/[subject]/study-guide` |
| Practice Test | `Trophy` | Full-length timed test | `/[subject]/practice-test` |

### `<UnitProgressGrid />` (`components/ui/UnitProgressGrid.tsx`)
- `'use client'` — reads localStorage
- Props: `{ subject: string; units: { name: string; number: number }[] }`
- Section heading: "Unit Progress", H2
- One row per unit: unit name + `<MasteryBar />`
- Reads `ascendly_mastery_[subject]_[unit]` from localStorage for fill %
- Renders bars at 0% on server and first paint; populates after mount

### `<MasteryBar />` (`components/ui/MasteryBar.tsx`)
- Props: `{ value: number }` (0–100)
- Track: `var(--mastery-empty)`, height 6px, `border-radius: 999px`
- Fill: `var(--mastery-fill)`, width `${value}%`, `transition: width 400ms ease`
- ARIA: `role="progressbar"`, `aria-valuenow={value}`, `aria-valuemin={0}`, `aria-valuemax={100}`
- `prefers-reduced-motion`: skip transition

### Supabase analytics
- `<SubjectAnalytics subject={slug} />` — tiny `'use client'` component, renders `null`
- Fires `logEvent({ event_type: 'page_view', subject: slug })` inside `useEffect`
- Import: `import { logEvent } from '@/utils/analytics'`
- Call pattern: `void logEvent(...)` — `logEvent` returns `void` (not `Promise<void>`); the utility already silences errors internally. Do NOT call `.catch()` on it.

### Dynamic metadata (generateMetadata)
```ts
export async function generateMetadata({ params }: { params: { subject: string } }): Promise<Metadata> {
  const subject = getSubject(params.subject)
  if (!subject) return {}
  return {
    title: `${subject.name} Prep — Free Practice | Ascendly`,
    description: `Free AP ${subject.name} practice questions, drills, and study guides. No signup.`,
  }
}
```

---

## 6. `utils/subjects.ts` — TypeScript Interface

```ts
export interface SubjectUnit {
  number: number   // e.g. 1
  name: string     // e.g. "Biological Bases of Behavior"
}

export interface Subject {
  slug: string          // e.g. "ap-psychology"
  name: string          // e.g. "AP Psychology"
  examDate: string      // ISO date string: "2026-05-08"
  units: SubjectUnit[]
}

// Exported functions
export function getSubject(slug: string): Subject | undefined
export function getAllSubjects(): Subject[]
```

Exam dates (2026 AP exam schedule — hardcoded):
| Subject | Exam Date |
|---------|-----------|
| AP Psychology | 2026-05-04 |
| AP World History | 2026-05-14 |
| AP Government | 2026-05-05 |
| AP Calculus AB | 2026-05-12 |
| AP Precalculus | 2026-05-07 |
| AP Computer Science Principles | 2026-05-06 |
| AP Chemistry | 2026-05-11 |

Unit names for each subject must be included (authoritative College Board unit list). Coder should look up the official unit names per subject. Unit count reference: Psychology (8), World History (9), Government (5), Calculus AB (8), Precalculus (4), CSP (5), Chemistry (9).

---

## 7. Stub Pages for Phase 2–5 Routes

Create minimal stubs at the correct paths. Each stub:
- Shows subject name + mode name as H1
- Shows "Coming soon" text (this is internal scaffolding, NOT shown in screenshot loop verification; these pages are not user-facing until their phase)
- No `'use client'` needed

Files to create:
- `app/[subject]/drills/page.tsx`
- `app/[subject]/practice/page.tsx`
- `app/[subject]/study-guide/page.tsx`

(`app/[subject]/practice-test/page.tsx` already exists at the correct path — keep it.)

---

## 8. Components Summary

| File | Type | Description |
|------|------|-------------|
| `components/layout/Header.tsx` | Server | Fixed top nav with Ascendly wordmark |
| `components/ui/SubjectCard.tsx` | Server | Homepage subject grid card |
| `components/ui/ModeCard.tsx` | Server | Subject hub mode card |
| `components/ui/MasteryBar.tsx` | Server | Progress bar (value passed as prop) |
| `components/ui/StreakStrip.tsx` | Client | Reads localStorage streak/total-q |
| `components/ui/UnitProgressGrid.tsx` | Client | Reads localStorage mastery per unit |
| `components/ui/ProjectedScoreBadge.tsx` | Client | Reads localStorage projected score |
| `components/ui/SubjectAnalytics.tsx` | Client | Fires Supabase page_view on mount |
| `app/not-found.tsx` | Server | Themed 404 page |

---

## 9. Design System Compliance Checklist

- [ ] All colors use `var(--*)` tokens — no hardcoded hex
- [ ] Lucide React SVG icons only — no emojis
- [ ] `cursor-pointer` on all interactive elements
- [ ] Hover transitions: 150ms ease
- [ ] Focus rings: `box-shadow: 0 0 0 3px rgba(99,102,241,0.3)`
- [ ] Responsive: 375px (primary), 768px, 1024px
- [ ] `min-h-dvh` on root layout
- [ ] `prefers-reduced-motion` respected on all transitions
- [ ] No content hidden behind 56px fixed header
- [ ] No horizontal scroll on mobile
- [ ] `MasteryBar` has ARIA progressbar attributes
- [ ] Supabase calls: fire-and-forget, never in render path

---

## 10. Out of Scope for Phase 1

- Real content JSON (Phase 6–12)
- Drill, MCQ, study guide, practice test UI (Phases 2–5)
- Score calculation logic (Phases 2–5)
- Search or filtering
- robots.txt / sitemap.xml (Phase 14)
