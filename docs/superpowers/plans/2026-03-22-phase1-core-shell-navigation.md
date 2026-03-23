# Phase 1 — Core Shell & Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared header, homepage (subject picker), and subject hub page, establishing the full navigational skeleton of Ascendly.

**Architecture:** Server Component pages with small `'use client'` islands for localStorage reads. `utils/subjects.ts` is the single source of truth for all subject metadata. All styling via CSS custom properties from `globals.css` — no hardcoded hex, no Tailwind utility classes for colors.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Lucide React icons, Jest (node env) for utility tests.

**Spec:** `docs/superpowers/specs/2026-03-22-phase1-core-shell-navigation-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `utils/subjects.ts` | Subject metadata — slugs, names, exam dates, units |
| Create | `utils/__tests__/subjects.test.ts` | Unit tests for subjects utility |
| Create | `components/layout/Header.tsx` | Fixed 56px top nav, Ascendly wordmark |
| Modify | `app/layout.tsx` | Add `<Header />`, `padding-top: 56px`, `min-height: 100dvh` |
| Create | `app/not-found.tsx` | Themed 404 page |
| Create | `components/ui/SubjectCard.tsx` | Homepage subject grid card |
| Create | `components/ui/StreakStrip.tsx` | `'use client'` — reads streak + total-q from localStorage |
| Rewrite | `app/page.tsx` | Homepage: compact hero + subject grid + StreakStrip |
| Create | `components/ui/ModeCard.tsx` | Subject hub mode card (Drills, Practice, etc.) |
| Create | `components/ui/MasteryBar.tsx` | ARIA progressbar, 0–100 fill |
| Create | `components/ui/UnitProgressGrid.tsx` | `'use client'` — reads mastery from localStorage |
| Create | `components/ui/ProjectedScoreBadge.tsx` | `'use client'` — reads projected score from localStorage |
| Create | `components/ui/SubjectAnalytics.tsx` | `'use client'` — fires Supabase page_view on mount |
| Rewrite | `app/[subject]/page.tsx` | Subject hub page |
| Delete | `app/[subject]/[unit]/drills/page.tsx` | Wrong Phase 0 stub |
| Delete | `app/[subject]/[unit]/practice-questions/page.tsx` | Wrong Phase 0 stub |
| Delete | `app/[subject]/[unit]/study-guide/page.tsx` | Wrong Phase 0 stub |
| Create | `app/[subject]/drills/page.tsx` | Correct path stub |
| Create | `app/[subject]/practice/page.tsx` | Correct path stub |
| Create | `app/[subject]/study-guide/page.tsx` | Correct path stub |

---

## Task 1: Install Dependencies + Add Test Script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install lucide-react**

```bash
cd C:/Ascendly && npm install lucide-react
```

Expected: lucide-react appears in `dependencies` in package.json.

- [ ] **Step 2: Add test script to package.json**

Open `package.json` and add `"test": "jest"` to the scripts block:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "jest"
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install lucide-react, add test script"
```

---

## Task 2: subjects.ts Utility (TDD)

**Files:**
- Create: `utils/subjects.ts`
- Create: `utils/__tests__/subjects.test.ts`

- [ ] **Step 1: Create test file first**

Create `utils/__tests__/subjects.test.ts` (matches the existing project test convention; create the `__tests__` directory if it doesn't exist):

```ts
import { getSubject, getAllSubjects } from '@/utils/subjects'

describe('getSubject', () => {
  it('spot-checks all 7 exam dates are in May 2026', () => {
    getAllSubjects().forEach(s => {
      expect(s.examDate).toMatch(/^2026-05-/)
    })
  })
  it('returns the subject for a valid slug', () => {
    const s = getSubject('ap-psychology')
    expect(s).toBeDefined()
    expect(s!.name).toBe('AP Psychology')
    expect(s!.slug).toBe('ap-psychology')
  })

  it('returns undefined for an invalid slug', () => {
    expect(getSubject('ap-physics')).toBeUndefined()
    expect(getSubject('')).toBeUndefined()
    expect(getSubject('AP-PSYCHOLOGY')).toBeUndefined() // case-sensitive
  })

  it('includes an ISO examDate string', () => {
    const s = getSubject('ap-chemistry')
    expect(s!.examDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('includes a non-empty units array', () => {
    const s = getSubject('ap-calculus-ab')
    expect(Array.isArray(s!.units)).toBe(true)
    expect(s!.units.length).toBeGreaterThan(0)
    expect(s!.units[0]).toHaveProperty('number')
    expect(s!.units[0]).toHaveProperty('name')
  })
})

describe('getAllSubjects', () => {
  it('returns exactly 7 subjects', () => {
    expect(getAllSubjects()).toHaveLength(7)
  })

  it('every subject has required fields', () => {
    getAllSubjects().forEach(s => {
      expect(s.slug).toBeTruthy()
      expect(s.name).toBeTruthy()
      expect(s.examDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(s.units.length).toBeGreaterThan(0)
    })
  })

  it('unit counts match College Board curricula', () => {
    const counts: Record<string, number> = {
      'ap-psychology': 8,
      'ap-world-history': 9,
      'ap-government': 5,
      'ap-calculus-ab': 8,
      'ap-precalculus': 4,
      'ap-csp': 5,
      'ap-chemistry': 9,
    }
    getAllSubjects().forEach(s => {
      expect(s.units).toHaveLength(counts[s.slug])
    })
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd C:/Ascendly && npm test -- utils/__tests__/subjects.test.ts
```

Expected: FAIL — "Cannot find module '@/utils/subjects'"

- [ ] **Step 3: Create `utils/subjects.ts`**

```ts
export interface SubjectUnit {
  number: number
  name: string
}

export interface Subject {
  slug: string
  name: string
  examDate: string  // ISO date: "YYYY-MM-DD"
  units: SubjectUnit[]
}

const SUBJECTS: Subject[] = [
  {
    slug: 'ap-psychology',
    name: 'AP Psychology',
    examDate: '2026-05-04',
    units: [
      { number: 1, name: 'Biological Bases of Behavior' },
      { number: 2, name: 'Sensation and Perception' },
      { number: 3, name: 'Learning' },
      { number: 4, name: 'Cognitive Psychology' },
      { number: 5, name: 'Developmental Psychology' },
      { number: 6, name: 'Motivation, Emotion, and Personality' },
      { number: 7, name: 'Clinical Psychology' },
      { number: 8, name: 'Social Psychology' },
    ],
  },
  {
    slug: 'ap-world-history',
    name: 'AP World History',
    examDate: '2026-05-14',
    units: [
      { number: 1, name: 'The Global Tapestry' },
      { number: 2, name: 'Networks of Exchange' },
      { number: 3, name: 'Land-Based Empires' },
      { number: 4, name: 'Transoceanic Interconnections' },
      { number: 5, name: 'Revolutions' },
      { number: 6, name: 'Consequences of Industrialization' },
      { number: 7, name: 'Global Conflict' },
      { number: 8, name: 'Cold War and Decolonization' },
      { number: 9, name: 'Globalization' },
    ],
  },
  {
    slug: 'ap-government',
    name: 'AP Government',
    examDate: '2026-05-05',
    units: [
      { number: 1, name: 'Foundations of American Democracy' },
      { number: 2, name: 'Interactions Among Branches of Government' },
      { number: 3, name: 'Civil Liberties and Civil Rights' },
      { number: 4, name: 'American Political Ideologies and Beliefs' },
      { number: 5, name: 'Political Participation' },
    ],
  },
  {
    slug: 'ap-calculus-ab',
    name: 'AP Calculus AB',
    examDate: '2026-05-12',
    units: [
      { number: 1, name: 'Limits and Continuity' },
      { number: 2, name: 'Differentiation: Definition and Fundamental Properties' },
      { number: 3, name: 'Differentiation: Composite, Implicit, and Inverse Functions' },
      { number: 4, name: 'Contextual Applications of Differentiation' },
      { number: 5, name: 'Analytical Applications of Differentiation' },
      { number: 6, name: 'Integration and Accumulation of Change' },
      { number: 7, name: 'Differential Equations' },
      { number: 8, name: 'Applications of Integration' },
    ],
  },
  {
    slug: 'ap-precalculus',
    name: 'AP Precalculus',
    examDate: '2026-05-07',
    units: [
      { number: 1, name: 'Polynomial and Rational Functions' },
      { number: 2, name: 'Exponential and Logarithmic Functions' },
      { number: 3, name: 'Trigonometric and Polar Functions' },
      { number: 4, name: 'Functions Involving Parameters, Vectors, and Matrices' },
    ],
  },
  {
    slug: 'ap-csp',
    name: 'AP Computer Science Principles',
    examDate: '2026-05-06',
    units: [
      { number: 1, name: 'Creative Development' },
      { number: 2, name: 'Data' },
      { number: 3, name: 'Algorithms and Programming' },
      { number: 4, name: 'Computer Systems and Networks' },
      { number: 5, name: 'Impact of Computing' },
    ],
  },
  {
    slug: 'ap-chemistry',
    name: 'AP Chemistry',
    examDate: '2026-05-11',
    units: [
      { number: 1, name: 'Atomic Structure and Properties' },
      { number: 2, name: 'Molecular and Ionic Compound Structure and Properties' },
      { number: 3, name: 'Intermolecular Forces and Properties' },
      { number: 4, name: 'Chemical Reactions' },
      { number: 5, name: 'Kinetics' },
      { number: 6, name: 'Thermodynamics' },
      { number: 7, name: 'Equilibrium' },
      { number: 8, name: 'Acids and Bases' },
      { number: 9, name: 'Applications of Thermodynamics' },
    ],
  },
]

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find(s => s.slug === slug)
}

export function getAllSubjects(): Subject[] {
  return SUBJECTS
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
cd C:/Ascendly && npm test -- utils/__tests__/subjects.test.ts
```

Expected: All tests PASS (8 tests in 2 suites).

- [ ] **Step 5: Commit**

```bash
git add utils/subjects.ts utils/__tests__/subjects.test.ts
git commit -m "feat: add subjects utility with full College Board unit data"
```

---

## Task 3: Header + Layout

**Files:**
- Create: `components/layout/Header.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `components/layout/Header.tsx`**

```tsx
import Link from 'next/link'

export function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--bg-border)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '24px',
      paddingRight: '24px',
      zIndex: 50,
    }}>
      <Link
        href="/"
        style={{
          color: 'var(--accent)',
          fontWeight: 700,
          fontSize: '1.125rem',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        Ascendly
      </Link>
    </header>
  )
}
```

- [ ] **Step 2: Update `app/layout.tsx`**

Replace the entire file with:

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

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd C:/Ascendly && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Header.tsx app/layout.tsx
git commit -m "feat: add fixed Header and update root layout"
```

---

## Task 4: Themed 404 Page

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1: Create `app/not-found.tsx`**

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100dvh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '24px',
    }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        404 — Page not found
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          color: 'var(--accent)',
          fontSize: '0.875rem',
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        ← Back to home
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat: add themed 404 page"
```

---

## Task 5: SubjectCard + StreakStrip Components

**Files:**
- Create: `components/ui/SubjectCard.tsx`
- Create: `components/ui/StreakStrip.tsx`

- [ ] **Step 1: Create `components/ui/SubjectCard.tsx`**

Use CSS `:hover` via a class name — **do NOT use `onMouseEnter`/`onMouseLeave`** (event handlers cause a Next.js build error in Server Components).

```tsx
import Link from 'next/link'

interface SubjectCardProps {
  name: string
  slug: string
}

export function SubjectCard({ name, slug }: SubjectCardProps) {
  return (
    <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
      <div className="subject-card" style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, border-color 150ms ease',
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}>
          {name}
        </h3>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--accent)',
        }}>
          Start Practicing →
        </span>
      </div>
    </Link>
  )
}
```

Append to existing `app/globals.css` (do NOT replace the file — append only):

```css
/* ─── SubjectCard hover ───────────────────────────────────── */
.subject-card:hover {
  background-color: var(--bg-card-hover);
  border-color: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .subject-card { transition: none; }
}
```

- [ ] **Step 2: Create `components/ui/StreakStrip.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

export function StreakStrip() {
  const [streak, setStreak] = useState<number | null>(null)
  const [totalQ, setTotalQ] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ascendly_streak')
      if (raw) setStreak(JSON.parse(raw).count ?? 0)
      else setStreak(0)
      setTotalQ(Number(localStorage.getItem('ascendly_total_questions') ?? 0))
    } catch {
      setStreak(0)
      setTotalQ(0)
    }
  }, [])

  if (streak === null) return null
  if (streak === 0 && (!totalQ || totalQ === 0)) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      color: 'var(--text-secondary)',
      fontSize: '0.875rem',
    }}>
      {streak > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Flame size={14} color="var(--accent-warning)" />
          {streak} day streak
        </span>
      )}
      {totalQ != null && totalQ > 0 && (
        <span>{totalQ.toLocaleString()} questions answered</span>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/SubjectCard.tsx components/ui/StreakStrip.tsx app/globals.css
git commit -m "feat: add SubjectCard and StreakStrip components"
```

---

## Task 6: Homepage Rewrite

**Files:**
- Rewrite: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` entirely**

```tsx
import type { Metadata } from 'next'
import { getAllSubjects } from '@/utils/subjects'
import { SubjectCard } from '@/components/ui/SubjectCard'
import { StreakStrip } from '@/components/ui/StreakStrip'

export const metadata: Metadata = {
  title: 'Ascendly — Free AP Exam Prep. No Signup.',
  description: 'Free AP practice questions, drills, and study guides for 7 AP subjects. No signup required.',
}

export default function HomePage() {
  const subjects = getAllSubjects()

  return (
    <div style={{
      maxWidth: '48rem',
      margin: '0 auto',
      paddingLeft: '16px',
      paddingRight: '16px',
    }}>
      {/* Hero — compact */}
      <div style={{ paddingTop: '48px', paddingBottom: '16px' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: '8px',
        }}>
          Ace your AP exams. Free.
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          No signup. No paywall. Just practice.
        </p>
      </div>

      {/* Subject Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginTop: '24px',
      }}
        className="subject-grid"
      >
        {subjects.map(subject => (
          <SubjectCard key={subject.slug} name={subject.name} slug={subject.slug} />
        ))}
      </div>

      {/* Streak strip — client-only, renders after mount */}
      <div style={{ marginTop: '32px', paddingBottom: '48px' }}>
        <StreakStrip />
      </div>
    </div>
  )
}
```

Append to existing `app/globals.css` (do NOT replace the file — append only):

```css
/* ─── Homepage subject grid responsive ───────────────────── */
@media (min-width: 768px) {
  .subject-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd C:/Ascendly && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: rewrite homepage with subject grid and streak strip"
```

---

## Task 7: ModeCard + MasteryBar Components

**Files:**
- Create: `components/ui/ModeCard.tsx`
- Create: `components/ui/MasteryBar.tsx`

- [ ] **Step 1: Create `components/ui/ModeCard.tsx`**

```tsx
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface ModeCardProps {
  title: string
  description: string
  Icon: LucideIcon
  href: string
}

export function ModeCard({ title, description, Icon, href }: ModeCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="mode-card" style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, border-color 150ms ease',
        height: '100%',
      }}>
        <Icon
          size={24}
          color="var(--accent)"
          style={{ marginBottom: '12px' }}
        />
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>
    </Link>
  )
}
```

Append to existing `app/globals.css` (do NOT replace the file — append only):

```css
/* ─── ModeCard hover ──────────────────────────────────────── */
.mode-card:hover {
  background-color: var(--bg-card-hover);
  border-color: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .mode-card { transition: none; }
}
```

- [ ] **Step 2: Create `components/ui/MasteryBar.tsx`**

```tsx
interface MasteryBarProps {
  value: number  // 0–100
}

export function MasteryBar({ value }: MasteryBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        backgroundColor: 'var(--mastery-empty)',
        borderRadius: '999px',
        height: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        className="mastery-fill"
        style={{
          backgroundColor: 'var(--mastery-fill)',
          borderRadius: '999px',
          height: '100%',
          width: `${clampedValue}%`,
          transition: 'width 400ms ease',
        }}
      />
    </div>
  )
}
```

Append to existing `app/globals.css` (do NOT replace the file — append only):

```css
/* ─── MasteryBar motion reduction ────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .mastery-fill { transition: none; }
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/ModeCard.tsx components/ui/MasteryBar.tsx app/globals.css
git commit -m "feat: add ModeCard and MasteryBar components"
```

---

## Task 8: Subject Hub Client Islands

**Files:**
- Create: `components/ui/UnitProgressGrid.tsx`
- Create: `components/ui/ProjectedScoreBadge.tsx`
- Create: `components/ui/SubjectAnalytics.tsx`

- [ ] **Step 1: Create `components/ui/UnitProgressGrid.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { MasteryBar } from './MasteryBar'
import type { SubjectUnit } from '@/utils/subjects'

interface UnitProgressGridProps {
  subject: string
  units: SubjectUnit[]
}

interface MasteryData {
  drillAccuracy: number
  mcqAccuracy: number
  totalAttempts: number
}

export function UnitProgressGrid({ subject, units }: UnitProgressGridProps) {
  const [masteryMap, setMasteryMap] = useState<Record<number, number> | null>(null)

  useEffect(() => {
    const map: Record<number, number> = {}
    units.forEach(unit => {
      try {
        const raw = localStorage.getItem(`ascendly_mastery_${subject}_${unit.number}`)
        if (raw) {
          const data: MasteryData = JSON.parse(raw)
          // Average drill and MCQ accuracy as overall mastery %
          const accuracy = data.totalAttempts > 0
            ? ((data.drillAccuracy + data.mcqAccuracy) / 2) * 100
            : 0
          map[unit.number] = Math.round(accuracy)
        } else {
          map[unit.number] = 0
        }
      } catch {
        map[unit.number] = 0
      }
    })
    setMasteryMap(map)
  }, [subject, units])

  return (
    <section>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '16px',
      }}>
        Unit Progress
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {units.map(unit => (
          <div key={unit.number}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                Unit {unit.number}: {unit.name}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                minWidth: '32px',
                textAlign: 'right',
              }}>
                {masteryMap ? `${masteryMap[unit.number]}%` : '—'}
              </span>
            </div>
            <MasteryBar value={masteryMap ? masteryMap[unit.number] : 0} />
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/ui/ProjectedScoreBadge.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'

interface ProjectedScoreBadgeProps {
  subject: string
}

interface ScoreData {
  projectedScore: 1 | 2 | 3 | 4 | 5
  accuracy: number
}

export function ProjectedScoreBadge({ subject }: ProjectedScoreBadgeProps) {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`ascendly_score_${subject}`)
      if (raw) {
        const data: ScoreData = JSON.parse(raw)
        setScore(data.projectedScore)
      }
    } catch {
      // ignore
    }
  }, [subject])

  if (score === null) return null

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '4px 10px',
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
    }}>
      Projected Score:
      <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>{score}</strong>
      <span style={{ color: 'var(--text-muted)' }}>/5</span>
    </span>
  )
}
```

- [ ] **Step 3: Create `components/ui/SubjectAnalytics.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { logEvent } from '@/utils/analytics'

interface SubjectAnalyticsProps {
  subject: string
}

export function SubjectAnalytics({ subject }: SubjectAnalyticsProps) {
  useEffect(() => {
    void logEvent({ event_type: 'page_view', subject })
  }, [subject])

  return null
}
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/UnitProgressGrid.tsx components/ui/ProjectedScoreBadge.tsx components/ui/SubjectAnalytics.tsx
git commit -m "feat: add UnitProgressGrid, ProjectedScoreBadge, SubjectAnalytics client components"
```

---

## Task 9: Subject Hub Page

**Files:**
- Rewrite: `app/[subject]/page.tsx`

- [ ] **Step 1: Replace `app/[subject]/page.tsx` entirely**

Three things to note:
- Use `subject!` non-null assertion after `notFound()` — TypeScript strict mode doesn't narrow `undefined` away after `notFound()` even though it throws at runtime.
- Add `export const dynamic = 'force-dynamic'` — without this Next.js may statically render the page at build time, freezing the "days to go" countdown.
- Place `<SubjectAnalytics>` **inside** the layout container `<div>`, not as a Fragment sibling.

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookOpen, ClipboardList, BookMarked, Trophy } from 'lucide-react'
import { getSubject } from '@/utils/subjects'
import { ModeCard } from '@/components/ui/ModeCard'
import { UnitProgressGrid } from '@/components/ui/UnitProgressGrid'
import { ProjectedScoreBadge } from '@/components/ui/ProjectedScoreBadge'
import { SubjectAnalytics } from '@/components/ui/SubjectAnalytics'

// Force dynamic rendering so "days to go" is always current, never frozen at build time
export const dynamic = 'force-dynamic'

interface SubjectPageProps {
  params: { subject: string }
}

export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const subject = getSubject(params.subject)
  if (!subject) return {}
  return {
    title: `${subject.name} Prep — Free Practice | Ascendly`,
    description: `Free AP ${subject.name} practice questions, drills, and study guides. No signup.`,
  }
}

function getDaysUntilExam(examDate: string): number {
  const exam = new Date(examDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatExamDate(examDate: string): string {
  return new Date(examDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function SubjectPage({ params }: SubjectPageProps) {
  const subjectData = getSubject(params.subject)
  if (!subjectData) notFound()
  const subject = subjectData! // non-null assertion: notFound() throws above, TS needs this hint

  const daysUntil = getDaysUntilExam(subject.examDate)
  const examDateFormatted = formatExamDate(subject.examDate)

  const modes = [
    {
      title: 'Drills',
      description: 'Flashcards and term recall',
      Icon: BookOpen,
      href: `/${subject.slug}/drills`,
    },
    {
      title: 'Practice Questions',
      description: 'MCQs with stimulus',
      Icon: ClipboardList,
      href: `/${subject.slug}/practice`,
    },
    {
      title: 'Study Guide',
      description: 'Concepts, terms, formulas',
      Icon: BookMarked,
      href: `/${subject.slug}/study-guide`,
    },
    {
      title: 'Practice Test',
      description: 'Full-length timed test',
      Icon: Trophy,
      href: `/${subject.slug}/practice-test`,
    },
  ]

  return (
    <div style={{
      maxWidth: '48rem',
      margin: '0 auto',
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '40px',
      paddingBottom: '64px',
    }}>
      {/* Analytics — client island, renders null, fires page_view on mount */}
      <SubjectAnalytics subject={subject.slug} />

      {/* Subject header */}
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: '6px',
        }}>
          {subject.name}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          AP Exam: {examDateFormatted}
          {daysUntil > 0 && ` · ${daysUntil} days to go`}
          {daysUntil <= 0 && ' · Exam has passed'}
        </p>
      </div>

      {/* Projected score badge — client island */}
      <div style={{ marginTop: '12px', marginBottom: '32px' }}>
        <ProjectedScoreBadge subject={subject.slug} />
      </div>

      {/* Mode cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '48px',
      }}>
        {modes.map(mode => (
          <ModeCard
            key={mode.title}
            title={mode.title}
            description={mode.description}
            Icon={mode.Icon}
            href={mode.href}
          />
        ))}
      </div>

      {/* Unit progress — client island */}
      <UnitProgressGrid subject={subject.slug} units={subject.units} />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd C:/Ascendly && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/[subject]/page.tsx
git commit -m "feat: build subject hub page with mode cards and unit progress"
```

---

## Task 10: Route Cleanup + Correct Stubs

**Files:**
- Delete: `app/[subject]/[unit]/drills/page.tsx`
- Delete: `app/[subject]/[unit]/practice-questions/page.tsx`
- Delete: `app/[subject]/[unit]/study-guide/page.tsx`
- Create: `app/[subject]/drills/page.tsx`
- Create: `app/[subject]/practice/page.tsx`
- Create: `app/[subject]/study-guide/page.tsx`

- [ ] **Step 1: Delete wrong Phase 0 stubs**

```bash
cd C:/Ascendly
rm app/\[subject\]/\[unit\]/drills/page.tsx
rm app/\[subject\]/\[unit\]/practice-questions/page.tsx
rm app/\[subject\]/\[unit\]/study-guide/page.tsx
rmdir app/\[subject\]/\[unit\]/drills
rmdir app/\[subject\]/\[unit\]/practice-questions
rmdir app/\[subject\]/\[unit\]/study-guide
rmdir app/\[subject\]/\[unit\]
```

- [ ] **Step 2: Create `app/[subject]/drills/page.tsx`**

```tsx
export default function DrillsPage({ params }: { params: { subject: string } }) {
  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 style={{ color: 'var(--text-primary)' }}>Drills — Coming in Phase 2</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{params.subject}</p>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/[subject]/practice/page.tsx`**

```tsx
export default function PracticePage({ params }: { params: { subject: string } }) {
  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 style={{ color: 'var(--text-primary)' }}>Practice Questions — Coming in Phase 3</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{params.subject}</p>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/[subject]/study-guide/page.tsx`**

```tsx
export default function StudyGuidePage({ params }: { params: { subject: string } }) {
  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 style={{ color: 'var(--text-primary)' }}>Study Guide — Coming in Phase 4</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{params.subject}</p>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/[subject]/drills/page.tsx app/[subject]/practice/page.tsx app/[subject]/study-guide/page.tsx
git status  # verify old [unit] files are deleted
git add -u  # stage deletions
git commit -m "fix: delete wrong [unit] route stubs, create stubs at correct paths"
```

---

## Task 11: Build Verification + Screenshot Loop

- [ ] **Step 1: Run full test suite**

```bash
cd C:/Ascendly && npm test
```

Expected: All subjects.ts tests PASS.

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Ascendly && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Production build**

```bash
cd C:/Ascendly && npm run build
```

Expected: Build succeeds with no errors. Verify these routes appear in build output:
- `/` (homepage)
- `/[subject]` (dynamic)
- `/[subject]/drills`, `/[subject]/practice`, `/[subject]/study-guide`, `/[subject]/practice-test`

- [ ] **Step 4: Start dev server**

```bash
cd C:/Ascendly && npm run dev
```

Expected: Server starts on `http://localhost:3000`.

- [ ] **Step 5: Screenshot loop — Homepage**

> **SCREENSHOT LOOP:** UI work is done. Please paste a screenshot of `http://localhost:3000` so the layout can be verified before marking complete.

Verify:
- Header: "Ascendly" in accent color, fixed at top
- Hero: compact (< 15% of viewport), H1 visible
- Subject grid: 2 columns on mobile / 3 on desktop, 7 cards
- Each card shows subject name + "Start Practicing →"
- No placeholder text visible
- No horizontal scroll

- [ ] **Step 6: Screenshot loop — Subject Hub**

> **SCREENSHOT LOOP:** Please paste a screenshot of `http://localhost:3000/ap-psychology` so the subject hub can be verified.

Verify:
- Subject name as H1
- Exam date + days countdown
- 4 mode cards in 2×2 grid with icons
- Unit Progress section with 8 bars at 0%
- No content hidden under the fixed header

- [ ] **Step 7: Screenshot loop — 404 page**

> **SCREENSHOT LOOP:** Please paste a screenshot of `http://localhost:3000/ap-physics` (invalid slug) so the 404 page can be verified.

Verify: Dark-themed 404 with "← Back to home" link.

- [ ] **Step 8: Update Phase Tracker in CLAUDE.md**

Update the Phase Tracker table in `CLAUDE.md`, changing Phase 1 from `Not Started` to `Complete`.

```bash
git add CLAUDE.md
git commit -m "docs: mark Phase 1 complete in CLAUDE.md"
```
