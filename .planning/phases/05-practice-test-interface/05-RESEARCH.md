# Phase 5: Practice Test Interface - Research

**Researched:** 2026-03-24
**Domain:** Full-length timed AP practice test with question navigation, timer, and score report
**Confidence:** HIGH

## Summary

Phase 5 builds a full-length timed practice test interface that mirrors real AP exam conditions. The student selects a subject, configures timed/untimed mode, takes a test with free question navigation (jump to any question, flag for review), and receives a rich score report with projected AP score and per-unit breakdown.

The implementation closely mirrors the existing MCQ practice flow (3-view orchestrator pattern) but adds significant new mechanics: countdown timer with auto-submit, question navigation grid, flagging system, and proportional unit sampling to compose a full test from all available unit MCQ files. All core utilities (scramble, localStorage, analytics, scoring) already exist and are reusable. MCQCard and StimulusRenderer can be reused directly for question rendering.

**Primary recommendation:** Build as a single plan with 5 new components (TestSetup, TestSession, TestNavGrid, TestTimer, TestResults) plus a page orchestrator, a `testSession.ts` utility module, and a `testConfig.ts` constants file containing per-subject AP exam MCQ counts and durations.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Single route: `app/[subject]/test/page.tsx` -- `'use client'` orchestrator (NOTE: actual route must be `app/[subject]/practice-test/page.tsx` -- see Architecture Patterns for correction)
- D-02: Three views via React state: `type TestView = 'setup' | 'session' | 'results'`
- D-03: URL never changes during session. Browser back exits to subject hub.
- D-04: Fixed AP-accurate question count per subject -- proportional unit sampling
- D-05: Questions shuffled via `scramble.ts`. Answer choices scrambled at render time.
- D-06: Free navigation -- students can jump to any question at any time
- D-07: Navigation UI: question number grid or prev/next arrows + direct question number jump
- D-08: Questions can be answered, skipped, or flagged for review
- D-09: Explicit "Submit Test" button with student confirmation
- D-10: On timer expiry: auto-submit with no confirmation. Unanswered questions marked wrong.
- D-11: Timed mode toggle on setup screen -- default ON
- D-12: Timer display toggle -- show/hide countdown (visible by default)
- D-13: Fixed AP-accurate duration per subject
- D-14: Timer always rendered in session header when timed mode on; hidden when student toggles off display
- D-15: Warning state at <5 minutes remaining: timer turns red/accent-danger
- D-16: On expiry: auto-submit immediately, transition to results screen
- D-17: Untimed mode: no countdown, no auto-submit. "Submit Test" button only.
- D-18: Total score: X / Y correct with percentage
- D-19: Projected AP score (1-5) using existing `utils/scoring.ts`
- D-20: Per-unit breakdown: accuracy % per unit
- D-21: Missed questions list (same pattern as MCQResults)
- D-22: CTAs: "Retake Test", "Practice by Unit", "Back to [subject]"
- D-23: Write `ascendly_score_[subject]` localStorage key
- D-24: Do NOT overwrite unit mastery keys
- D-25: Increment `ascendly_total_questions` by questions answered
- D-26: Fire analytics: `test_completed` event

### Claude's Discretion
- Exact question navigation UI (number grid vs. list vs. prev/next + jump input)
- Visual treatment of answered/unanswered/flagged question indicators in nav
- Animation for timer warning state (pulse, color change, or both)
- Whether to preserve test state in sessionStorage for accidental tab-close recovery
- Exact mobile layout for question nav + timer + content

### Deferred Ideas (OUT OF SCOPE)
- Saving partial test progress to localStorage for multi-session resume
- Adaptive question selection (harder questions based on mastery) -- Phase 13
- Section-by-section scoring (some AP exams have free-response sections)
- Sharing/printing score report
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEST-01 | Full-length timed practice test per subject | AP exam MCQ counts and durations documented below; proportional unit sampling algorithm; testConfig.ts constants |
| TEST-02 | Timer display with auto-submit on expiry | Timer component with setInterval, useRef for interval cleanup, warning state at <5 min, auto-submit at 0 |
| TEST-03 | Score report with per-unit breakdown after submission | TestResults component extending MCQResults pattern; per-unit accuracy computed from answers map + question unit metadata |
| TEST-04 | Test results written to localStorage | `LS_KEYS.score(subject)` already defined; `LS_KEYS.totalQuestions` increment; completedRef guard pattern |
| TEST-05 | Supabase practice_test_complete event logged | logEvent fire-and-forget pattern (same as MCQ/drill); event_type: 'test_completed' |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- KaTeX always for formulas (Critical Rule #1)
- Screenshot loop required before marking UI work complete (Critical Rule #2)
- Never scramble answer choices in JSON -- scramble at render time only (Critical Rule #4)
- Never block UI on Supabase -- fire-and-forget, catch silently (Critical Rule #6)
- Per-choice explanations required for every MCQ (Critical Rule #8)
- Planner -> Coder -> Reviewer -> Tester pipeline required
- Design system: read `design-system/ascendly/MASTER.md` before building any UI
- UI Spec already exists: `05-UI-SPEC.md` has detailed view specifications, colors, typography, interactions

## Standard Stack

### Core (already installed -- no new packages)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router, page routing | Already in use |
| React | 19.2.4 | Component model, hooks | Already in use |
| TypeScript | strict | Type safety | Already in use |
| Tailwind CSS v4 | 4.x | Styling via CSS tokens | Already in use |
| Lucide React | 0.577.0 | Icons (Clock, BookOpen, Flag, Eye, EyeOff, ChevronLeft, ChevronRight, RotateCcw, ArrowLeft) | Already in use |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| KaTeX | 0.16.40 | Formula rendering in MCQ questions | Any question with math |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom timer | react-timer-hook | Unnecessary dependency; setInterval + useRef is trivial and already the project pattern |
| Custom nav grid | Headless UI Listbox | Overkill; simple CSS grid with button elements is sufficient |

**Installation:** No new packages required. All dependencies are already installed.

## AP Exam MCQ Section Configuration

**Confidence: HIGH** -- Verified via College Board official pages and multiple corroborating sources.

| Subject | Slug | MCQ Count | Time (min) | Units | Questions/Unit (approx) |
|---------|------|-----------|------------|-------|------------------------|
| AP Psychology | ap-psychology | 75 | 90 | 8 | ~9-10 |
| AP World History | ap-world-history | 55 | 55 | 9 | ~6 |
| AP Government | ap-government | 55 | 80 | 5 | 11 |
| AP Calculus AB | ap-calculus-ab | 45 | 105 | 8 | ~5-6 |
| AP Precalculus | ap-precalculus | 40 | 120 | 4 | 10 |
| AP Computer Science Principles | ap-csp | 70 | 120 | 5 | 14 |
| AP Chemistry | ap-chemistry | 60 | 90 | 9 | ~6-7 |

**Notes on AP Psychology:** The exam format changed from 100 questions/70 minutes to 75 questions/90 minutes. The CONTEXT.md references the old format -- use the current 75q/90min format.

**Proportional sampling algorithm:** For a subject with N total test questions and U units, each unit gets `floor(N / U)` questions. Remaining `N % U` questions are distributed round-robin to units with the most available questions. If a unit has fewer questions than its share, redistribute its shortfall to other units.

## Architecture Patterns

### Route Correction (IMPORTANT)

CONTEXT.md says `app/[subject]/test/page.tsx` but the subject hub (`app/[subject]/page.tsx` line 75) already links to `/${subject.slug}/practice-test`. A stub page already exists at `app/[subject]/practice-test/page.tsx`. The implementation MUST use `app/[subject]/practice-test/page.tsx` to match the existing navigation, NOT `app/[subject]/test/page.tsx`.

### Recommended File Structure
```
utils/
  testSession.ts          # TestSessionState type, handleTestComplete(), TestAnswer type
  testConfig.ts           # AP_TEST_CONFIG constant: per-subject MCQ count + duration
components/test/
  TestSetup.tsx            # Setup screen: subject info, timed toggle, timer toggle, start CTA
  TestSession.tsx          # Session orchestrator: header, nav grid, question card, prev/next
  TestNavGrid.tsx          # Question number grid with answered/unanswered/flagged/current states
  TestTimer.tsx            # Countdown display, warning state, auto-submit callback
  TestResults.tsx          # Score ring, per-unit breakdown, missed questions, CTAs
app/[subject]/practice-test/
  page.tsx                 # 3-view orchestrator (replaces existing stub)
```

### Pattern 1: 3-View Orchestrator (established)
**What:** Page component manages `TestView` state ('setup' | 'session' | 'results'), renders one child at a time.
**When to use:** Same pattern as `app/[subject]/practice/page.tsx`.
**Example:**
```typescript
// Source: app/[subject]/practice/page.tsx (established pattern)
type TestView = 'setup' | 'session' | 'results'
const [view, setView] = useState<TestView>('setup')
const [session, setSession] = useState<TestSessionState | null>(null)
```

### Pattern 2: Test Session State
**What:** Dedicated state type for test sessions, extending MCQ patterns but with test-specific fields.
**Example:**
```typescript
// utils/testSession.ts
export interface TestSessionState {
  questions: MCQ[]           // All test questions, shuffled
  answers: Record<string, MCQAnswer>  // Keyed by question ID
  flagged: Record<string, boolean>    // Keyed by question ID
  currentIndex: number
  timed: boolean
  showTimer: boolean
  durationSeconds: number    // Total seconds for this test
  subjectSlug: string
}
```

### Pattern 3: Timer with useRef (established)
**What:** setInterval at 1000ms tick, interval ID in useRef, cleanup in useEffect return.
**When to use:** Timer component.
**Key considerations:**
- `useRef` for interval ID prevents stale closure (same as `answersRef` pattern in MCQSession)
- Timer state in seconds as integer, formatted as MM:SS
- Warning threshold at 300 seconds (5 min)
- `font-variant-numeric: tabular-nums` prevents layout shift
- Cleanup function clears interval on unmount
- When `timed` is false: no setInterval created at all

### Pattern 4: MCQCard Adaptation for Test Mode
**What:** MCQCard currently shows "Submit Answer" then "Next Question" buttons. In test mode, the "Next Question" button is NOT needed -- navigation is student-initiated via prev/next arrows or grid.
**Approach:** The MCQCard `onNext` callback can simply be a no-op or navigate to next question. After answer submission, the student uses the nav grid or arrows to move. The card's existing pointer-events-none on choices post-submit works correctly for this flow.

### Pattern 5: Proportional Unit Sampling
**What:** Load all unit MCQ JSON files, sample proportionally to compose the full test.
**Algorithm:**
```typescript
function composeTest(allQuestions: MCQ[][], testSize: number): MCQ[] {
  // 1. Group questions by unit
  // 2. Calculate per-unit quota: floor(testSize / unitCount)
  // 3. Shuffle each unit's pool, take up to quota
  // 4. If any unit has fewer than quota, redistribute remainder
  // 5. Final shuffle of entire test
  // 6. Return exactly testSize questions
}
```

### Pattern 6: Data Loading (established)
**What:** `Promise.allSettled` across all unit JSON files; 404s silently become null.
**Example:**
```typescript
// Load all units for a subject
const unitNumbers = subjectData.units.map(u => u.number)
const results = await Promise.allSettled(
  unitNumbers.map(n =>
    fetch(`/data/${subject}/mcq/unit-${n}.json`).then(r => r.ok ? r.json() : null)
  )
)
const allQuestions: MCQ[][] = results
  .filter(r => r.status === 'fulfilled' && r.value)
  .map(r => (r as PromiseFulfilledResult<MCQ[]>).value)
```

### Anti-Patterns to Avoid
- **Auto-advance after answer:** Test mode is NOT MCQ session mode. Student navigates manually.
- **Storing timer state in localStorage:** Timer is session-only. sessionStorage is acceptable for tab-close recovery (Claude's discretion).
- **Writing unit mastery from test:** D-24 explicitly forbids overwriting unit mastery keys from test results.
- **Creating setInterval when untimed:** Only create the interval when `timed` is true.
- **Blocking on data load errors:** If some units have no content, compose the test from available units. Show empty state only if zero questions load.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Question/choice shuffling | Custom shuffle | `utils/scramble.ts` (Fisher-Yates) | Already verified, Critical Rule #4 compliant |
| localStorage access | Direct window.localStorage | `utils/localStorage.ts` (lsGet, lsSet, LS_KEYS) | SSR-safe, error-handling built in |
| Analytics events | Custom fetch | `utils/analytics.ts` (logEvent) | Fire-and-forget pattern, never throws |
| Projected AP score | Custom thresholds | `utils/scoring.ts` (projectScore) | Already defined, calibrated in Phase 13 |
| Formula rendering | Custom math parser | `components/KatexRenderer.tsx` | Critical Rule #1 |
| Question card rendering | Custom card | `components/mcq/MCQCard.tsx` | Already handles choices, stimulus, feedback |
| Stimulus rendering | Custom renderer | `components/mcq/StimulusRenderer.tsx` | Handles text, table, chart, code, none |

**Key insight:** This phase is primarily a composition of existing utilities and components into a new orchestration pattern. The truly new work is: timer mechanics, question navigation grid, proportional sampling, and the test-specific results view with per-unit breakdown.

## Common Pitfalls

### Pitfall 1: Stale Closure in Timer Callback
**What goes wrong:** Timer's auto-submit callback captures stale `answers` state, submitting with incomplete data.
**Why it happens:** setInterval callback closes over initial state value.
**How to avoid:** Use `useRef` for answers (same `answersRef` pattern from MCQSession). Timer's onExpiry callback reads from ref, not state.
**Warning signs:** Auto-submit after timer expires shows 0 correct answers despite student answering questions.

### Pitfall 2: Double-Fire on Test Complete
**What goes wrong:** `handleTestComplete` fires twice under React Strict Mode, writing localStorage and analytics twice.
**Why it happens:** React 19 strict mode double-invokes effects in development.
**How to avoid:** `completedRef` guard pattern (already established in MCQResults and DrillResults).
**Warning signs:** `ascendly_total_questions` incremented by 2x the expected amount.

### Pitfall 3: Route Mismatch
**What goes wrong:** Building at `app/[subject]/test/page.tsx` but subject hub links to `/practice-test`.
**Why it happens:** CONTEXT.md says "test" but the codebase uses "practice-test".
**How to avoid:** Use existing route `app/[subject]/practice-test/page.tsx`. Verify by checking subject hub's href.
**Warning signs:** 404 when clicking "Practice Test" from subject hub.

### Pitfall 4: Timer Off-by-One on Expiry
**What goes wrong:** Timer shows "00:00" but doesn't auto-submit, or auto-submits at "00:01".
**Why it happens:** Interval fires at 1000ms; comparison checks wrong boundary.
**How to avoid:** Decrement first, then check if result is 0. When 0, clear interval and call submit immediately.
**Warning signs:** Timer displays negative time or hangs at 00:00.

### Pitfall 5: MCQCard onNext in Test Mode
**What goes wrong:** After answering, the "Next Question" button appears and auto-advances, breaking free navigation.
**Why it happens:** MCQCard renders a "Next Question" button after submit and calls `onNext` when clicked.
**How to avoid:** In test mode, either (a) pass an `onNext` that does navigate to next question but doesn't auto-advance, or (b) modify MCQCard to accept a `showNextButton` prop. Option (a) is simpler and doesn't modify the shared component.
**Warning signs:** Student loses their place in the test after answering.

### Pitfall 6: Proportional Sampling with Missing Units
**What goes wrong:** If only 2 of 8 units have content, the test either crashes or has far fewer questions than expected.
**Why it happens:** Content phases (6-12) haven't run yet; most units will have no JSON files.
**How to avoid:** Gracefully compose from available units. If total available < required test size, use all available questions. Show the actual count on setup screen. If zero questions available, show empty state.
**Warning signs:** "Start Test" button is available but test has 0 questions.

### Pitfall 7: Memory Leak from Unmounted Timer
**What goes wrong:** setInterval continues running after component unmounts (navigation away, test submission).
**Why it happens:** Missing cleanup in useEffect.
**How to avoid:** Return cleanup function from useEffect that calls `clearInterval(intervalRef.current)`.
**Warning signs:** Console warnings about state updates on unmounted component.

## Code Examples

### Test Configuration Constants
```typescript
// utils/testConfig.ts
export interface TestConfig {
  questionCount: number
  durationMinutes: number
}

export const AP_TEST_CONFIG: Record<string, TestConfig> = {
  'ap-psychology':    { questionCount: 75,  durationMinutes: 90  },
  'ap-world-history': { questionCount: 55,  durationMinutes: 55  },
  'ap-government':    { questionCount: 55,  durationMinutes: 80  },
  'ap-calculus-ab':   { questionCount: 45,  durationMinutes: 105 },
  'ap-precalculus':   { questionCount: 40,  durationMinutes: 120 },
  'ap-csp':           { questionCount: 70,  durationMinutes: 120 },
  'ap-chemistry':     { questionCount: 60,  durationMinutes: 90  },
}
```

### Timer Hook Pattern
```typescript
// Inside TestTimer component
const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

useEffect(() => {
  if (!timed) return // No interval when untimed
  intervalRef.current = setInterval(() => {
    setSecondsLeft(prev => {
      const next = prev - 1
      if (next <= 0) {
        clearInterval(intervalRef.current!)
        onExpiry() // auto-submit
        return 0
      }
      return next
    })
  }, 1000)
  return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
}, [timed]) // eslint-disable-line react-hooks/exhaustive-deps
```

### Per-Unit Accuracy Computation
```typescript
// In handleTestComplete or TestResults
function computePerUnitAccuracy(
  questions: MCQ[],
  answers: Record<string, MCQAnswer>
): Record<string, { correct: number; total: number; accuracy: number }> {
  const units: Record<string, { correct: number; total: number }> = {}
  for (const q of questions) {
    const unitSlug = `unit-${q.unit}` // or extract from q.unit
    if (!units[unitSlug]) units[unitSlug] = { correct: 0, total: 0 }
    units[unitSlug].total++
    if (answers[q.id]?.isCorrect) units[unitSlug].correct++
  }
  const result: Record<string, { correct: number; total: number; accuracy: number }> = {}
  for (const [unit, data] of Object.entries(units)) {
    result[unit] = { ...data, accuracy: data.total > 0 ? data.correct / data.total : 0 }
  }
  return result
}
```

### Proportional Sampling
```typescript
function composeTest(
  questionsByUnit: Map<string, MCQ[]>,
  targetCount: number
): MCQ[] {
  const units = Array.from(questionsByUnit.entries())
  const unitCount = units.length
  if (unitCount === 0) return []

  const baseQuota = Math.floor(targetCount / unitCount)
  let remainder = targetCount % unitCount
  const selected: MCQ[] = []

  for (const [, questions] of units) {
    const shuffled = scramble(questions)
    const quota = Math.min(baseQuota + (remainder > 0 ? 1 : 0), shuffled.length)
    if (baseQuota + (remainder > 0 ? 1 : 0) > baseQuota) remainder--
    selected.push(...shuffled.slice(0, quota))
  }

  // If we're still short (some units had fewer than quota), backfill
  if (selected.length < targetCount) {
    const usedIds = new Set(selected.map(q => q.id))
    const remaining = units
      .flatMap(([, qs]) => qs)
      .filter(q => !usedIds.has(q.id))
    const backfill = scramble(remaining).slice(0, targetCount - selected.length)
    selected.push(...backfill)
  }

  return scramble(selected) // Final shuffle
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AP Psych: 100q / 70min | 75q / 90min | 2024-25 redesign | Must use new format |
| React 18 useEffect | React 19 strict mode double-fire | React 19 | completedRef guard required |
| Next.js params as object | Next.js 15+ params as Promise | Next.js 15 | Must use `use(params)` in client components |

## Open Questions

1. **MCQCard "Next Question" button in test mode**
   - What we know: MCQCard renders "Next Question" after answer submission. In test mode, navigation is student-initiated.
   - What's unclear: Should we hide the button, repurpose it, or let it work as "go to next question"?
   - Recommendation: Pass an onNext that navigates to next question -- this preserves the existing component API. The student can still use the grid/arrows. The "Next Question" button becomes a convenience, not mandatory. This avoids modifying the shared MCQCard component.

2. **MCQ JSON `unit` field format**
   - What we know: The MCQ schema has a `unit` field (type: string). The fixture JSON needs to be checked for the actual format (e.g., "1", "unit-1", "Unit 1").
   - What's unclear: Exact string format in the JSON files.
   - Recommendation: Check the fixture file at `public/data/ap-psychology/mcq/unit-1.json` during implementation. The per-unit accuracy computation must match whatever format is in the data.

3. **sessionStorage recovery (Claude's discretion)**
   - What we know: UI spec includes a sessionStorage guard pattern for tab-close recovery.
   - What's unclear: Whether it's worth the complexity for v1.
   - Recommendation: Implement it -- it's low-cost (serialize on answer/navigate, hydrate on mount, clear on complete) and prevents frustration during long timed tests.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + jest-environment-jsdom 30.3.0 |
| Config file | jest.config.ts (exists) |
| Quick run command | `npx jest --testPathPattern=testSession -x` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEST-01 | Proportional unit sampling composes correct test size | unit | `npx jest utils/__tests__/testSession.test.ts -x` | Wave 0 |
| TEST-01 | Test config has correct AP question counts per subject | unit | `npx jest utils/__tests__/testConfig.test.ts -x` | Wave 0 |
| TEST-02 | Timer counts down and triggers auto-submit at 0 | manual | Visual verification via screenshot loop | N/A |
| TEST-03 | Per-unit accuracy computed correctly from answers map | unit | `npx jest utils/__tests__/testSession.test.ts -x` | Wave 0 |
| TEST-04 | localStorage writes correct score + totalQuestions on complete | unit | `npx jest utils/__tests__/testSession.test.ts -x` | Wave 0 |
| TEST-05 | logEvent called with test_completed event | unit | `npx jest utils/__tests__/testSession.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=testSession -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `utils/__tests__/testSession.test.ts` -- covers TEST-01, TEST-03, TEST-04, TEST-05
- [ ] `utils/__tests__/testConfig.test.ts` -- covers TEST-01 (config validation)

## Sources

### Primary (HIGH confidence)
- `app/[subject]/practice/page.tsx` -- 3-view orchestrator pattern
- `utils/mcqSession.ts` -- MCQ session types and completion handler pattern
- `components/mcq/MCQCard.tsx` -- Question card rendering pattern
- `components/mcq/MCQResults.tsx` -- Score ring and results pattern
- `utils/localStorage.ts` -- LS_KEYS already defines `score(subject)` and `totalQuestions`
- `utils/scoring.ts` -- projectScore function
- `utils/scramble.ts` -- Fisher-Yates shuffle
- `app/[subject]/page.tsx` -- Subject hub links to `/practice-test` (line 75)
- `app/[subject]/practice-test/page.tsx` -- Existing stub page
- `.planning/phases/05-practice-test-interface/05-UI-SPEC.md` -- Complete UI design contract
- `.planning/phases/05-practice-test-interface/05-CONTEXT.md` -- Locked decisions

### Secondary (MEDIUM confidence)
- [AP Central: AP Calculus AB Exam](https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam) -- 45 MCQ, 105 min
- [AP Central: AP Precalculus Exam](https://apcentral.collegeboard.org/courses/ap-precalculus/exam) -- 40 MCQ, 120 min
- [AP Central: AP Chemistry Exam](https://apcentral.collegeboard.org/courses/ap-chemistry/exam) -- 60 MCQ, 90 min
- [AP Central: AP CSP Exam](https://apcentral.collegeboard.org/courses/ap-computer-science-principles/exam) -- 70 MCQ, 120 min
- [AP Central: AP US Government Exam](https://apcentral.collegeboard.org/courses/ap-united-states-government-and-politics/exam) -- 55 MCQ, 80 min
- [AP Central: AP World History Exam](https://apcentral.collegeboard.org/courses/ap-world-history/exam) -- 55 MCQ, 55 min
- [AP Psychology exam format update](https://test-ninjas.com/ap-psychology-exam-format) -- 75 MCQ, 90 min (updated from 100q/70min)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed, patterns established in phases 2-4
- Architecture: HIGH -- follows established 3-view orchestrator pattern, all utilities exist
- Pitfalls: HIGH -- identified from actual code review of MCQSession, MCQCard, MCQResults patterns
- AP exam data: HIGH -- verified against College Board official exam pages via multiple sources

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable -- exam formats don't change mid-year)
