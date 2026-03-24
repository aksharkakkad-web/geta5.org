# Phase 5: Practice Test Interface - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a full-length timed practice test interface at `app/[subject]/test/page.tsx`. Students take an AP-accurate MCQ exam (fixed question count per subject), can navigate freely between questions, and receive a rich score report with per-unit breakdown on completion. Timer auto-submits on expiry with unanswered questions marked wrong. Students can toggle timed vs. untimed mode and show/hide the timer.

</domain>

<decisions>
## Implementation Decisions

### Routing & Architecture (carries prior pattern)
- **D-01:** Single route: `app/[subject]/test/page.tsx` — `'use client'` orchestrator
- **D-02:** Three views via React state: `type TestView = 'setup' | 'session' | 'results'`
  - `setup`: Test configuration (timed toggle, timer visibility toggle, start button)
  - `session`: Active test with question nav and timer
  - `results`: Rich score report
- **D-03:** URL never changes during session. Browser back exits to subject hub.

### Test Composition (LOCKED)
- **D-04:** Fixed AP-accurate question count per subject — researcher must look up College Board MCQ counts:
  - Total questions and section duration per AP exam (Section I MCQ only)
  - Questions drawn from the full pool of available MCQ JSON files across all units
  - Proportional unit sampling: if a subject has 8 units and the test is 80 questions, load proportionally from each unit's JSON (e.g., 10q per unit). If a unit has fewer than its share, pull the remainder from other units.
  - Researcher to document final counts per subject in the plan.
- **D-05:** Questions shuffled via `scramble.ts`. Answer choices scrambled at render time (same as MCQ interface — never in JSON).

### Question Navigation (LOCKED)
- **D-06:** Free navigation — students can jump to any question at any time during the session
- **D-07:** Navigation UI: question number grid or prev/next arrows + direct question number jump
- **D-08:** Questions can be answered, skipped, or flagged for review — student returns before submitting
- **D-09:** Explicit "Submit Test" button (not auto-advance after last question) — student confirms submission
- **D-10:** On timer expiry: auto-submit with no confirmation. Unanswered questions marked wrong.

### Timer Mechanics (LOCKED)
- **D-11:** Timed mode toggle on setup screen — default ON (AP-accurate experience)
- **D-12:** Timer display toggle — show/hide the countdown (visible by default). Toggle available during session.
- **D-13:** Fixed AP-accurate duration per subject (researcher documents these — e.g., AP Psych = 70 min for 100q MCQ section)
- **D-14:** Timer always rendered in session header when timed mode is on; hidden when student toggles off display
- **D-15:** Warning state at <5 minutes remaining: timer turns red/accent-danger color
- **D-16:** On expiry: auto-submit immediately, transition to results screen
- **D-17:** Untimed mode: no countdown, no auto-submit. "Submit Test" button only.

### Score Report (LOCKED — rich)
- **D-18:** Total score: X / Y correct with percentage
- **D-19:** Projected AP score (1–5) using existing scoring thresholds from `utils/scoring.ts`
- **D-20:** Per-unit breakdown: accuracy % per unit, shown as a list or grid
- **D-21:** Missed questions list: question text, student's selected answer, correct answer (same pattern as MCQResults)
- **D-22:** CTAs: "Retake Test", "Practice by Unit" (links to /[subject]/practice), "Back to [subject]"

### localStorage on Completion (LOCKED)
- **D-23:** Write `ascendly_score_[subject]` key: `{ projectedScore: 1|2|3|4|5, accuracy: number }`
  - This is already defined in CLAUDE.md localStorage schema
- **D-24:** Do NOT overwrite unit mastery keys — test is a separate mode, not a unit drill/MCQ
- **D-25:** Increment `ascendly_total_questions` by questions answered
- **D-26:** Fire analytics: `logEvent({ event_type: 'test_completed', subject, metadata: { total: N, correct: M, timed: boolean, projected_score: 1|5 } })`

### Claude's Discretion
- Exact question navigation UI (number grid vs. list vs. prev/next + jump input)
- Visual treatment of answered/unanswered/flagged question indicators in nav
- Animation for timer warning state (pulse, color change, or both)
- Whether to preserve test state in sessionStorage for accidental tab-close recovery (within same session only)
- Exact mobile layout for question nav + timer + content

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `design-system/ascendly/MASTER.md` — Color tokens, typography, spacing, component specs, pre-delivery checklist

### Project Rules
- `CLAUDE.md` — Critical rules, localStorage schema, screenshot loop, agent pipeline, analytics pattern

### Data Schemas
- `data/schemas/mcq.schema.json` — MCQ data shape (same JSON files used for practice test)

### Existing Utilities (MUST use — do not reimplement)
- `utils/scramble.ts` — Fisher-Yates shuffle for question order and choice order
- `utils/localStorage.ts` — `lsGet`, `lsSet`, `LS_KEYS` — all localStorage access
- `utils/analytics.ts` — `logEvent()` fire-and-forget
- `utils/scoring.ts` — Projected AP score (1–5) calculation
- `utils/mcqSession.ts` — MCQ session state patterns to reference
- `components/KatexRenderer.tsx` — KaTeX for any math in questions

### Prior Phase References (reuse patterns from these)
- `components/mcq/MCQCard.tsx` — Answer choice card (reuse directly)
- `components/mcq/StimulusRenderer.tsx` — Stimulus rendering (reuse directly)
- `components/mcq/MCQResults.tsx` — Score ring + results pattern to extend
- `components/mcq/UnitSelector.tsx` — Unit selector pattern (adapt for test setup)
- `app/[subject]/practice/page.tsx` — 3-view orchestrator to mirror

### Phase Requirements
- `.planning/REQUIREMENTS.md` — TEST-01 through TEST-05

### Codebase Map
- `.planning/codebase/ARCHITECTURE.md` — App Router patterns, server/client boundary
- `.planning/codebase/CONVENTIONS.md` — TypeScript, CSS, naming conventions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/mcq/MCQCard.tsx` — Reuse as-is for question rendering (same choice card UI)
- `components/mcq/StimulusRenderer.tsx` — Reuse as-is for stimulus blocks
- `components/mcq/MCQResults.tsx` — Score ring pattern to extend for rich test results
- `utils/scramble.ts` — Already handles Fisher-Yates; use for question + choice ordering
- `utils/scoring.ts` — Already computes projected AP score from accuracy float
- `app/globals.css` — Score ring CSS already defined (--score-deg conic gradient)

### Established Patterns
- **3-view orchestrator:** `page.tsx` manages view state via `useState`, renders child components
- **Data loading:** `Promise.allSettled` across unit JSON files; 404s silently become null
- **Mastery writes:** After session complete only — use same guard pattern (`completedRef`)
- **Analytics:** `logEvent()` after all writes, fire-and-forget
- **Choice scrambling:** `scramble.ts` at render time, never in JSON (Critical Rule #4)

### Integration Points
- `app/[subject]/page.tsx` — Subject hub needs a new "Practice Test" mode card
- `utils/localStorage.ts` — `LS_KEYS` already has `ascendly_score_[subject]` defined
- `data/[subject]/mcq/unit-[n].json` — Same files used for MCQ practice; test loads all units

</code_context>

<specifics>
## Specific Ideas

- AP-accurate question counts require researcher to document per-subject MCQ section totals from College Board (e.g., AP Psych = 100q / 70min, AP Gov = 55q / 80min, etc.)
- Proportional unit sampling ensures all units are represented in the full test — not just the first N units with content
- Timed/untimed toggle makes the interface useful even before all content is available (can practice without time pressure)
- Timer show/hide toggle: useful for students who find the timer anxiety-inducing
- Free question navigation is a meaningful UX improvement over MCQ sessions — mirrors real AP exam experience
- "Flagged for review" state is a nice-to-have within Claude's discretion

</specifics>

<deferred>
## Deferred Ideas

- Saving partial test progress to localStorage for multi-session resume (no accounts, complex to implement correctly)
- Adaptive question selection (harder questions based on mastery) — Phase 13
- Section-by-section scoring (some AP exams have free-response sections) — out of scope for v1
- Sharing/printing score report — v2 consideration

</deferred>

---

*Phase: 05-practice-test-interface*
*Context gathered: 2026-03-24*
