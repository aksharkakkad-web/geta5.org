# Phase 3: Practice Questions Interface - Research

**Researched:** 2026-03-24
**Domain:** React MCQ session UI, Chart.js dark theming, KaTeX in stimuli, choice scrambling, localStorage mastery writes
**Confidence:** HIGH

## Summary

Phase 3 builds the MCQ practice interface by closely mirroring the Phase 2 drill orchestrator pattern. The architecture is already fully specified in CONTEXT.md and the codebase already ships all required dependencies (Chart.js 4.5.1, react-chartjs-2 5.3.1, KaTeX 0.16.40). No new packages are needed.

The primary new technical capability vs. Phase 2 is `StimulusRenderer.tsx` — a switch component that handles five stimulus types (text, table, chart, code, none). The chart path requires explicit Chart.js component registration and dark-theme color injection into the ChartConfiguration object before rendering. The other three types are straightforward HTML with project-standard CSS custom properties.

The session state machine follows the drill pattern precisely: `MCQView` union type, `useState` in page orchestrator, child components receive handlers. The key behavioral difference from drills is multi-state choice interaction (idle → selected → submitted) and the post-submit reveal of all four per-choice explanations inline.

**Primary recommendation:** Mirror the drill orchestrator pattern exactly. The entire data flow, localStorage write logic, and analytics firing from `drillSession.ts` should be replicated as `mcqSession.ts`. Do not reuse `drillSession.ts` directly — the types differ enough to warrant a parallel utility.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Routing & Architecture (carried from Phase 2)**
- D-01: Single route: `app/[subject]/practice/page.tsx` — `'use client'` orchestrator component
- D-02: Three views via React state: `type MCQView = 'unit-select' | 'session' | 'results'`
- D-03: URL never changes during a session. Browser back exits to subject hub.
- D-04: Component tree: `page.tsx` orchestrates `<UnitSelector />`, `<MCQSession />`, `<MCQResults />`

**Component Files (locked)**
| Action | File |
|--------|------|
| Create | `app/[subject]/practice/page.tsx` |
| Create | `components/mcq/UnitSelector.tsx` |
| Create | `components/mcq/MCQSession.tsx` |
| Create | `components/mcq/MCQCard.tsx` |
| Create | `components/mcq/MCQResults.tsx` |
| Create | `components/mcq/StimulusRenderer.tsx` |
| Modify | `app/globals.css` — MCQ-specific CSS if needed |

**Data Shape (locked — from mcq.schema.json)**
```ts
interface MCQ {
  id: string
  unit: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  stimulus: {
    type: 'text' | 'table' | 'chart' | 'code' | 'none'
    content?: string | { headers: string[]; rows: string[][] } | ChartConfiguration | null
  }
  question: string
  choices: Array<{
    id: 'A' | 'B' | 'C' | 'D'
    text: string
    is_correct: boolean
    explanation: string
  }>
  unit_objective: string
}
```

MCQ file structure: `data/[subject]/mcq/unit-[n].json`
Load path: `fetch('/data/${subject}/mcq/unit-${n}.json')` client-side on unit selection.

**Stimulus Rendering (locked)**
- D-05: Each stimulus type renders in a dedicated component above the question text
- D-06: `StimulusRenderer.tsx` — switch on `stimulus.type`:
  - `text`: Styled blockquote with passage text; parse `$...$` via KatexRenderer
  - `table`: HTML `<table>` with `<thead>` from `headers[]`, `<tbody>` from `rows[][]`; styled with CSS custom properties
  - `chart`: Chart.js `<canvas>` rendered via `react-chartjs-2` or direct Chart.js; dark theme colors applied to config
  - `code`: Monospaced `<pre>` block with College Board pseudocode styling (AP CSP only)
  - `none`: No stimulus block rendered; question displays directly

**Question Flow (locked)**
- D-07: One question at a time — matches drill session pattern from Phase 2
- D-08: Session header: progress bar (X of Y), subject/unit label
- D-09: All MCQs for the unit loaded and shuffled via `scramble.ts`
- D-10: "Study All" aggregates all loaded units' MCQs then shuffles

**Answer Choice Display (locked)**
- D-11: 4 choices displayed as selectable cards/buttons (A, B, C, D labels)
- D-12: Choices scrambled at render time via `scramble.ts` — labels (A/B/C/D) reassigned after shuffle
- D-13: Student selects one choice, then clicks "Submit Answer" (or choice click auto-submits — Claude's discretion)
- D-14: No answer change after selection — single attempt per question

**Feedback Presentation (locked)**
- D-15: After submit, all 4 choice explanations shown inline under each choice
- D-16: Correct choice: highlighted green (`var(--accent-success)`) with checkmark
- D-17: Selected wrong choice: highlighted red (`var(--accent-danger)`) with X mark
- D-18: Other choices: dimmed/muted styling
- D-19: "Next question" button appears after feedback is shown

**Results Screen (locked — mirrors drill pattern)**
- D-20: Score ring with conic gradient (same pattern as drill results)
- D-21: Contextual heading by accuracy tier (same thresholds as drills)
- D-22: Missed questions list: shows question text, student's choice, correct choice
- D-23: CTAs: "Retry missed" (hidden at 0), "Back to [subject]", "Study another unit"

**Data Flow on Session Complete (locked)**
- D-24: Non-retry, non-Study-All:
  ```ts
  const mcqAccuracy = correctCount / totalQuestions
  const existing = lsGet(LS_KEYS.mastery(subject, unitSlug), { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 })
  lsSet(LS_KEYS.mastery(subject, unitSlug), { ...existing, mcqAccuracy, totalAttempts: existing.totalAttempts + totalQuestions })
  const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
  lsSet(LS_KEYS.totalQuestions, prevTotal + totalQuestions)
  logEvent({ event_type: 'mcq_completed', subject, unit: unitSlug, metadata: { accuracy: mcqAccuracy, question_count: totalQuestions, is_retry: false } })
  ```
- D-25: Retry sessions: Do NOT write `mcqAccuracy`. Do increment `totalQuestions`. Fire logEvent with `is_retry: true`.
- D-26: Study All sessions: Do NOT write any mastery key. Do increment `totalQuestions`. Fire logEvent with `unit: 'all'`.

### Claude's Discretion
- Whether choice selection auto-submits or requires explicit "Submit Answer" click
- Exact visual layout of stimulus block (padding, max-height, scrolling for long passages)
- Chart.js dark theme color overrides (must use CSS custom property values)
- Pseudocode syntax highlighting approach (plain monospace or lightweight highlighting)
- Transition animations between question states
- Whether to reuse drill's UnitSelector directly or create MCQ-specific variant

### Deferred Ideas (OUT OF SCOPE)
- Adaptive difficulty (harder questions based on mastery) — Phase 13
- Question filtering by difficulty level — not in Phase 3 scope
- Bookmarking/flagging questions for review — not in v1 scope
- Timed MCQ mode — Phase 5 (Practice Tests)
- Content JSON files — content phases (6-12) generate these; Phase 3 only builds the interface
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MCQ-01 | Student can select a unit and start a MCQ session | UnitSelector pattern from drill `components/drill/UnitSelector.tsx` directly reusable; MCQ variant fetches from `data/[subject]/mcq/unit-[n].json` using same `Promise.allSettled` pattern |
| MCQ-02 | MCQ displays stimulus content (text, Chart.js graph, HTML table, pseudocode) | `StimulusRenderer.tsx` switch component; react-chartjs-2 5.3.1 already installed; Chart.js 4.5 requires explicit `Chart.register()` for tree-shaking |
| MCQ-03 | 4 answer choices displayed; scrambled at render time (utils/scramble.ts) | `scramble<T>()` from `utils/scramble.ts` works on any array — call on the choices array in MCQCard; labels A/B/C/D reassigned positionally after shuffle |
| MCQ-04 | Submit answer → immediate feedback (correct/incorrect + explanation for all choices) | MCQCard manages `choiceState: 'idle' \| 'selected' \| 'submitted'`; after submit reveal all four explanation panels |
| MCQ-05 | Per-choice explanations shown: correct answer explanation + each distractor explanation | Each choice object carries `explanation: string` per mcq.schema.json; render all four post-submit, styled by role (correct / selected-wrong / other) |
| MCQ-06 | Results screen with score and unit mastery update | MCQResults mirrors DrillResults; score ring CSS (`.score-ring`) already defined in globals.css — reusable directly |
| MCQ-07 | MCQ mastery written to localStorage (mcqAccuracy update) | `handleMCQSessionComplete()` in new `utils/mcqSession.ts`; uses `lsSet(LS_KEYS.mastery(...))` merging `mcqAccuracy` into existing mastery object per D-24 |
| MCQ-08 | Supabase mcq_complete event logged | `logEvent({ event_type: 'mcq_completed', ... })` via existing `utils/analytics.ts`; fire-and-forget pattern established |
</phase_requirements>

---

## Standard Stack

### Core (all already installed — no new packages required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-chartjs-2 | 5.3.1 | Declarative Chart.js wrapper for React | Already in package.json; provides `<Line>`, `<Bar>`, `<Doughnut>` etc. as React components |
| chart.js | 4.5.1 | Chart rendering engine | Already in package.json; peer dep of react-chartjs-2 |
| katex | 0.16.40 | Math formula rendering | Already in package.json; `KatexRenderer.tsx` wrapper already exists |
| lucide-react | 0.577.0 | Icons (Check, X, ChevronRight, etc.) | Project standard — no emojis as icons |

### Supporting (project utilities — already exist)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `utils/scramble.ts` | — | Fisher-Yates shuffle | Scramble question order on unit load; scramble choice order in MCQCard on mount |
| `utils/localStorage.ts` | — | `lsGet`/`lsSet`/`LS_KEYS` | All localStorage reads and writes in session complete handler |
| `utils/analytics.ts` | — | `logEvent()` fire-and-forget | Analytics call after session complete |
| `components/KatexRenderer.tsx` | — | KaTeX rendering | Text stimuli with `$...$` tokens; math in choice text |
| `utils/subjects.ts` | — | `getSubject(slug)` | Unit names, unit count per subject in UnitSelector |

**Installation:** None required — all dependencies are already present.

---

## Architecture Patterns

### Recommended Project Structure

```
app/[subject]/practice/
└── page.tsx              # 'use client' orchestrator — MCQView state machine

components/mcq/
├── UnitSelector.tsx      # Fetches unit MCQ files, shows unit grid + Study All
├── MCQSession.tsx        # Session header (progress bar, unit label, score badges) + renders MCQCard
├── MCQCard.tsx           # Single question: stimulus → question → scrambled choices → feedback reveal
├── MCQResults.tsx        # Score ring, missed list, retry/back CTAs, triggers handleMCQSessionComplete()
└── StimulusRenderer.tsx  # Switch on stimulus.type → renders text/table/chart/code/null

utils/
└── mcqSession.ts         # MCQ types (MCQ, MCQView, MCQSessionState), handleMCQSessionComplete()

data/[subject]/mcq/
└── unit-[n].json         # Content files (created in phases 6–12); interface handles missing gracefully
```

### Pattern 1: Orchestrator State Machine (mirrors drills/page.tsx exactly)

**What:** `page.tsx` holds `view` and `session` state, renders one child at a time, passes handlers down.

**When to use:** Always — this is the locked architecture per D-01 through D-04.

```typescript
// Source: mirrors app/[subject]/drills/page.tsx
'use client'
import { useState } from 'react'
import { use } from 'react'
import type { MCQView, MCQSessionState } from '@/utils/mcqSession'

export default function PracticePage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const [view, setView] = useState<MCQView>('unit-select')
  const [session, setSession] = useState<MCQSessionState | null>(null)

  // handlers: handleStart, handleComplete, handleRetry, handleUnitSelect
  // — identical structural pattern to DrillsPage
}
```

### Pattern 2: Choice Scrambling with Label Reassignment

**What:** Scramble choices array at MCQCard mount; reassign A/B/C/D labels by position after shuffle.

**When to use:** In `MCQCard.tsx` — scramble once on mount via `useMemo` or `useState` with initial value.

```typescript
// Source: project pattern — scramble.ts + schema design
import { scramble } from '@/utils/scramble'

// Inside MCQCard, on mount only (not on every render):
const [scrambledChoices] = useState(() => scramble(choices))

// Render with positional labels:
const LABELS = ['A', 'B', 'C', 'D'] as const
scrambledChoices.map((choice, i) => ({
  ...choice,
  displayLabel: LABELS[i],  // A/B/C/D reassigned after shuffle
}))
```

**Critical:** The `id` field ('A'/'B'/'C'/'D') from JSON is the canonical identity — used to find the correct answer. The `displayLabel` is only for visual rendering. Never compare display labels to determine correctness.

### Pattern 3: Chart.js Registration + Dark Theme Injection

**What:** Chart.js 4.x requires explicit component registration before use. Chart configs from JSON use default light colors — must override with CSS custom property hex values before rendering.

**When to use:** In `StimulusRenderer.tsx` for `stimulus.type === 'chart'`.

```typescript
// Source: Chart.js 4.x documentation + react-chartjs-2 5.x docs
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

// Register once at module level (not inside component)
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend
)

// Dark theme override applied to ChartConfiguration before render:
function applyDarkTheme(config: ChartConfiguration): ChartConfiguration {
  return {
    ...config,
    options: {
      ...config.options,
      plugins: {
        ...config.options?.plugins,
        legend: {
          ...config.options?.plugins?.legend,
          labels: { color: '#a1a1a1' },  // var(--text-secondary)
        },
      },
      scales: Object.fromEntries(
        Object.entries(config.options?.scales ?? {}).map(([key, scale]) => [
          key,
          {
            ...scale,
            ticks: { color: '#a1a1a1' },
            grid: { color: '#222222' },  // var(--bg-border)
          },
        ])
      ),
    },
  }
}
```

**Note:** CSS custom properties cannot be read directly in JS without `getComputedStyle`. Use the hex values from the design system (verified against globals.css): text-secondary `#a1a1a1`, bg-border `#222222`, accent `#6366f1`.

### Pattern 4: completedRef Guard for Strict Mode Double-Fire

**What:** Wrap `handleMCQSessionComplete()` in a `useRef(false)` guard inside `MCQResults.tsx`.

**When to use:** Always in the results component — established pattern from `DrillResults.tsx`.

```typescript
// Source: components/drill/DrillResults.tsx (established project pattern)
const completedRef = useRef(false)
useEffect(() => {
  if (!completedRef.current) {
    completedRef.current = true
    handleMCQSessionComplete(session, subject)
  }
}, []) // eslint-disable-line react-hooks/exhaustive-deps
```

### Pattern 5: MCQ Session State Type

**What:** Parallel to `SessionState` in `drillSession.ts` but typed for MCQs.

```typescript
// To create in utils/mcqSession.ts
export interface MCQAnswer {
  selectedChoiceId: string  // canonical id from JSON ('A'|'B'|'C'|'D')
  isCorrect: boolean
}

export interface MCQSessionState {
  questions: MCQ[]
  answers: Record<string, MCQAnswer>  // keyed by question id
  isRetry: boolean
  unitSlug: string | 'all'
  retryQuestionIds?: string[]         // for retry sessions — subset of missed question ids
}

export type MCQView = 'unit-select' | 'session' | 'results'
```

### Anti-Patterns to Avoid

- **Comparing display labels to determine correctness:** After scrambling, the visual label (A/B/C/D) is positional and meaningless for correctness. Always compare the choice's original `id` field or `is_correct` boolean.
- **Scrambling choices on every render:** Scramble once on mount with `useState(() => scramble(choices))` — rescrambling on each render causes visual flicker and breaks the answer lock (D-14).
- **Registering Chart.js components inside a React component:** ChartJS.register() must be at module level to avoid repeated registrations on re-renders.
- **Using Chart.js default colors:** Default chart colors are light-scheme. Always apply the dark theme override before rendering any chart from JSON.
- **Reading CSS custom properties via `var(--name)` in JS:** This does not work in inline Chart.js config. Use the literal hex values from the design system.
- **Importing `lib/supabase.ts` in client components:** Analytics goes through `utils/analytics.ts → logEvent() → /api/log-event` only.
- **Hardcoding hex values in component files:** Use `var(--css-token)` in inline styles. The only exception is Chart.js config which requires resolved hex values.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fisher-Yates shuffle | Custom shuffle | `scramble()` from `utils/scramble.ts` | Already tested; mutates a copy (immutable); project standard |
| Math formula rendering | Plain text or custom parser | `KatexRenderer.tsx` + KaTeX | Critical Rule #1; handles display/inline modes; dark theme override in globals.css |
| Chart rendering | Custom SVG charts | `react-chartjs-2` with Chart.js | Already installed; handles canvas lifecycle; supports all chart types needed |
| localStorage reads/writes | Raw `window.localStorage` | `lsGet`/`lsSet`/`LS_KEYS` from `utils/localStorage.ts` | SSR guard, error handling, consistent key naming — all built in |
| Analytics | Direct Supabase calls in client | `logEvent()` from `utils/analytics.ts` | Fire-and-forget, never blocks UI, consistent pattern |
| Score ring | Custom chart | `.score-ring` / `.score-ring-inner` CSS in globals.css + `--score-deg` CSS var | Already defined and used in DrillResults — reuse directly |
| Inline math parsing | Custom regex parser | `parseInlineMath()` pattern from DrillCard | Already proven pattern in codebase — replicate for stimulus text and choice text |

**Key insight:** Every non-trivial utility this phase needs already exists in the codebase. The only new logic is the MCQ-specific session state machine (`mcqSession.ts`) and the stimulus renderer.

---

## Common Pitfalls

### Pitfall 1: Choice Scramble Identity Confusion
**What goes wrong:** After scrambling, code compares the visual label ("A", "B", "C", "D") shown to the user against the canonical `id` from JSON. This fails because the display label is assigned positionally after shuffle.
**Why it happens:** The schema uses `id: 'A'|'B'|'C'|'D'` as both the canonical identifier and the intended display label. After scrambling, the display position no longer matches the JSON id.
**How to avoid:** Track `selectedChoiceId` using the original `id` field from the JSON choice object (or the `is_correct` boolean directly). The display label is a render-time positional assignment, not an identity.
**Warning signs:** Test shows correct answer is always the same visual position (A, B, C, or D) across renders — means scramble ran but correctness check used positional index.

### Pitfall 2: Chart.js Missing Component Registration
**What goes wrong:** `react-chartjs-2` renders a blank canvas or throws "category is not a registered scale" at runtime.
**Why it happens:** Chart.js 4.x is tree-shakeable — no components are registered by default. `react-chartjs-2` 5.x requires the caller to register every component (scales, elements, plugins) before use.
**How to avoid:** Call `ChartJS.register(...)` at module level in `StimulusRenderer.tsx` with all required components. A safe default: register `CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend`.
**Warning signs:** Blank canvas rendered; console error mentioning "not a registered scale" or "not a registered controller".

### Pitfall 3: Chart.js Default Light Colors on Dark Background
**What goes wrong:** Chart grid lines, tick labels, and legend text render as dark-on-dark (invisible) because Chart.js defaults to dark text.
**Why it happens:** Chart configs stored in JSON use Chart.js defaults. No dark-theme override applied.
**How to avoid:** Apply `applyDarkTheme()` to the ChartConfiguration object in `StimulusRenderer.tsx` before passing to the chart component. Override `ticks.color`, `grid.color`, and `legend.labels.color`.
**Warning signs:** Chart renders but axes and labels are invisible or barely visible.

### Pitfall 4: Missing-File 404 Crashing the UnitSelector
**What goes wrong:** `fetch()` throws or rejects when a content JSON file doesn't exist (content phases 6–12 are not yet complete). The entire UnitSelector fails to render.
**Why it happens:** Default `fetch()` behavior — a 404 response is not automatically an error, but the code may `throw` if it calls `.json()` on an HTML 404 page body.
**How to avoid:** Use the `Promise.allSettled` pattern from `drill/UnitSelector.tsx`: check `res.ok` before calling `.json()`. Non-ok responses return `null` cards, rendering the unit as "Coming soon". This is the established project pattern.
**Warning signs:** UnitSelector blank or error boundary triggered; console shows JSON parse errors from HTML error pages.

### Pitfall 5: Double-Fire of handleMCQSessionComplete in React Strict Mode
**What goes wrong:** `mcqAccuracy` is written twice to localStorage; `totalQuestions` incremented by double the actual count; analytics fires twice.
**Why it happens:** React Strict Mode in development mounts effects twice. `useEffect` in MCQResults fires twice on initial mount.
**How to avoid:** Use `completedRef` guard pattern from `DrillResults.tsx` — `completedRef.current = true` on first fire, guard with `if (!completedRef.current)`.
**Warning signs:** localStorage values double what's expected after one session; two analytics events for one session (visible in Supabase).

### Pitfall 6: KaTeX Rendering Inside Chart.js Stimulus
**What goes wrong:** Stimulus type `chart` also contains a `question` field with `$...$` math tokens. Developer assumes chart + math = KaTeX inside the chart canvas, which is impossible.
**Why it happens:** Conflation of the stimulus (the chart canvas) and the question text (a separate DOM node). KaTeX only applies to the question text and choice text, never inside the Chart.js canvas.
**How to avoid:** `StimulusRenderer` only renders the chart canvas. KaTeX parsing (`parseInlineMath()`) is applied to `question` and `choice.text` fields in `MCQCard`, regardless of stimulus type.

---

## Code Examples

Verified patterns from codebase inspection:

### parseInlineMath (replicate from DrillCard.tsx)
```typescript
// Source: components/drill/DrillCard.tsx — replicate in MCQCard.tsx
function parseInlineMath(text: string): React.ReactNode[] {
  const regex = /\$([^$]+)\$/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }
    nodes.push(<KatexRenderer key={`math-${match.index}`} formula={match[1]} displayMode={false} />)
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }
  return nodes
}
```

### Score Ring (reuse existing CSS — no new CSS needed)
```typescript
// Source: components/drill/DrillResults.tsx — identical pattern for MCQResults
const scoreDeg = Math.min(Math.max(pct * 3.6, 0), 360)
// ...
<div className="score-ring" style={{ '--score-deg': scoreDeg } as React.CSSProperties}>
  <div className="score-ring-inner">
    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pct}%</span>
    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>score</span>
  </div>
</div>
```

### handleMCQSessionComplete (new — utils/mcqSession.ts)
```typescript
// Source: mirrors drillSession.ts handleSessionComplete(); data flow per D-24/D-25/D-26
export function handleMCQSessionComplete(session: MCQSessionState, subject: string): void {
  const correctCount = Object.values(session.answers).filter(a => a.isCorrect).length
  const totalQuestions = session.questions.length

  // Always increment total questions
  const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
  lsSet(LS_KEYS.totalQuestions, prevTotal + totalQuestions)

  // Only write mcqAccuracy for non-retry, non-Study-All sessions
  if (!session.isRetry && session.unitSlug !== 'all') {
    const mcqAccuracy = correctCount / totalQuestions
    const existing = lsGet(LS_KEYS.mastery(subject, session.unitSlug), {
      drillAccuracy: 0,
      mcqAccuracy: 0,
      totalAttempts: 0,
    })
    lsSet(LS_KEYS.mastery(subject, session.unitSlug), {
      ...existing,
      mcqAccuracy,
      totalAttempts: existing.totalAttempts + totalQuestions,
    })
  }

  // Fire analytics (always, never await)
  logEvent({
    event_type: 'mcq_completed',
    subject,
    unit: session.unitSlug,
    metadata: {
      accuracy: correctCount / totalQuestions,
      question_count: totalQuestions,
      is_retry: session.isRetry,
    },
  })
}
```

### MCQ UnitSelector data loading (mirrors drill UnitSelector)
```typescript
// Source: components/drill/UnitSelector.tsx — adapt for MCQ
// Key difference: fetch path is /data/${subject}/mcq/unit-${unit.number}.json
// Key difference: loaded data is MCQ[] not DrillCard[]
const fetches = subjectInfo.units.map(async (unit) => {
  const res = await fetch(`/data/${subject}/mcq/unit-${unit.number}.json`)
  if (res.ok) {
    const data = await res.json()
    return { number: unit.number, questions: data as MCQ[] }
  }
  return { number: unit.number, questions: null }
})
Promise.allSettled(fetches).then(/* same pattern as drill */)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct Chart.js canvas manipulation | react-chartjs-2 declarative wrapper | Chart.js 4.x + react-chartjs-2 5.x | Components must be registered; dark theme override required |
| chart.js global defaults for theming | Per-chart options override | Chart.js 4.x | Must inject dark colors into each ChartConfiguration |
| Next.js params as sync object | params as `Promise<{...}>` | Next.js 15+ | Must use `use(params)` from React in client components — already established in drills/page.tsx |

**Deprecated/outdated:**
- `Chart.defaults.color`: Setting global Chart.js defaults affects all charts app-wide. Instead apply per-chart options in `applyDarkTheme()`.
- `chartjs-plugin-annotation` for text overlays: Not needed for AP exam stimuli — use HTML labels instead.

---

## Open Questions

1. **Auto-submit vs. explicit Submit button for answer selection (D-13)**
   - What we know: CONTEXT.md marks this as Claude's discretion
   - What's unclear: Which provides better exam prep UX — auto-submit (faster) or explicit submit (reduces accidental submissions, more exam-authentic)
   - Recommendation: Use explicit two-step: clicking a choice selects it (highlighted), then a "Submit Answer" button confirms. This matches College Board exam behavior and prevents tap-to-misclick on mobile. Mirrors the drill's "Check Answer" pattern.

2. **Whether to reuse `components/drill/UnitSelector.tsx` or create MCQ-specific variant**
   - What we know: Drill UnitSelector is typed to `DrillCard[]` and `SessionState`; MCQ needs `MCQ[]` and `MCQSessionState`
   - What's unclear: How much of the visual/logic code is actually reusable
   - Recommendation: Create `components/mcq/UnitSelector.tsx` as a new file. Copy the structure from the drill version and adapt types. The mastery bar in the MCQ UnitSelector should show `mcqAccuracy` (not `drillAccuracy`). Do not attempt to generalize the drill UnitSelector — it adds complexity for marginal gain.

3. **Stimulus block scrolling for long text passages**
   - What we know: AP World History and AP Government questions frequently use 2–4 paragraph primary source passages
   - What's unclear: Whether a fixed max-height with overflow-y: auto is better than full-height rendering
   - Recommendation: Cap at `max-height: 240px` with `overflow-y: auto` on mobile, `max-height: 320px` on desktop. Styled scrollbar matches project globals.css scrollbar styles. This keeps the question and choices visible without excessive scrolling.

---

## Environment Availability

Step 2.6: SKIPPED — no external dependencies. All required libraries (Chart.js, KaTeX, react-chartjs-2) are already installed per `package.json`. No CLI tools, databases, or external services need to be provisioned for this phase. Analytics uses the existing `/api/log-event` Route Handler.

---

## Validation Architecture

`workflow.nyquist_validation` is not set in `.planning/config.json` — treating as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + ts-jest 29.4.6 |
| Config file | `jest.config.ts` (inferred from devDependencies) |
| Quick run command | `npm test -- --testPathPattern=mcqSession` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MCQ-01 | Unit selector loads MCQ files and renders unit grid | smoke (manual) | screenshot loop | ❌ Wave 0 |
| MCQ-02 | Stimulus types render correctly (all 4 types) | smoke (manual) | screenshot loop | ❌ Wave 0 |
| MCQ-03 | Choices scrambled at render; correct appears in all positions | unit | `npm test -- --testPathPattern=mcqSession` | ❌ Wave 0 |
| MCQ-04 | Submit triggers feedback reveal for all 4 choices | smoke (manual) | screenshot loop | ❌ Wave 0 |
| MCQ-05 | All 4 per-choice explanations shown post-submit | smoke (manual) | screenshot loop | ❌ Wave 0 |
| MCQ-06 | Results screen shows score ring and missed list | smoke (manual) | screenshot loop | ❌ Wave 0 |
| MCQ-07 | mcqAccuracy written correctly; retry/Study All do NOT write | unit | `npm test -- --testPathPattern=mcqSession` | ❌ Wave 0 |
| MCQ-08 | logEvent fires with correct payload, never throws | unit | `npm test -- --testPathPattern=mcqSession` | ❌ Wave 0 |

**Note on MCQ-03 scramble verification:** CLAUDE.md Critical Rule #9 requires answer scrambling verified across 20+ renders with no positional bias. The unit test for this must run `scramble(choices)` 100 times and assert each of the 4 positions receives the correct answer with roughly equal frequency (> 0 each).

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=mcqSession`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `utils/__tests__/mcqSession.test.ts` — covers MCQ-03 (scramble positional bias), MCQ-07 (localStorage writes), MCQ-08 (logEvent payload)
- [ ] No framework changes needed — Jest already configured

---

## Project Constraints (from CLAUDE.md)

All downstream agents MUST comply with these directives before marking any task complete:

| Constraint | Source | Applies To |
|------------|--------|------------|
| KaTeX always — never plain text for math | Critical Rule #1 | `StimulusRenderer` text type, `MCQCard` question + choices |
| No emojis as icons — Lucide React SVG only | Anti-Pattern | All new components |
| No hardcoded hex values in component files | Coding Convention | All inline styles (exception: Chart.js config uses resolved hex from design system) |
| Scramble at render time only — never in JSON | Critical Rule #4, #5 | `MCQCard` choice scrambling; `mcqSession.ts` question scrambling |
| Fire-and-forget analytics — never block UI | Critical Rule #6 | `handleMCQSessionComplete()` |
| Screenshot loop mandatory before marking UI complete | Workflow Enforcement | Every component delivery |
| Planner → Coder → Reviewer → Tester pipeline | Workflow Enforcement | Every implementation task |
| `lsGet`/`lsSet` only — never raw localStorage | Coding Convention | `mcqSession.ts`, `MCQResults.tsx` |
| Every MCQ must have per-choice explanations | Critical Rule #8 | Enforced by mcq.schema.json; render all 4 post-submit |
| Scramble verification across 20+ renders | Critical Rule #9 | Unit test in Wave 0 |
| Supabase calls via `/api/log-event` only | Supabase Pattern | `handleMCQSessionComplete()` |
| `use(params)` for Next.js 15+ client page params | Decisions Log | `app/[subject]/practice/page.tsx` |

---

## Sources

### Primary (HIGH confidence)
- `components/drill/DrillSession.tsx` — Established session header + progress pattern; direct model for MCQSession
- `components/drill/DrillCard.tsx` — `parseInlineMath()`, `CardState`, feedback panel styling; direct model for MCQCard
- `components/drill/DrillResults.tsx` — completedRef guard, score ring usage, CTA buttons; direct model for MCQResults
- `components/drill/UnitSelector.tsx` — `Promise.allSettled` fetch pattern, unit grid, Study All; direct model for MCQ UnitSelector
- `app/[subject]/drills/page.tsx` — Orchestrator state machine pattern; mirrors directly
- `utils/drillSession.ts` — `handleSessionComplete()` logic for mastery writes; MCQ version follows same branching
- `utils/scramble.ts` — Fisher-Yates; call on choices array in MCQCard
- `utils/localStorage.ts` — `lsGet`, `lsSet`, `LS_KEYS.mastery()` — all mastery writes use these
- `utils/analytics.ts` — `logEvent()` fire-and-forget pattern
- `components/KatexRenderer.tsx` — `displayMode` prop, `throwOnError: false` behavior
- `data/schemas/mcq.schema.json` — Canonical data shape; choice `id` field semantics
- `package.json` — Verified versions: chart.js 4.5.1, react-chartjs-2 5.3.1, katex 0.16.40
- `app/globals.css` — `.score-ring`/`.score-ring-inner` CSS; CSS custom property hex values
- `design-system/ascendly/MASTER.md` — Color tokens, spacing system, component specs, anti-patterns
- `CLAUDE.md` — All critical rules and workflow enforcement directives

### Secondary (MEDIUM confidence)
- Chart.js 4.x documentation: component registration requirement for tree-shaking; dark theme via options (not global defaults) — consistent with multiple sources
- react-chartjs-2 5.x: wraps Chart.js 4; register before use requirement — consistent with package version in package.json

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json with exact versions
- Architecture: HIGH — locked in CONTEXT.md; confirmed against existing drill implementation
- Pitfalls: HIGH — derived from codebase inspection + direct parallels to established patterns
- Chart.js dark theme: MEDIUM — derived from Chart.js 4 documentation knowledge + design system hex values; dark theme injection approach is standard but not verified against a running instance

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable stack — all versions pinned)
