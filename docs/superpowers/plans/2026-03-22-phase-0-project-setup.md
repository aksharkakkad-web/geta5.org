# Ascendly Phase 0 — Project Setup & Documentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the Ascendly Next.js project with full folder structure, dark theme, KaTeX, Chart.js, Supabase logging, and canonical JSON schemas — so all future phases build on a solid, consistent foundation.

**Architecture:** Next.js 14 App Router with Tailwind CSS. Dark theme via CSS custom properties in globals.css. Anonymous event logging via Supabase (fire-and-forget, never blocks UI). All schemas defined upfront in /data/schemas/ so content agents produce conformant JSON from day one.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, KaTeX, Chart.js, Supabase JS client, TypeScript, Vercel deployment

---

## Prerequisites — Read Before Starting

**Supabase setup requires manual user action (Task 6).** You will need to pause at that step and ask the user to:
1. Create a Supabase account at supabase.com
2. Create a new project named "ascendly"
3. Run the SQL provided in Task 6 to create the events table
4. Provide the Project URL and anon public key

**Windows shell notes:** The working directory is `C:\Ascendly`. Use forward slashes in file paths within code files. All bash commands run in Git Bash (Unix syntax).

---

## File Map

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Lean persistent context — read at start of every session |
| `docs/PRD.md` | Full product reference — preserved from kickoff prompt |
| `package.json` | Dependencies: next, react, tailwind, katex, chart.js, @supabase/supabase-js |
| `next.config.js` | Next.js config — App Router, image domains |
| `tailwind.config.js` | Tailwind config — dark mode, custom theme tokens |
| `tsconfig.json` | TypeScript config |
| `app/layout.tsx` | Root layout — applies dark theme class, imports globals.css |
| `app/page.tsx` | Landing page stub |
| `app/globals.css` | Dark theme CSS custom properties, base styles |
| `lib/supabase.ts` | Supabase anonymous client |
| `app/api/log-event/route.ts` | Vercel serverless route — inserts to Supabase events table |
| `utils/localStorage.ts` | Typed read/write/clear helpers |
| `utils/scramble.ts` | Answer choice scrambler |
| `utils/fuzzyMatch.ts` | Fuzzy match for drill term answers |
| `utils/streak.ts` | Streak calculation logic |
| `utils/scoring.ts` | Projected AP score algorithm stub |
| `utils/analytics.ts` | Fire-and-forget event logging wrapper |
| `components/KatexRenderer.tsx` | KaTeX wrapper — renders formula string |
| `components/ChartRenderer.tsx` | Chart.js wrapper — renders chart from config |
| `components/TableRenderer.tsx` | Styled HTML table from structured data |
| `data/schemas/drill.schema.json` | Canonical drill data shape |
| `data/schemas/mcq.schema.json` | Canonical MCQ data shape |
| `data/schemas/study-guide.schema.json` | Canonical study guide shape |
| `data/schemas/meta.schema.json` | Canonical subject metadata shape |
| `public/favicon.ico` | Placeholder favicon |

---

## Task 1: Generate CLAUDE.md and PRD.md

**Files:**
- Create: `CLAUDE.md`
- Create: `docs/PRD.md`

- [ ] **Step 1.1: Write CLAUDE.md**

Create `C:/Ascendly/CLAUDE.md` with the following content:

```markdown
# Ascendly — Claude Code Context

## Project
Free AP exam prep web app. No signup, no accounts, localStorage only.
URL: ascendly.vercel.app (planned)

## Tech Stack
- Framework: Next.js 14, App Router, TypeScript
- Styling: Tailwind CSS + CSS custom properties (dark theme)
- Formulas: KaTeX (never plain text — always KaTeX)
- Charts: Chart.js
- Storage: localStorage only (no database for user data)
- Analytics: Supabase free tier — anonymous events only
- Deployment: Vercel

## Folder Structure
/app           → Next.js App Router pages
/components    → Reusable React components
/data          → JSON content files + schemas
/utils         → localStorage, scoring, streak, fuzzyMatch, scramble, analytics
/lib           → Supabase client
/styles        → globals.css with CSS custom properties
/docs          → PRD.md, research docs, plans

## Critical Rules
1. NEVER render formulas as plain text — KaTeX always
2. NEVER skip the screenshot loop — UI must be polished before marking done
3. NEVER show placeholder text in screenshot loops — real content only
4. NEVER scramble answer choices in JSON — scrambling at render time only
5. NEVER use real Python/Java in AP CSP — College Board pseudocode only
6. NEVER block UI on Supabase — always fire-and-forget, catch silently
7. AP Chemistry: Checker must approve all formulas before Coder integrates
8. Every MCQ must have per-choice explanations (correct + each distractor)
9. Answer scrambling must be verified across 20+ renders — no positional bias
10. Update this file immediately when any architectural decision is made

## Content Standards Summary
- MCQ difficulty: 20% easy / 45% medium / 35% hard per unit
- MCQ count: 50-100 per unit per subject
- Drills: cover every testable term, formula, person, concept, event — no fixed count
- Stimulus: text passages, Chart.js graphs, HTML tables, College Board pseudocode (CSP)
- Study guide structure: theme → core concepts → key terms → formulas → exam tip

## Subjects (Launch)
1. AP Psychology
2. AP World History
3. AP Government
4. AP Calculus AB
5. AP Precalculus
6. AP Computer Science Principles
7. AP Chemistry

## Phase Tracker
| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup & Documentation | In Progress |
| 1 | Core Shell & Navigation | Not Started |
| 2 | Drill Interface | Not Started |
| 3 | Practice Questions Interface | Not Started |
| 4 | Study Guide Interface | Not Started |
| 5 | Practice Test Interface | Not Started |
| 6 | AP Psychology Content | Not Started |
| 7 | AP World History Content | Not Started |
| 8 | AP Government Content | Not Started |
| 9 | AP Calculus AB Content | Not Started |
| 10 | AP Precalculus Content | Not Started |
| 11 | AP CSP Content | Not Started |
| 12 | AP Chemistry Content | Not Started |
| 13 | Retention Mechanics & Polish | Not Started |
| 14 | Launch | Not Started |

## Supabase Events Table Schema
Table: `events`
- id: uuid (auto)
- event_type: text
- subject: text
- unit: text (nullable)
- metadata: jsonb (nullable)
- created_at: timestamptz (auto)

## localStorage Keys
- `ascendly_streak`: { count: number, lastPracticeDate: string }
- `ascendly_mastery_[subject]_[unit]`: { drillAccuracy: number, mcqAccuracy: number, totalAttempts: number }
- `ascendly_score_[subject]`: { projectedScore: number, accuracy: number }
- `ascendly_total_questions`: number
- `ascendly_active_subject`: string (subject currently in session, for header)
```

- [ ] **Step 1.2: Write docs/PRD.md**

Create `C:/Ascendly/docs/PRD.md` — copy the full content of the kickoff prompt verbatim. This is the product reference document. Do not summarize — preserve every word.

Note: Do NOT run git init yet — that happens in Task 2 after create-next-app scaffolds the project with --no-git.

---

## Task 2: Initialize Next.js Project

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.js`, `tsconfig.json`
- Create: `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 2.1: Initialize Next.js with App Router and TypeScript**

```bash
cd C:/Ascendly
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --no-eslint --import-alias "@/*" --yes --no-git
```

Expected output: Next.js project scaffolded with App Router, TypeScript, Tailwind CSS.

- [ ] **Step 2.1b: Initialize git repo (after scaffold, not before)**

```bash
cd C:/Ascendly
git init
# .env.local must be in .gitignore before first commit
grep -q "\.env\.local" .gitignore || echo ".env.local" >> .gitignore
git add -A
git commit -m "docs: CLAUDE.md, PRD.md, and initial Next.js scaffold"
```

- [ ] **Step 2.2: Install additional dependencies**

```bash
npm install katex chart.js react-chartjs-2 @supabase/supabase-js
npm install --save-dev @types/katex
```

- [ ] **Step 2.3: Verify dev server starts**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -20
```

Expected: HTML response containing Next.js root content.

Kill the dev server after verifying.

- [ ] **Step 2.4: Commit**

```bash
git add -A
git commit -m "feat: install KaTeX, Chart.js, Supabase dependencies"
```

---

## Task 3: Dark Theme & Global Styles

**Files:**
- Modify: `app/globals.css` (or `styles/globals.css`)
- Modify: `app/layout.tsx`
- Modify: `tailwind.config.js`

- [ ] **Step 3.1: Write dark theme CSS custom properties**

Replace contents of `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Background layers */
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-card: #161616;
  --bg-card-hover: #1c1c1c;
  --bg-border: #222222;

  /* Text */
  --text-primary: #f5f5f5;
  --text-secondary: #a1a1a1;
  --text-muted: #6b6b6b;

  /* Accent */
  --accent-primary: #6366f1;
  --accent-primary-hover: #818cf8;
  --accent-success: #22c55e;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;

  /* Mastery bar */
  --mastery-empty: #1e1e1e;
  --mastery-fill: #6366f1;

  /* Spacing scale */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* KaTeX override for dark theme */
.katex {
  color: var(--text-primary);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--bg-border);
  border-radius: 3px;
}
```

- [ ] **Step 3.2: Update tailwind.config.js to expose CSS custom properties**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Dark mode via class — :root CSS vars are always-on dark, but this enables dark: utilities
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-card-hover': 'var(--bg-card-hover)',
        'bg-border': 'var(--bg-border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent': 'var(--accent-primary)',
        'accent-hover': 'var(--accent-primary-hover)',
        'accent-success': 'var(--accent-success)',
        'accent-warning': 'var(--accent-warning)',
        'accent-danger': 'var(--accent-danger)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3.3: Update root layout to apply dark background**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ascendly — Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides. No signup required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3.4: Commit**

```bash
git add -A
git commit -m "feat: add dark theme CSS custom properties and Tailwind config"
```

---

## Task 4: Complete Folder Structure

**Files:** All directories and stub files

- [ ] **Step 4.1: Create all directories and placeholder files**

```bash
mkdir -p C:/Ascendly/components
mkdir -p C:/Ascendly/data/schemas
mkdir -p C:/Ascendly/data/subjects
mkdir -p C:/Ascendly/utils
mkdir -p C:/Ascendly/lib
mkdir -p C:/Ascendly/public
mkdir -p C:/Ascendly/docs/research

# Subject directories
for subject in ap-psychology ap-world-history ap-government ap-calculus-ab ap-precalculus ap-csp ap-chemistry; do
  mkdir -p C:/Ascendly/data/subjects/$subject/units
done
```

- [ ] **Step 4.2: Create stub app routes**

```bash
mkdir -p "C:/Ascendly/app/[subject]/[unit]/drills"
mkdir -p "C:/Ascendly/app/[subject]/[unit]/practice-questions"
mkdir -p "C:/Ascendly/app/[subject]/[unit]/study-guide"
mkdir -p "C:/Ascendly/app/[subject]/practice-test"
mkdir -p "C:/Ascendly/app/api/log-event"
```

Create stub page files (just "coming soon" exports for now):

```tsx
// app/page.tsx — replace the create-next-app default
export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Ascendly</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Free AP Exam Prep — coming soon</p>
    </main>
  )
}
```

```tsx
// app/[subject]/page.tsx
export default function SubjectPage({ params }: { params: { subject: string } }) {
  return <div>Subject: {params.subject}</div>
}
```

```tsx
// app/[subject]/[unit]/drills/page.tsx
export default function DrillsPage() { return <div>Drills coming soon</div> }
```

```tsx
// app/[subject]/[unit]/practice-questions/page.tsx
export default function PracticeQuestionsPage() { return <div>Practice Questions coming soon</div> }
```

```tsx
// app/[subject]/[unit]/study-guide/page.tsx
export default function StudyGuidePage() { return <div>Study Guide coming soon</div> }
```

```tsx
// app/[subject]/practice-test/page.tsx
export default function PracticeTestPage() { return <div>Practice Test coming soon</div> }
```

- [ ] **Step 4.3: Commit**

```bash
git add -A
git commit -m "feat: establish complete folder structure with stub routes"
```

---

## Task 5: Utility Files

**Files:**
- Create: `utils/localStorage.ts`
- Create: `utils/scramble.ts`
- Create: `utils/fuzzyMatch.ts`
- Create: `utils/streak.ts`
- Create: `utils/scoring.ts`
- Create: `utils/analytics.ts`

- [ ] **Step 5.1: Write utils/localStorage.ts**

```typescript
// utils/localStorage.ts
const isClient = typeof window !== 'undefined'

export function lsGet<T>(key: string, fallback: T): T {
  if (!isClient) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function lsSet<T>(key: string, value: T): void {
  if (!isClient) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function lsClear(key: string): void {
  if (!isClient) return
  try {
    window.localStorage.removeItem(key)
  } catch {}
}

// Typed key helpers
export const LS_KEYS = {
  streak: 'ascendly_streak',
  mastery: (subject: string, unit: string) => `ascendly_mastery_${subject}_${unit}`,
  score: (subject: string) => `ascendly_score_${subject}`,
  totalQuestions: 'ascendly_total_questions',
  activeSubject: 'ascendly_active_subject',
} as const
```

- [ ] **Step 5.2: Write utils/scramble.ts**

```typescript
// utils/scramble.ts
// Fisher-Yates shuffle — no seed = true randomness on every render
// NEVER pre-scramble in JSON — call this at render time only
export function scramble<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
```

- [ ] **Step 5.3: Write utils/fuzzyMatch.ts**

```typescript
// utils/fuzzyMatch.ts
// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

// Returns true if student answer matches correct answer or any alternate
// Tolerance: up to 2 edit distance for short answers, up to 3 for longer
export function fuzzyMatch(studentAnswer: string, correctAnswer: string, alternates: string[] = []): boolean {
  const norm = normalize(studentAnswer)
  const allAnswers = [correctAnswer, ...alternates].map(normalize)

  for (const answer of allAnswers) {
    if (norm === answer) return true
    const maxDist = answer.length <= 5 ? 1 : answer.length <= 10 ? 2 : 3
    if (levenshtein(norm, answer) <= maxDist) return true
  }
  return false
}
```

- [ ] **Step 5.4: Write utils/streak.ts**

```typescript
// utils/streak.ts
import { lsGet, lsSet, LS_KEYS } from './localStorage'

interface StreakData {
  count: number
  lastPracticeDate: string // ISO date string YYYY-MM-DD
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function getStreak(): number {
  const data = lsGet<StreakData | null>(LS_KEYS.streak, null)
  if (!data) return 0
  const today = todayISO()
  const yesterday = yesterdayISO()
  // Active streak: practiced today or yesterday
  if (data.lastPracticeDate === today || data.lastPracticeDate === yesterday) {
    return data.count
  }
  return 0
}

export function recordPractice(): number {
  const data = lsGet<StreakData | null>(LS_KEYS.streak, null)
  const today = todayISO()
  const yesterday = yesterdayISO()

  if (!data) {
    lsSet(LS_KEYS.streak, { count: 1, lastPracticeDate: today })
    return 1
  }

  if (data.lastPracticeDate === today) {
    // Already practiced today — no change
    return data.count
  }

  if (data.lastPracticeDate === yesterday) {
    // Extending streak
    const newCount = data.count + 1
    lsSet(LS_KEYS.streak, { count: newCount, lastPracticeDate: today })
    return newCount
  }

  // Streak broken — reset
  lsSet(LS_KEYS.streak, { count: 1, lastPracticeDate: today })
  return 1
}
```

- [ ] **Step 5.5: Write utils/scoring.ts (stub)**

```typescript
// utils/scoring.ts
// Projected AP score 1-5 from cumulative accuracy data
// This is a stub — calibrated in Phase 13 with real unit weightings
export function projectScore(rawAccuracy: number): 1 | 2 | 3 | 4 | 5 {
  const accuracy = Math.max(0, Math.min(1, rawAccuracy)) // clamp to [0,1]
  if (accuracy >= 0.80) return 5
  if (accuracy >= 0.65) return 4
  if (accuracy >= 0.50) return 3
  if (accuracy >= 0.35) return 2
  return 1
}
```

- [ ] **Step 5.6: Write utils/analytics.ts**

```typescript
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
```

- [ ] **Step 5.7: Write unit tests for utilities**

Create `utils/__tests__/fuzzyMatch.test.ts`:

```typescript
import { fuzzyMatch } from '../fuzzyMatch'

describe('fuzzyMatch', () => {
  it('exact match returns true', () => expect(fuzzyMatch('neuron', 'neuron')).toBe(true))
  it('case insensitive match', () => expect(fuzzyMatch('NEURON', 'neuron')).toBe(true))
  it('within tolerance (1 edit)', () => expect(fuzzyMatch('neron', 'neuron')).toBe(true))
  it('rejects clearly wrong answer', () => expect(fuzzyMatch('synapse', 'neuron')).toBe(false))
  it('accepts alternate answer', () => expect(fuzzyMatch('nerve cell', 'neuron', ['nerve cell'])).toBe(true))
  it('trims whitespace', () => expect(fuzzyMatch('  neuron  ', 'neuron')).toBe(true))
})
```

Create `utils/__tests__/scramble.test.ts`:

```typescript
import { scramble } from '../scramble'

describe('scramble', () => {
  it('preserves all elements', () => {
    const input = ['A', 'B', 'C', 'D']
    const result = scramble(input)
    expect(result.sort()).toEqual(input.sort())
  })
  it('preserves length', () => {
    expect(scramble([1, 2, 3, 4]).length).toBe(4)
  })
  it('does not mutate input array', () => {
    const input = [1, 2, 3, 4]
    scramble(input)
    expect(input).toEqual([1, 2, 3, 4])
  })
})
```

Create `utils/__tests__/scoring.test.ts`:

```typescript
import { projectScore } from '../scoring'

describe('projectScore', () => {
  it('returns 5 for accuracy >= 0.80', () => expect(projectScore(0.85)).toBe(5))
  it('returns 4 for accuracy in [0.65, 0.80)', () => expect(projectScore(0.70)).toBe(4))
  it('returns 3 for accuracy in [0.50, 0.65)', () => expect(projectScore(0.55)).toBe(3))
  it('returns 2 for accuracy in [0.35, 0.50)', () => expect(projectScore(0.40)).toBe(2))
  it('returns 1 for accuracy < 0.35', () => expect(projectScore(0.10)).toBe(1))
  it('clamps values above 1', () => expect(projectScore(1.5)).toBe(5))
  it('clamps values below 0', () => expect(projectScore(-0.5)).toBe(1))
  it('handles exact boundary 0.80', () => expect(projectScore(0.80)).toBe(5))
})
```

- [ ] **Step 5.8: Configure Jest**

```bash
npm install --save-dev jest @types/jest ts-jest jest-environment-jsdom
```

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }] },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}

export default createJestConfig(config)
```

- [ ] **Step 5.9: Run tests**

```bash
npx jest utils/__tests__/ --no-coverage
```

Expected: All tests pass (PASS).

- [ ] **Step 5.10: Commit**

```bash
git add -A
git commit -m "feat: add utility functions with unit tests (localStorage, scramble, fuzzyMatch, streak, scoring, analytics)"
```

---

## Task 6: Supabase Setup — REQUIRES USER ACTION

**Files:**
- Create: `lib/supabase.ts`
- Create: `.env.local`
- Create: `app/api/log-event/route.ts`

**PAUSE HERE — ask the user to:**
1. Go to supabase.com and create a free account
2. Create a new project named "ascendly"
3. In the Supabase SQL editor, run:

```sql
create table events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  subject text not null,
  unit text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Disable RLS for anonymous inserts (no auth needed)
alter table events enable row level security;
create policy "anonymous insert" on events for insert with check (true);
```

4. Copy the Project URL and anon public key from Settings > API
5. Provide these values so you can write `.env.local`

- [ ] **Step 6.1: Create .env.local with Supabase credentials (once user provides them)**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ANON_KEY=your-anon-key
```

Note: `NEXT_PUBLIC_SUPABASE_ANON_KEY` is for `lib/supabase.ts` (client-side). `SUPABASE_ANON_KEY` (no prefix) is for the server-side API route — kept out of the client bundle as a pattern for future-proofing.

`.env.local` was already added to .gitignore in Step 2.1b — verify with `grep '.env.local' .gitignore`.

- [ ] **Step 6.2: Write lib/supabase.ts**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 6.3: Write app/api/log-event/route.ts**

```typescript
// app/api/log-event/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side only — uses non-public env var to avoid embedding in client bundle
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, subject, unit, metadata } = body

    if (!event_type || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('events')
      .insert({ event_type, subject, unit: unit ?? null, metadata: metadata ?? null })

    if (error) {
      // Log server-side but return 200 — never block clients
      console.error('Supabase insert error:', error)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('log-event error:', err)
    return NextResponse.json({ ok: false }, { status: 200 }) // Always 200 to client
  }
}
```

- [ ] **Step 6.4: Test Supabase insert**

```bash
npm run dev &
sleep 5
curl -X POST http://localhost:3000/api/log-event \
  -H "Content-Type: application/json" \
  -d '{"event_type":"test","subject":"setup-verification"}'
```

Expected: `{"ok":true}`
Verify row appears in Supabase dashboard Table Editor > events.

- [ ] **Step 6.5: Commit**

```bash
git add lib/supabase.ts app/api/log-event/route.ts .gitignore
git commit -m "feat: add Supabase client and anonymous event logging API route"
```

---

## Task 7: Renderer Components

**Files:**
- Create: `components/KatexRenderer.tsx`
- Create: `components/ChartRenderer.tsx`
- Create: `components/TableRenderer.tsx`

- [ ] **Step 7.1: Write KatexRenderer.tsx**

```tsx
// components/KatexRenderer.tsx
'use client'
import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface Props {
  formula: string
  displayMode?: boolean // true = block, false = inline
  className?: string
}

export default function KatexRenderer({ formula, displayMode = false, className = '' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    try {
      katex.render(formula, ref.current, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      })
    } catch (err) {
      if (ref.current) ref.current.textContent = formula
    }
  }, [formula, displayMode])

  // displayMode renders a block element — must use div to avoid invalid HTML (div inside span)
  if (displayMode) {
    return <div ref={ref as React.RefObject<HTMLDivElement>} className={className} />
  }
  return <span ref={ref as React.RefObject<HTMLSpanElement>} className={className} />
}
```

- [ ] **Step 7.2: Write ChartRenderer.tsx**

```tsx
// components/ChartRenderer.tsx
'use client'
import { useEffect, useRef } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  config: ChartConfiguration
  className?: string
}

export default function ChartRenderer({ config, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    // Destroy existing chart before re-creating
    if (chartRef.current) {
      chartRef.current.destroy()
    }
    chartRef.current = new Chart(canvasRef.current, {
      ...config,
      options: {
        ...config.options,
        responsive: true,
        plugins: {
          ...config.options?.plugins,
          legend: {
            labels: { color: '#a1a1a1' },
            ...config.options?.plugins?.legend,
          },
        },
        scales: config.options?.scales
          ? Object.fromEntries(
              Object.entries(config.options.scales).map(([k, v]) => [
                k,
                { ...v, ticks: { color: '#a1a1a1', ...(v as any).ticks }, grid: { color: '#222222', ...(v as any).grid } },
              ])
            )
          : undefined,
      },
    })
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null // prevent double-destroy on config change
    }
  }, [config])

  return (
    <div className={className} style={{ position: 'relative', maxWidth: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
```

- [ ] **Step 7.3: Write TableRenderer.tsx**

```tsx
// components/TableRenderer.tsx
interface TableData {
  headers: string[]
  rows: string[][]
}

interface Props {
  data: TableData
  className?: string
}

export default function TableRenderer({ data, className = '' }: Props) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9rem',
        color: 'var(--text-primary)',
      }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {data.headers.map((h, i) => (
              <th key={i} style={{
                padding: '10px 14px',
                textAlign: 'left',
                fontWeight: 600,
                borderBottom: '1px solid var(--bg-border)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} style={{
              backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
            }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '9px 14px',
                  borderBottom: '1px solid var(--bg-border)',
                  verticalAlign: 'top',
                  lineHeight: 1.5,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 7.4: Create verification page to test all renderers**

```tsx
// app/test-renderers/page.tsx  ← TEMPORARY, delete after verification
'use client'
import KatexRenderer from '@/components/KatexRenderer'
import ChartRenderer from '@/components/ChartRenderer'
import TableRenderer from '@/components/TableRenderer'

const testChart = {
  type: 'line' as const,
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{ label: 'Test', data: [10, 20, 15, 30], borderColor: '#6366f1', tension: 0.3 }],
  },
}

const testTable = {
  headers: ['Term', 'Definition'],
  rows: [['Neuron', 'Basic unit of nervous system'], ['Synapse', 'Junction between neurons']],
}

export default function TestRenderers() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '40px', fontSize: '1.5rem' }}>Renderer Verification</h1>
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>KaTeX — Inline</h2>
        <p>The quadratic formula is <KatexRenderer formula="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" /></p>
      </section>
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>KaTeX — Display Block</h2>
        <KatexRenderer formula="\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}" displayMode />
      </section>
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Chart.js</h2>
        <ChartRenderer config={testChart} />
      </section>
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Table</h2>
        <TableRenderer data={testTable} />
      </section>
    </div>
  )
}
```

- [ ] **Step 7.5: Verify all renderers visually**

Start dev server, navigate to http://localhost:3000/test-renderers.
Verify:
- KaTeX inline formula renders correctly (not plain text)
- KaTeX display block formula renders correctly
- Chart.js line chart renders with dark-themed axes
- Table renders with alternating row backgrounds

Take a screenshot if possible.

- [ ] **Step 7.6: Delete test page and commit**

```bash
rm app/test-renderers/page.tsx
git add -A
git commit -m "feat: add KatexRenderer, ChartRenderer, TableRenderer components"
```

---

## Task 8: JSON Schemas

**Files:**
- Create: `data/schemas/drill.schema.json`
- Create: `data/schemas/mcq.schema.json`
- Create: `data/schemas/study-guide.schema.json`
- Create: `data/schemas/meta.schema.json`

- [ ] **Step 8.1: Write drill.schema.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Drill",
  "type": "object",
  "required": ["id", "unit", "subject", "mode", "prompt", "answer", "difficulty"],
  "properties": {
    "id": { "type": "string", "description": "Unique ID, e.g. psych-u1-d001" },
    "unit": { "type": "string", "description": "e.g. unit-1" },
    "subject": { "type": "string", "description": "e.g. ap-psychology" },
    "mode": { "type": "string", "enum": ["definition_to_term", "formula_to_type", "person_to_significance", "event_to_date", "concept_to_example", "term_to_definition"], "description": "Drill interaction mode — all subjects use definition_to_term; math/chem use formula_to_type" },
    "prompt": { "type": "string", "description": "What is shown to the student" },
    "answer": { "type": "string", "description": "Canonical correct answer" },
    "alternate_answers": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Alternate accepted answers for fuzzy matching"
    },
    "difficulty": { "type": "string", "enum": ["easy", "medium", "hard"] },
    "katex_required": { "type": "boolean", "description": "True if answer must render in KaTeX" }
  }
}
```

- [ ] **Step 8.2: Write mcq.schema.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MCQ",
  "type": "object",
  "required": ["id", "unit", "subject", "difficulty", "stimulus", "question", "choices", "unit_objective"],
  "properties": {
    "id": { "type": "string" },
    "unit": { "type": "string" },
    "subject": { "type": "string" },
    "difficulty": { "type": "string", "enum": ["easy", "medium", "hard"] },
    "stimulus": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "enum": ["text", "table", "chart", "code", "none"] },
        "content": {
          "description": "String for text/code; {headers, rows} for table; Chart.js config object for chart; null for none"
        }
      }
    },
    "question": { "type": "string" },
    "choices": {
      "type": "array",
      "minItems": 4,
      "maxItems": 4,
      "items": {
        "type": "object",
        "required": ["id", "text", "is_correct", "explanation"],
        "properties": {
          "id": { "type": "string", "enum": ["A", "B", "C", "D"] },
          "text": { "type": "string" },
          "is_correct": { "type": "boolean" },
          "explanation": { "type": "string", "description": "Why this choice is correct or specifically wrong" }
        }
      }
    },
    "unit_objective": { "type": "string", "description": "CED learning objective code or description this question covers" }
  }
}
```

- [ ] **Step 8.3: Write study-guide.schema.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "StudyGuide",
  "type": "object",
  "required": ["id", "unit", "subject", "theme", "core_concepts", "key_terms", "exam_tip"],
  "properties": {
    "id": { "type": "string" },
    "unit": { "type": "string" },
    "subject": { "type": "string" },
    "theme": { "type": "string", "description": "One sentence capturing the unit's core theme" },
    "core_concepts": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 5,
      "maxItems": 8
    },
    "key_terms": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["term", "definition"],
        "properties": {
          "term": { "type": "string" },
          "definition": { "type": "string", "description": "One line max" }
        }
      }
    },
    "formulas": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "katex_string"],
        "properties": {
          "name": { "type": "string" },
          "katex_string": { "type": "string" }
        }
      }
    },
    "diagrams": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type"],
        "properties": {
          "type": { "type": "string", "enum": ["table", "chart"] },
          "data": {}
        }
      }
    },
    "exam_tip": { "type": "string", "description": "One sentence on what College Board emphasizes" }
  }
}
```

- [ ] **Step 8.4: Write meta.schema.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SubjectMeta",
  "type": "object",
  "required": ["subject_id", "subject_name", "exam_date", "units"],
  "properties": {
    "subject_id": { "type": "string", "description": "e.g. ap-psychology" },
    "subject_name": { "type": "string", "description": "e.g. AP Psychology" },
    "exam_date": { "type": "string", "description": "ISO date string YYYY-MM-DD" },
    "total_mcq_count": { "type": "number", "description": "Real AP exam question count" },
    "units": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["unit_id", "unit_name", "unit_number", "college_board_percentage", "learning_objectives"],
        "properties": {
          "unit_id": { "type": "string", "description": "e.g. unit-1" },
          "unit_name": { "type": "string" },
          "unit_number": { "type": "number" },
          "college_board_percentage": { "type": "number", "description": "Percentage 0-100 of exam questions from this unit" },
          "learning_objectives": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    }
  }
}
```

- [ ] **Step 8.5: Validate schemas are valid JSON**

```bash
for f in C:/Ascendly/data/schemas/*.json; do
  python3 -c "import json; json.load(open('$f')); print('OK: $f')" || echo "INVALID: $f"
done
```

- [ ] **Step 8.6: Commit**

```bash
git add data/schemas/
git commit -m "feat: add canonical JSON schemas for drill, mcq, study-guide, and meta"
```

---

## Task 9: Final Verification & Phase 0 Sign-Off

- [ ] **Step 9.1: Run full dev server and verify**

```bash
npm run dev
```

Visit http://localhost:3000 — should load dark background, no errors in console.

- [ ] **Step 9.2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors (or only minor stub-related warnings acceptable).

- [ ] **Step 9.3: Update CLAUDE.md Phase 0 status to Complete**

Change `| 0 | Project Setup & Documentation | In Progress |` to `| 0 | Project Setup & Documentation | Complete |`

- [ ] **Step 9.4: Final commit**

```bash
git add -A
git commit -m "feat: phase 0 complete — project setup, schemas, utilities, renderer components"
```

---

## Phase 0 Completion Checklist

Before marking Phase 0 done, verify:
- [ ] Project runs locally with `npm run dev`
- [ ] Dark background renders at http://localhost:3000
- [ ] KaTeX renders a test formula correctly (not plain text)
- [ ] Chart.js renders a test chart with dark-themed axes
- [ ] Supabase event insert works (row appears in dashboard)
- [ ] All 4 JSON schemas exist and are valid JSON
- [ ] All utility files exist and TypeScript compiles
- [ ] CLAUDE.md Phase Tracker shows Phase 0 as Complete
- [ ] No placeholder .env.local values committed to git
