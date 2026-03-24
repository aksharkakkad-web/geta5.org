# Phase 3: Practice Questions Interface - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the MCQ practice interface at `app/[subject]/practice/page.tsx`. Deliver three client-side views (unit-select → session → results) managed via React state — same orchestrator pattern as Phase 2 drills. Render 4 stimulus types (text, Chart.js graph, HTML table, pseudocode). Display 4 scrambled answer choices with per-choice explanations on submit. Write mcqAccuracy to localStorage and fire analytics on session complete.

</domain>

<decisions>
## Implementation Decisions

### Routing & Architecture (carried from Phase 2)
- **D-01:** Single route: `app/[subject]/practice/page.tsx` — `'use client'` orchestrator component
- **D-02:** Three views via React state: `type MCQView = 'unit-select' | 'session' | 'results'`
- **D-03:** URL never changes during a session. Browser back exits to subject hub.
- **D-04:** Component tree: `page.tsx` orchestrates `<UnitSelector />`, `<MCQSession />`, `<MCQResults />`

### Component Files (locked)
| Action | File |
|--------|------|
| Create | `app/[subject]/practice/page.tsx` |
| Create | `components/mcq/UnitSelector.tsx` |
| Create | `components/mcq/MCQSession.tsx` |
| Create | `components/mcq/MCQCard.tsx` |
| Create | `components/mcq/MCQResults.tsx` |
| Create | `components/mcq/StimulusRenderer.tsx` |
| Modify | `app/globals.css` — MCQ-specific CSS if needed |

### Data Shape (locked — from mcq.schema.json)
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

### Stimulus Rendering (locked)
- **D-05:** Each stimulus type renders in a dedicated component above the question text
- **D-06:** `StimulusRenderer.tsx` — switch on `stimulus.type`:
  - `text`: Styled blockquote with passage text; parse `$...$` via KatexRenderer
  - `table`: HTML `<table>` with `<thead>` from `headers[]`, `<tbody>` from `rows[][]`; styled with CSS custom properties
  - `chart`: Chart.js `<canvas>` rendered via `react-chartjs-2` or direct Chart.js; dark theme colors applied to config
  - `code`: Monospaced `<pre>` block with College Board pseudocode styling (AP CSP only)
  - `none`: No stimulus block rendered; question displays directly

### Question Flow (locked)
- **D-07:** One question at a time — matches drill session pattern from Phase 2
- **D-08:** Session header: progress bar (X of Y), subject/unit label
- **D-09:** All MCQs for the unit loaded and shuffled via `scramble.ts`
- **D-10:** "Study All" aggregates all loaded units' MCQs then shuffles

### Answer Choice Display (locked)
- **D-11:** 4 choices displayed as selectable cards/buttons (A, B, C, D labels)
- **D-12:** Choices scrambled at render time via `scramble.ts` — labels (A/B/C/D) reassigned after shuffle
- **D-13:** Student selects one choice, then clicks "Submit Answer" (or choice click auto-submits — Claude's discretion)
- **D-14:** No answer change after selection — single attempt per question

### Feedback Presentation (locked)
- **D-15:** After submit, all 4 choice explanations shown inline under each choice
- **D-16:** Correct choice: highlighted green (`var(--accent-success)`) with checkmark
- **D-17:** Selected wrong choice: highlighted red (`var(--accent-danger)`) with X mark
- **D-18:** Other choices: dimmed/muted styling
- **D-19:** "Next question" button appears after feedback is shown

### Results Screen (locked — mirrors drill pattern)
- **D-20:** Score ring with conic gradient (same pattern as drill results)
- **D-21:** Contextual heading by accuracy tier (same thresholds as drills)
- **D-22:** Missed questions list: shows question text, student's choice, correct choice
- **D-23:** CTAs: "Retry missed" (hidden at 0), "Back to [subject]", "Study another unit"

### Data Flow on Session Complete (locked)
- **D-24:** Non-retry, non-Study-All:
  ```ts
  const mcqAccuracy = correctCount / totalQuestions
  const existing = lsGet(LS_KEYS.mastery(subject, unitSlug), { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 })
  lsSet(LS_KEYS.mastery(subject, unitSlug), { ...existing, mcqAccuracy, totalAttempts: existing.totalAttempts + totalQuestions })
  const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
  lsSet(LS_KEYS.totalQuestions, prevTotal + totalQuestions)
  logEvent({ event_type: 'mcq_completed', subject, unit: unitSlug, metadata: { accuracy: mcqAccuracy, question_count: totalQuestions, is_retry: false } })
  ```
- **D-25:** Retry sessions: Do NOT write `mcqAccuracy`. Do increment `totalQuestions`. Fire logEvent with `is_retry: true`.
- **D-26:** Study All sessions: Do NOT write any mastery key. Do increment `totalQuestions`. Fire logEvent with `unit: 'all'`.

### Claude's Discretion
- Whether choice selection auto-submits or requires explicit "Submit Answer" click
- Exact visual layout of stimulus block (padding, max-height, scrolling for long passages)
- Chart.js dark theme color overrides (must use CSS custom property values)
- Pseudocode syntax highlighting approach (plain monospace or lightweight highlighting)
- Transition animations between question states
- Whether to reuse drill's UnitSelector directly or create MCQ-specific variant

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `design-system/ascendly/MASTER.md` — Color tokens, typography, spacing, component specs, anti-patterns, pre-delivery checklist

### Project Rules
- `CLAUDE.md` — Critical rules (KaTeX, screenshot loop, agent pipeline, localStorage patterns, scramble verification)

### Data Schemas
- `data/schemas/mcq.schema.json` — Canonical MCQ schema (stimulus types, choice structure, explanations)
- `data/schemas/drill.schema.json` — Reference for consistent data patterns

### Existing Utilities (MUST use — do not reimplement)
- `utils/scramble.ts` — Fisher-Yates shuffle; use for both question order and choice order
- `utils/localStorage.ts` — `lsGet`, `lsSet`, `LS_KEYS` — all localStorage access goes through these
- `utils/analytics.ts` — `logEvent()` fire-and-forget wrapper
- `components/KatexRenderer.tsx` — KaTeX rendering for math in stimuli and choices
- `utils/subjects.ts` — `getSubject(slug)` for subject display name

### Prior Phase Reference
- `components/drill/` — DrillSession, DrillCard, DrillResults, UnitSelector — reference implementations for the 3-view orchestrator pattern
- `app/[subject]/drills/page.tsx` — Orchestrator pattern to mirror

### Phase Requirements
- `.planning/REQUIREMENTS.md` — MCQ-01 through MCQ-08

### Codebase Map
- `.planning/codebase/ARCHITECTURE.md` — App Router patterns, server/client boundary
- `.planning/codebase/CONVENTIONS.md` — TypeScript, CSS, naming conventions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/drill/UnitSelector.tsx` — Can potentially be reused or adapted for MCQ unit selection (same data source pattern)
- `components/drill/DrillResults.tsx` — Score ring and results pattern to mirror
- `utils/drillSession.ts` — Session state machine patterns to reference
- `utils/scoring.ts` — Scoring utilities
- `components/KatexRenderer.tsx` — Required for math in stimuli and choice text

### Established Patterns
- **3-view orchestrator:** `page.tsx` manages `DrillView` type via `useState`, renders child components conditionally
- **Data loading:** Client-side `fetch()` on unit selection, not at page load
- **Mastery writes:** Only on non-retry, non-Study-All sessions; always merge with existing mastery object
- **Analytics:** `logEvent()` fire-and-forget after mastery write

### Integration Points
- `app/[subject]/page.tsx` — Subject hub already links to `/practice` route (or needs a card added)
- `utils/localStorage.ts` — `LS_KEYS.mastery()` already supports `mcqAccuracy` field
- `data/[subject]/mcq/unit-[n].json` — JSON files will be created in content phases (6-12); interface must handle missing files gracefully

</code_context>

<specifics>
## Specific Ideas

- MCQ interface should feel like a natural companion to drills — same navigation patterns, same visual language
- Stimulus rendering is the major new capability vs. drills — needs to handle text, graphs, tables, and pseudocode cleanly
- Chart.js must render with dark theme colors (not default light chart colors)
- Critical Rule #5: NEVER scramble answer choices in JSON — scrambling at render time only
- Critical Rule #8: Every MCQ must have per-choice explanations (correct + each distractor)

</specifics>

<deferred>
## Deferred Ideas

- Adaptive difficulty (harder questions based on mastery) — Phase 13
- Question filtering by difficulty level — not in Phase 3 scope
- Bookmarking/flagging questions for review — not in v1 scope
- Timed MCQ mode — Phase 5 (Practice Tests)
- Content JSON files — content phases (6-12) generate these; Phase 3 only builds the interface

</deferred>

---

*Phase: 03-practice-questions-interface*
*Context gathered: 2026-03-24 via auto mode*
