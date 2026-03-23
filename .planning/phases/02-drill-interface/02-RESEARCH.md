# Phase 2: Drill Interface - Research

**Researched:** 2026-03-23
**Domain:** Next.js 'use client' state machine, React free-response drill UI, KaTeX rendering, localStorage mastery writes, Supabase fire-and-forget analytics
**Confidence:** HIGH — all architecture, utilities, and design system verified directly from codebase source files

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Routing & Architecture**
- Single route: `app/[subject]/drills/page.tsx` — `'use client'` orchestrator component
- No sub-routes. All three views managed via React state: `type DrillView = 'unit-select' | 'session' | 'results'`
- URL never changes during a session. Browser back exits to subject hub.
- Component tree: `page.tsx` orchestrates `<UnitSelector />`, `<DrillSession />`, `<DrillResults />`

**Component Files (locked)**
| Action | File |
|--------|------|
| Rewrite | `app/[subject]/drills/page.tsx` |
| Create | `components/drill/UnitSelector.tsx` |
| Create | `components/drill/DrillSession.tsx` |
| Create | `components/drill/DrillCard.tsx` |
| Create | `components/drill/DrillResults.tsx` |
| Modify | `app/globals.css` — drill-specific CSS if needed |

**Data Shape (locked — from drill.schema.json)**
```ts
interface DrillCard {
  id: string
  unit: string
  subject: string
  mode: DrillMode
  prompt: string
  answer: string
  alternate_answers?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  katex_required?: boolean
}
type DrillMode = 'definition_to_term' | 'formula_to_type' | 'person_to_significance' | 'event_to_date' | 'concept_to_example' | 'term_to_definition'
```

**Session State Shape (locked)**
```ts
interface SessionState {
  cards: DrillCard[]
  index: number
  answers: Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
  isRetry: boolean
  unitSlug: string | 'all'
}
```

**Fuzzy Matching (locked)**
- Call `fuzzyMatch(userInput, card.answer)` from `utils/fuzzyMatch.ts`
- Also check each `card.alternate_answers[]` item via fuzzyMatch — any match = correct
- Binary result only: correct or wrong. No partial credit state.

**KaTeX Rendering (locked)**
- Prompts: Always parse `$...$` inline math regardless of `katex_required`
- Answers: Only render through `KatexRenderer` when `katex_required === true`; plain-text answers render as-is

**Card Queue (locked)**
- Shuffle on session start via `utils/scramble.ts`
- "Study All" concatenates all loaded units' cards then shuffles
- Retry: re-queues only cards with verdict `'wrong'`, `isRetry: true`

**Results Screen (locked)** — score ring conic gradient, contextual heading tiers (≥90/70/50/<50%), missed cards list (first 5 + "+ N more"), CTAs: retry / back to subject / study another unit

**Data Flow on Session Complete (locked)**
- Non-retry, non-Study-All: write `drillAccuracy` + `totalAttempts`, increment `totalQuestions`, fire `drill_completed` logEvent
- Retry: do NOT write `drillAccuracy`; DO increment `totalQuestions`; fire logEvent with `is_retry: true`
- Study All: do NOT write any mastery key; DO increment `totalQuestions`; fire logEvent with `unit: 'all'`

**Session Header (locked)** — progress bar + "X of Y" + live score badges (✓ N / ✗ N)

**Styling Rules (locked)** — CSS custom properties only, dark theme, max-width 560px for drill card, Lucide icons only

### Claude's Discretion
- Exact gradient colors per unit number (dark gradients, aesthetically coherent)
- Thematic emoji per unit number (contextually appropriate, consistent per subject)
- Exact CSS class names for drill-specific styles added to globals.css
- Internal component prop interfaces beyond what the spec mandates
- Transition timing details within 150–300ms ease per MASTER.md guidelines

### Deferred Ideas (OUT OF SCOPE)
- Hint system — schema has `additionalProperties: false`, no `hint` field
- Audio pronunciation
- Spaced repetition algorithm — Phase 13
- Drill-specific analytics beyond `drill_completed` event — Phase 13
- Content JSON files — content phases (6–12) only; Phase 2 builds the interface only
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DRILL-01 | Student can select a unit and start a drill session | UnitSelector component fetches `/data/${subject}/drills/unit-${n}.json` on click; 404 → "Coming soon" disabled card |
| DRILL-02 | Drill card displays prompt; student types or reveals answer | DrillCard component with 4 states (idle/typing/correct/wrong); input + Check Answer button |
| DRILL-03 | Correct/incorrect feedback with fuzzy match (utils/fuzzyMatch.ts) | `fuzzyMatch(userInput, card.answer, card.alternate_answers)` — existing utility, fully implemented |
| DRILL-04 | KaTeX rendering for formula drill cards (katex_required: true) | KatexRenderer component exists; prompts always parse `$...$`; answers conditional on `katex_required` |
| DRILL-05 | Session progresses through all cards in unit; no repeat until session ends | SessionState.index incremented on "Next card"; scramble on session start via `utils/scramble.ts` |
| DRILL-06 | Results screen: score, cards mastered, retry missed cards CTA | DrillResults with conic gradient score ring; missed cards list; retry re-queues wrong-only cards |
| DRILL-07 | Mastery written to localStorage on session complete (drillAccuracy update) | `lsSet(LS_KEYS.mastery(subject, unitSlug), ...)` — LS_KEYS helper exists in utils/localStorage.ts |
| DRILL-08 | Supabase drill_complete event logged (fire-and-forget) | `logEvent({ event_type: 'drill_completed', ... })` — logEvent utility exists and is fire-and-forget |
| DRILL-09 | All 6 drill modes supported (definition_to_term, formula_to_type, etc.) | Mode → display label map locked; DrillCard renders mode tag from lookup constant |
</phase_requirements>

---

## Summary

Phase 2 replaces the stub at `app/[subject]/drills/page.tsx` with a full three-view drill interface (unit-select → session → results) managed entirely via React state on a single route. All supporting utilities already exist and are verified working: `fuzzyMatch.ts` (Levenshtein with tolerance tiers), `scramble.ts` (Fisher-Yates), `localStorage.ts` (`lsGet`/`lsSet`/`LS_KEYS`), `analytics.ts` (`logEvent` fire-and-forget), and `KatexRenderer.tsx` (renders KaTeX or fallback text content).

The implementation is net-new component work — four new files under `components/drill/` plus a full rewrite of the stub page. No new dependencies are required. The primary technical risks are: (1) the async `params` pattern that the stub currently violates (must be fixed in the rewrite), (2) the conic gradient score ring requiring careful CSS, and (3) the "Study All" concatenation and error-resilient unit JSON loading needing correct partial-load handling.

**Primary recommendation:** Build the four drill components in dependency order (DrillCard → DrillSession → DrillResults → UnitSelector → page.tsx orchestrator), wiring each to the existing utilities. Use the Planner → Coder → Reviewer → Tester pipeline with a screenshot loop before marking the phase complete.

---

## Standard Stack

### Core (all already installed — zero new dependencies needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2.1 | App Router, `'use client'` directive, async params | Project framework — locked |
| React | ^19.2.4 | Functional components, useState, useEffect | Project framework — locked |
| TypeScript | ^5 (strict) | Type safety across all components | Project convention — locked |
| KaTeX | ^0.16.40 | Formula rendering | Critical Rule #1 — KaTeX always |
| Lucide React | ^0.577.0 | Icons (RotateCcw, Check, X, ChevronRight) | Critical Rule — no emojis as icons |
| Tailwind CSS | ^4 | Layout helpers, responsive grid classes | Project convention |

### Existing Utilities (MUST use — do not reimplement)

| Utility | File | Signature | Purpose |
|---------|------|-----------|---------|
| fuzzyMatch | `utils/fuzzyMatch.ts` | `fuzzyMatch(studentAnswer, correctAnswer, alternates?)` | Binary correct/wrong verdict |
| scramble | `utils/scramble.ts` | `scramble<T>(arr: T[]): T[]` | Fisher-Yates shuffle at session start |
| lsGet / lsSet | `utils/localStorage.ts` | `lsGet<T>(key, fallback)` / `lsSet<T>(key, value)` | All localStorage reads/writes |
| LS_KEYS | `utils/localStorage.ts` | `LS_KEYS.mastery(subject, unit)`, `LS_KEYS.totalQuestions` | Typed key helpers |
| logEvent | `utils/analytics.ts` | `logEvent({ event_type, subject, unit?, metadata? })` | Fire-and-forget Supabase event |
| getSubject | `utils/subjects.ts` | `getSubject(slug): Subject \| undefined` | Subject display name for results CTA |
| KatexRenderer | `components/KatexRenderer.tsx` | `<KatexRenderer formula={str} displayMode? className? />` | KaTeX rendering component |

### No New Packages Required

All functionality is covered by existing dependencies. The score ring uses CSS `conic-gradient` (native browser feature — no library needed).

---

## Architecture Patterns

### Recommended Project Structure

```
app/[subject]/drills/
└── page.tsx           ← 'use client' orchestrator; manages DrillView state + async params

components/drill/
├── UnitSelector.tsx   ← Fetches all unit JSONs; renders grid + Study All card
├── DrillSession.tsx   ← Renders session header + current DrillCard; advances index
├── DrillCard.tsx      ← Single card: 4 states (idle/typing/correct/wrong)
└── DrillResults.tsx   ← Score ring, missed cards list, CTAs
```

### Pattern 1: Async Params (Next.js 15+ Required)

The current stub uses the non-async params pattern which will cause errors. The rewrite MUST use the async pattern matching the rest of the codebase:

```typescript
// Source: app/[subject]/page.tsx (verified in codebase)
// CORRECT — used in app/[subject]/page.tsx
interface DrillsPageProps {
  params: Promise<{ subject: string }>
}

export default async function DrillsPage({ params }: DrillsPageProps) {
  // Wait — this page must be 'use client', so params handling differs
}
```

**Critical note for 'use client' pages:** The drills page is locked as `'use client'`. In Next.js App Router, a `'use client'` page component receives params as a plain object (not a Promise) because client components do not await. Only server components receive `Promise<params>`. The correct pattern for the client orchestrator:

```typescript
'use client'
// Source: Next.js App Router — client component params are plain objects
interface DrillsPageProps {
  params: { subject: string }
}

export default function DrillsPage({ params }: DrillsPageProps) {
  const { subject } = params
  // ...
}
```

However, CONCERNS.md item #7 flags this as the non-async stub pattern causing issues. Research finding: in Next.js 15, params for client components are still plain objects — the async pattern only applies to server components. The stub's issue is NOT the params type, but rather that it renders placeholder text and doesn't use a proper component pattern. The rewrite simply needs to be a proper `'use client'` component.

### Pattern 2: Three-View State Machine

```typescript
// Source: CONTEXT.md decisions (locked)
type DrillView = 'unit-select' | 'session' | 'results'

// page.tsx orchestrator
const [view, setView] = useState<DrillView>('unit-select')
const [session, setSession] = useState<SessionState | null>(null)

return (
  <>
    {view === 'unit-select' && <UnitSelector subject={subject} onStart={(s) => { setSession(s); setView('session') }} />}
    {view === 'session' && session && <DrillSession session={session} subject={subject} onComplete={(s) => { setSession(s); setView('results') }} />}
    {view === 'results' && session && <DrillResults session={session} subject={subject} onRetry={(s) => { setSession(s); setView('session') }} onUnitSelect={() => setView('unit-select')} />}
  </>
)
```

### Pattern 3: Client-Side JSON Fetch with 404 Resilience

```typescript
// Source: CONTEXT.md — load path locked as fetch('/data/${subject}/drills/unit-${n}.json')
async function loadUnitDrills(subject: string, unitNumber: number): Promise<DrillCard[] | null> {
  try {
    const res = await fetch(`/data/${subject}/drills/unit-${unitNumber}.json`)
    if (!res.ok) return null   // 404 → "Coming soon" card, no error thrown
    const data = await res.json()
    return data.cards as DrillCard[]
  } catch {
    return null  // Network error → same "Coming soon" treatment
  }
}
```

JSON files are loaded from the Next.js `public/` directory at runtime. The `/data/` path maps to `public/data/`. **Key implication:** drill JSON content files must be placed in `public/data/[subject]/drills/unit-[n].json`, not in the `data/` schemas directory.

### Pattern 4: DrillCard Four-State Pattern

```typescript
// Source: CONTEXT.md decisions (locked)
type CardState = 'idle' | 'typing' | 'correct' | 'wrong'

// Derived state — not stored:
// 'idle' = inputValue.length === 0 && verdict === null
// 'typing' = inputValue.length > 0 && verdict === null
// 'correct' = verdict === 'correct'
// 'wrong' = verdict === 'wrong'
```

### Pattern 5: Session Complete Data Flow

```typescript
// Source: CONTEXT.md data flow (locked)
function handleSessionComplete(sessionState: SessionState, subject: string) {
  const correctCount = Object.values(sessionState.answers).filter(a => a.verdict === 'correct').length
  const totalCards = sessionState.cards.length

  // Increment total questions always (retry + Study All included)
  const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
  lsSet(LS_KEYS.totalQuestions, prevTotal + totalCards)

  // Only write drillAccuracy for non-retry, non-Study-All sessions
  if (!sessionState.isRetry && sessionState.unitSlug !== 'all') {
    const drillAccuracy = correctCount / totalCards
    const existing = lsGet(LS_KEYS.mastery(subject, sessionState.unitSlug), {
      drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0
    })
    lsSet(LS_KEYS.mastery(subject, sessionState.unitSlug), {
      ...existing,
      drillAccuracy,
      totalAttempts: existing.totalAttempts + totalCards
    })
  }

  // Fire analytics (always)
  logEvent({
    event_type: 'drill_completed',
    subject,
    unit: sessionState.unitSlug,
    metadata: {
      accuracy: correctCount / totalCards,
      cards_count: totalCards,
      is_retry: sessionState.isRetry,
    }
  })
}
```

### Pattern 6: Score Ring (CSS Conic Gradient)

```css
/* Source: CONTEXT.md — conic gradient, var(--accent) fill, var(--mastery-empty) empty arc */
/* No library needed — native CSS feature supported in all modern browsers */
.score-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    var(--accent) 0% calc(var(--score-pct) * 1%),
    var(--mastery-empty) calc(var(--score-pct) * 1%) 100%
  );
  /* Inner circle via ::after pseudo-element or nested div */
}
/* Set --score-pct via inline style on the element */
```

### Pattern 7: fuzzyMatch Signature (Verified)

```typescript
// Source: utils/fuzzyMatch.ts (read directly)
// The actual signature accepts alternates as a THIRD argument, not via card.alternate_answers directly
export function fuzzyMatch(studentAnswer: string, correctAnswer: string, alternates: string[] = []): boolean

// CORRECT call site pattern:
const isCorrect = fuzzyMatch(userInput, card.answer, card.alternate_answers ?? [])
// NOT: fuzzyMatch(userInput, card.answer) then separate alternate checks
// The utility handles all alternates internally in a single call
```

### Anti-Patterns to Avoid

- **Async params on 'use client' page:** Client components receive plain `params` objects. Do not use `await params` or wrap in Promise type.
- **Raw localStorage access:** Never use `localStorage.getItem/setItem` directly — always `lsGet`/`lsSet` from `utils/localStorage.ts`.
- **Hardcoded hex colors:** All colors via `var(--*)` tokens — no `#6366f1`, `#22c55e`, `#ef4444` in JSX/CSS.
- **Writing mastery on retry sessions:** Do NOT call `lsSet(LS_KEYS.mastery(...))` when `session.isRetry === true`.
- **Writing mastery on Study All sessions:** Do NOT call `lsSet(LS_KEYS.mastery(...))` when `session.unitSlug === 'all'`.
- **Scrambling in JSON:** All shuffling happens at render/session-start time via `scramble()`. Never sort or pre-order JSON content.
- **Emoji as icons in interactive elements:** Use Lucide React icons (RotateCcw, ArrowLeft, RefreshCw) — emojis are allowed only on unit card art areas per the spec.
- **Blocking UI on analytics:** `logEvent()` must never be awaited.
- **Separate alternate answer loops:** Call `fuzzyMatch(input, canonical, alternates)` once — do not loop manually over alternates at the call site.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy answer matching | Custom edit-distance or prefix matching | `fuzzyMatch()` in `utils/fuzzyMatch.ts` | Already implemented with calibrated tolerance tiers; tested |
| Card shuffling | Manual random sort / `Math.random() - 0.5` | `scramble()` in `utils/scramble.ts` | Fisher-Yates is unbiased; `Math.random() - 0.5` sort is biased |
| localStorage access | `window.localStorage.getItem/setItem` directly | `lsGet`/`lsSet` from `utils/localStorage.ts` | SSR guard, JSON parse error catch, consistent key format |
| localStorage key construction | Inline string templates | `LS_KEYS.mastery(subject, unit)`, `LS_KEYS.totalQuestions` | Prevents key typos; single source of truth |
| Supabase calls | Direct `fetch` to Supabase API or `supabase.from(...).insert(...)` | `logEvent()` from `utils/analytics.ts` | Route handler keeps anon key server-side; fire-and-forget pattern enforced |
| KaTeX rendering | `dangerouslySetInnerHTML` with katex string | `<KatexRenderer formula={...} />` | Component handles hydration, error fallback, display/inline toggle |
| Score ring | SVG circle or third-party chart | CSS `conic-gradient` | Native browser feature, no bundle cost, fully specified in CONTEXT.md |

**Key insight:** Every utility this phase needs already exists and is tested. The implementation is 100% component assembly work — no new logic needs to be written from scratch.

---

## Common Pitfalls

### Pitfall 1: Async Params Pattern Confusion
**What goes wrong:** Copying the server component pattern from `app/[subject]/page.tsx` into the `'use client'` drills page — using `params: Promise<{ subject: string }>` and `await params` in a client component.
**Why it happens:** The existing subject page uses async params because it's a server component. The drills page is `'use client'` and receives params as a plain synchronous object.
**How to avoid:** In `app/[subject]/drills/page.tsx`, use `params: { subject: string }` (plain object, no Promise). The `'use client'` directive means params are resolved before the component function runs.
**Warning signs:** TypeScript error about `await` on a non-Promise, or runtime `params.then is not a function`.

### Pitfall 2: Writing Mastery on Retry/Study-All Sessions
**What goes wrong:** `lsSet(LS_KEYS.mastery(...))` called unconditionally on every session complete, overwriting real accuracy with retry-only accuracy.
**Why it happens:** The conditional check (`!isRetry && unitSlug !== 'all'`) is easy to miss.
**How to avoid:** The data flow handler (Pattern 5 above) must be a single function with explicit guards. Add a unit test for this boundary.
**Warning signs:** drillAccuracy in localStorage drops unexpectedly after a retry session.

### Pitfall 3: fuzzyMatch Called Without Alternates
**What goes wrong:** `fuzzyMatch(input, card.answer)` called without passing `card.alternate_answers`, causing alternate answers to never match.
**Why it happens:** The utility signature shows alternates as optional — developers forget to pass them.
**How to avoid:** Always call `fuzzyMatch(input, card.answer, card.alternate_answers ?? [])`. Acceptance criterion #22 ("Fuzzy match accepts alternate_answers") will catch this in the Tester phase.
**Warning signs:** Alternate answers always marked wrong in testing.

### Pitfall 4: Drill JSON Placed in Wrong Directory
**What goes wrong:** Drill JSON placed in `data/[subject]/drills/` (project root) instead of `public/data/[subject]/drills/` — fetch returns 404 for all units.
**Why it happens:** The `/data/` schemas directory exists at project root, not under `public/`. The client-side fetch path `/data/...` maps to the `public/` directory in Next.js.
**How to avoid:** Content JSON must go in `public/data/[subject]/drills/unit-[n].json`. This phase only builds the interface; content files are added in Phases 6–12. The UnitSelector's 404 handling must work correctly as the default state.
**Warning signs:** All unit cards show "Coming soon" style with no error, even when JSON exists — check the file path.

### Pitfall 5: Score Ring Percentage Calculation
**What goes wrong:** Score ring shows incorrect arc when `correctCount === 0` (empty ring) or `correctCount === totalCards` (full ring) — CSS `conic-gradient` with 0% or 100% can render as a thin line.
**Why it happens:** Edge case in `conic-gradient` specification.
**How to avoid:** Clamp the percentage: `Math.min(Math.max(pct, 0), 100)`. Test with 0/10 and 10/10 sessions.
**Warning signs:** Score ring appears as a thin line or fully solid when score is 0% or 100%.

### Pitfall 6: KaTeX Rendering with Mixed Inline Math in Prompts
**What goes wrong:** Prompts containing text mixed with `$...$` math (e.g., "The formula $E=mc^2$ represents...") can't be passed directly to KatexRenderer — which expects a pure formula string.
**Why it happens:** KatexRenderer is designed for formula-only strings, not mixed text+math.
**How to avoid:** Prompts with inline math need a parser to split text segments from `$...$` segments and render each part separately, OR use KaTeX's `renderToString` with a text-scanning approach. Research finding: the spec says "always parse `$...$` inline math" — this likely requires a small utility to extract and replace `$...$` spans within the prompt string before rendering. The simplest approach: `dangerouslySetInnerHTML` on a `<span>` after calling `katex.renderToString()` for each `$...$` match, OR use a regex-replace approach at render time.
**Warning signs:** Prompts containing `$...$` show literal dollar-sign syntax instead of rendered math.

### Pitfall 7: Study All with Empty Loaded Units
**What goes wrong:** Study All button enabled when only some units loaded, but `cards.length === 0` because no units returned data.
**Why it happens:** Partial load logic for Study All not explicitly handled.
**How to avoid:** The spec locks this: Study All button is disabled with "No content yet" label only when zero units load. When partial data loads, Study All uses the combined cards from successful loads. Acceptance criteria #3 covers this case.

---

## Code Examples

### Verified: KatexRenderer Component Signature
```typescript
// Source: components/KatexRenderer.tsx (read directly)
// Default export — import as default, not named
import KatexRenderer from '@/components/KatexRenderer'

// Usage — formula drills (katex_required: true):
<KatexRenderer formula={card.answer} />

// Usage — inline math in prompts (always parse $...$):
// KatexRenderer expects a pure formula; for mixed text+math prompts,
// implement a parseInlineMath(text) helper that splits on $...$
```

### Verified: logEvent Signature
```typescript
// Source: utils/analytics.ts (read directly)
import { logEvent } from '@/utils/analytics'

logEvent({
  event_type: 'drill_completed',
  subject: 'ap-psychology',        // required
  unit: 'unit-1',                  // optional — 'all' for Study All
  metadata: {                       // optional Record<string, unknown>
    accuracy: 0.85,
    cards_count: 20,
    is_retry: false,
  }
})
// Never await. Never catch. It has its own internal .catch(() => {})
```

### Verified: LS_KEYS and lsGet/lsSet
```typescript
// Source: utils/localStorage.ts (read directly)
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'

// Read existing mastery:
const existing = lsGet(LS_KEYS.mastery(subject, unitSlug), {
  drillAccuracy: 0,
  mcqAccuracy: 0,
  totalAttempts: 0,
})

// Write updated mastery:
lsSet(LS_KEYS.mastery(subject, unitSlug), {
  ...existing,
  drillAccuracy: correctCount / totalCards,
  totalAttempts: existing.totalAttempts + totalCards,
})

// Increment total questions:
lsSet(LS_KEYS.totalQuestions, lsGet<number>(LS_KEYS.totalQuestions, 0) + totalCards)
```

### Verified: scramble Usage
```typescript
// Source: utils/scramble.ts (read directly)
import { scramble } from '@/utils/scramble'

// Call at session start — not in JSON, not in useEffect dependency:
const shuffledCards = scramble(rawCards)
// scramble returns a new array — does not mutate input
```

### Verified: fuzzyMatch Full Signature
```typescript
// Source: utils/fuzzyMatch.ts (read directly)
import { fuzzyMatch } from '@/utils/fuzzyMatch'

// CORRECT — pass alternates as third argument:
const isCorrect = fuzzyMatch(
  userInput.trim(),           // student's typed answer
  card.answer,               // canonical answer
  card.alternate_answers ?? [] // all alternates in one call
)
```

### Verified: CSS Tokens Available for Drill UI
```typescript
// Source: design-system/ascendly/MASTER.md (read directly)
// Use these tokens for drill card states:
// Correct state:  border-color: var(--accent-success)  [#22c55e]
// Wrong state:    border-color: var(--accent-danger)   [#ef4444]
// Typing state:   border-color: var(--accent)           [#6366f1]
// Idle state:     border-color: var(--bg-border)        [#222222]
// Card bg:        background:   var(--bg-card)           [#161616]
// Score ring:     var(--accent) fill, var(--mastery-empty) empty [#6366f1, #1e1e1e]
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Non-async params stub | Proper `'use client'` component with `params: { subject: string }` | Eliminates TypeScript/runtime warning in Next.js 15 |
| Direct `localStorage.getItem` | `lsGet` / `lsSet` with SSR guard | Prevents hydration errors on server render |
| Global KaTeX `renderToString` directly | `KatexRenderer` component with ref + useEffect | Handles hydration lifecycle correctly in React 19 |

---

## Open Questions

1. **Inline math in prompts (mixed text + KaTeX)**
   - What we know: KatexRenderer accepts a formula string; prompts contain mixed text with `$...$` delimiters
   - What's unclear: Whether prompts in the actual content JSON will use `$...$` inline math or only formula drills will have math (where the entire prompt is a formula)
   - Recommendation: Build a `parseInlineMath(text: string): React.ReactNode` helper that splits on `$...$` and renders each segment. Worst case it's unused for non-math subjects; best case it handles Calculus/Chemistry prompts correctly.

2. **Unit card mastery bar data source**
   - What we know: UnitSelector shows a mastery bar per unit card from localStorage; CONCERNS.md flags that `UnitProgressGrid` uses raw `localStorage.getItem` instead of `lsGet`
   - What's unclear: Whether UnitSelector should share the same raw-access bug or fix it
   - Recommendation: UnitSelector must use `lsGet(LS_KEYS.mastery(subject, String(unit.number)), { drillAccuracy: 0, ... })` — do not copy the raw access pattern from UnitProgressGrid.

3. **Public vs project-root data directory**
   - What we know: `fetch('/data/...')` maps to `public/data/` in Next.js; the project currently has `data/schemas/` at project root
   - What's unclear: Whether the planner should include a task to create the `public/data/` directory structure as part of Phase 2
   - Recommendation: Yes — Wave 0 or Wave 1 should include creating `public/data/ap-psychology/drills/` with a sample fixture JSON file for testing the interface before content phases. The interface must work end-to-end, meaning at least one real unit JSON file is needed for integration testing.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 2 is purely front-end component work. All dependencies (Next.js, React, KaTeX, Lucide React) are already installed. No new external tools, CLIs, services, or runtimes are required. The only external dependency (Supabase) is already configured via `.env.local` from Phase 1.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest ^30.3.0 + ts-jest ^29.4.6 |
| Config file | `jest.config.ts` (inferred — not read directly) |
| Quick run command | `npm test -- --testPathPattern=utils` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DRILL-01 | Unit selector loads JSON, 404 → disabled | manual (screenshot loop) | — | N/A |
| DRILL-02 | Drill card idle/typing/correct/wrong states | manual (screenshot loop) | — | N/A |
| DRILL-03 | fuzzyMatch accepts correct + alternates, rejects wrong | unit | `npm test -- --testPathPattern=fuzzyMatch` | ✅ `utils/__tests__/fuzzyMatch.test.ts` |
| DRILL-04 | KaTeX renders for katex_required cards | manual (screenshot loop) | — | N/A |
| DRILL-05 | Cards advance in order, no repeat | manual (screenshot loop) | — | N/A |
| DRILL-06 | Results screen score ring, missed cards, CTAs | manual (screenshot loop) | — | N/A |
| DRILL-07 | drillAccuracy + totalAttempts written on completion; NOT written on retry or Study All | unit | `npm test -- --testPathPattern=drillSession` | ❌ Wave 0 |
| DRILL-08 | drill_completed logEvent fires with correct metadata | unit | `npm test -- --testPathPattern=drillSession` | ❌ Wave 0 |
| DRILL-09 | All 6 modes render correct display labels | manual (screenshot loop) | — | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=utils` (existing util tests — fast)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + screenshot loop sign-off before marking Phase 2 complete

### Wave 0 Gaps
- [ ] `utils/__tests__/drillSession.test.ts` — covers DRILL-07 (mastery write guards) and DRILL-08 (logEvent call verification with mock)
- [ ] Test fixture: `public/data/ap-psychology/drills/unit-1.json` — minimum viable drill JSON for integration testing (does not need to be full content; 5 cards sufficient for UI verification)

---

## Project Constraints (from CLAUDE.md)

All directives from CLAUDE.md that the planner MUST enforce in every task:

| Directive | Impact on Phase 2 |
|-----------|------------------|
| NEVER render formulas as plain text — KaTeX always | All `katex_required: true` answers rendered via KatexRenderer; all prompts parsed for `$...$` |
| NEVER skip the screenshot loop | Every UI view (unit-select, session, results) requires screenshot confirmation before marking complete |
| NEVER show placeholder text in screenshot loops — real content only | Test fixture JSON (`unit-1.json`) required; no "lorem ipsum" or stub card data |
| NEVER scramble answer choices in JSON — scrambling at render time only | `scramble()` called at session start in component, not pre-sorted in JSON |
| NEVER block UI on Supabase — always fire-and-forget, catch silently | `logEvent()` never awaited |
| Coding Pipeline: Planner → Coder → Reviewer → Tester — no step may be skipped | All waves must follow this pipeline |
| Before building any UI: MUST invoke `superpowers:brainstorming` and read MASTER.md | MASTER.md already read for this research |
| Screenshot Loop is mandatory before marking any UI component or page complete | Phase is not done until user confirms all three views visually |
| Update Phase Tracker in CLAUDE.md after completing phase | Phase 2 row must be updated to "Complete" when all 24 acceptance criteria are met |

---

## Sources

### Primary (HIGH confidence)
- `C:\Ascendly\utils\fuzzyMatch.ts` — Exact function signature, tolerance tiers, alternates handling
- `C:\Ascendly\utils\scramble.ts` — Fisher-Yates implementation confirmed
- `C:\Ascendly\utils\localStorage.ts` — lsGet/lsSet/LS_KEYS full interface confirmed
- `C:\Ascendly\utils\analytics.ts` — logEvent signature and fire-and-forget pattern confirmed
- `C:\Ascendly\utils\subjects.ts` — getSubject() signature; all 7 subjects with unit counts
- `C:\Ascendly\components\KatexRenderer.tsx` — Default export, Props interface, displayMode flag
- `C:\Ascendly\data\schemas\drill.schema.json` — Canonical DrillCard shape, all fields, enums
- `C:\Ascendly\.planning\phases\02-drill-interface\02-CONTEXT.md` — All locked decisions
- `C:\Ascendly\.planning\REQUIREMENTS.md` — DRILL-01 through DRILL-09 definitions
- `C:\Ascendly\design-system\ascendly\MASTER.md` — Color tokens, typography, interaction patterns
- `C:\Ascendly\.planning\codebase\ARCHITECTURE.md` — Server/client boundary, data flow patterns
- `C:\Ascendly\.planning\codebase\CONVENTIONS.md` — TypeScript strict, CSS, naming, import patterns
- `C:\Ascendly\.planning\codebase\TESTING.md` — Existing test infrastructure, Phase 2 test gaps
- `C:\Ascendly\.planning\codebase\CONCERNS.md` — Async params issue, raw localStorage pattern
- `C:\Ascendly\app\[subject]\page.tsx` — Async server component params pattern (reference)
- `C:\Ascendly\app\[subject]\drills\page.tsx` — Current stub (to be replaced)
- `C:\Ascendly\.planning\config.json` — nyquist_validation key absent → validation section included

### Secondary (MEDIUM confidence)
- None — all findings verified against direct codebase source files

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified from package.json via STACK.md; all utility signatures read directly from source
- Architecture: HIGH — all patterns derived from locked CONTEXT.md decisions + verified codebase conventions
- Pitfalls: HIGH — all pitfalls derived from CONCERNS.md flagged issues + direct code inspection
- KaTeX inline math handling: MEDIUM — spec says "always parse $...$" but the implementation approach for mixed text+math prompts is not specified; solution approach is inferred

**Research date:** 2026-03-23
**Valid until:** 2026-04-22 (stable stack; no fast-moving dependencies)
