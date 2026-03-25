---
phase: 05-practice-test-interface
plan: 02
subsystem: ui
tags: [components, practice-test, timer, navigation, results, score-ring]
dependency_graph:
  requires:
    - utils/testConfig.ts (AP_TEST_CONFIG, TestConfig — from Plan 01)
    - utils/testSession.ts (TestSessionState, TestAnswer, PerUnitResult, composeTest, computePerUnitAccuracy, handleTestComplete — from Plan 01)
    - utils/mcqSession.ts (MCQ type)
    - utils/subjects.ts (getSubject)
    - utils/scoring.ts (projectScore)
    - utils/scramble.ts (scramble — via testSession)
    - components/mcq/MCQCard.tsx (reused as-is)
    - components/mcq/StimulusRenderer.tsx (used by MCQCard)
    - app/globals.css (.score-ring, .score-ring-inner CSS classes)
  provides:
    - components/test/TestSetup.tsx
    - components/test/TestTimer.tsx
    - components/test/TestNavGrid.tsx
    - components/test/TestSession.tsx
    - components/test/TestResults.tsx
    - app/[subject]/practice-test/page.tsx (full 3-view practice test orchestrator)
  affects:
    - Phase 05 Plan 03 (verifier will exercise this UI)
    - Phase 06+ content phases (MCQ JSON files will populate the test)
tech_stack:
  added: []
  patterns:
    - answersRef pattern (stale closure guard for timer onExpiry callback)
    - completedRef guard (prevents double-fire under React Strict Mode)
    - key prop on MCQCard (resets card state when navigating between questions)
    - Promise.allSettled for unit JSON fetch (partial success, 404s silently null)
    - color-mix() for semantic badge tints (established pattern from MCQSession)
    - --score-deg CSS custom property on score-ring (drives conic-gradient fill)
    - use(params) for Next.js 15+ Promise params unwrapping
key_files:
  created:
    - components/test/TestSetup.tsx
    - components/test/TestTimer.tsx
    - components/test/TestNavGrid.tsx
    - components/test/TestSession.tsx
    - components/test/TestResults.tsx
  modified:
    - app/[subject]/practice-test/page.tsx (replaced stub with full orchestrator)
decisions:
  - "MCQCard key={currentQuestion.id} — forces React to remount card on navigation, clearing internal selected/submitted state"
  - "onExpiryRef pattern in TestTimer — prevents stale closure when interval fires after parent re-render"
  - "Timer visibility: visibility:hidden (not display:none) so timer takes layout space even when hidden"
  - "Submit confirmation as inline banner (not modal) per D-09 and UI-SPEC"
  - "handleStart is async in page.tsx — loadQuestions uses await Promise.allSettled before composing test"
metrics:
  duration: "323 seconds (~5 minutes)"
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_created: 5
  files_modified: 1
---

# Phase 05 Plan 02: Practice Test UI Components Summary

**One-liner:** Full practice test UI (setup with timed/timer toggles, session with countdown/nav grid/MCQCard reuse, results with score ring/AP score/per-unit breakdown) wired to Plan 01's session logic via 3-view page orchestrator.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | TestSetup, TestTimer, TestNavGrid components | d5ffaab | components/test/TestSetup.tsx, TestTimer.tsx, TestNavGrid.tsx |
| 2 | TestSession, TestResults, and page orchestrator | f8d473f | components/test/TestSession.tsx, TestResults.tsx, app/[subject]/practice-test/page.tsx |

## What Was Built

### components/test/TestSetup.tsx

Centered card (max-width 480px, `var(--bg-card)` border card, 32px padding) displaying:
- Subject name (24px/700) + "Practice Test" subtitle (14px/400 secondary)
- Metadata row with Lucide `BookOpen` + question count, `Clock` + duration
- Timed Mode pill toggle (44x24px, 20px thumb) defaulting ON — `var(--accent)` ON, `var(--bg-border)` OFF, 150ms transition
- Show Timer pill toggle — disabled (opacity 0.4, cursor not-allowed) when timed is OFF
- Start Test button (full-width, `var(--accent)`, 14px 20px padding)
- Both toggles use `role="switch" aria-checked` for accessibility

### components/test/TestTimer.tsx

Countdown timer component with:
- `setInterval` at 1000ms, `intervalRef` for leak-free cleanup
- `onExpiryRef` pattern to prevent stale closure when interval fires
- MM:SS format via `padStart(2, '0')` for both parts
- `font-variant-numeric: tabular-nums` to prevent layout shift
- Warning state at `secondsLeft <= 300`: color → `var(--accent-danger)` (300ms transition) + CSS pulse animation (1200ms opacity 1→0.6→1)
- `prefers-reduced-motion` media query disables pulse animation
- `visibility: hidden` (not display:none) when `!visible` — timer keeps running, layout unchanged

### components/test/TestNavGrid.tsx

Responsive question navigation grid:
- 10 columns desktop, 8 tablet, horizontal scroll strip mobile
- 4 cell states with `color-mix` tints: current (accent solid), answered (accent 20%), flagged (warning 15%), unanswered (bg-card)
- State transitions: 150ms ease on background-color and border-color
- Lucide `Flag` (10px) overlaid bottom-right on flagged cells
- 44px minHeight per iOS HIG touch target requirement
- `aria-label` on each button includes flag status

### components/test/TestSession.tsx

Session orchestrator:
- Sticky header: subject label (left), TestTimer (center), Eye/EyeOff toggle + correct/wrong tally badges (right)
- Timer toggle carries `aria-label="Hide timer"` / `aria-label="Show timer"` (accessible icon-only button)
- TestNavGrid below header for question jumping
- `answersRef` pattern mirrors answers state — timer onExpiry reads ref not stale closure
- MCQCard rendered with `key={currentQuestion.id}` — forces remount on navigation (Critical: without this, card retains prior question's state)
- Flag for Review button: `var(--text-muted)` default, `var(--accent-warning)` when flagged, toggling `flagged` record
- Prev/Next arrows: 44px touch target, disabled styling (opacity 0.4, cursor not-allowed) at boundaries
- Submit Test button always visible; inline confirm banner appears when unanswered questions > 0
- Confirm banner: `var(--bg-card)` bg + `var(--accent-warning)` 4px left border, "Submit Anyway" (danger) + "Keep Going" (ghost)
- Time's Up overlay: fixed full-screen at 90% opacity, 28px/700 text, 1500ms then auto-submit

### components/test/TestResults.tsx

Results screen:
- `completedRef` guard prevents double-fire of `handleTestComplete` under Strict Mode
- Score ring reusing `.score-ring` + `.score-ring-inner` CSS classes with `--score-deg` custom property
- "Test Complete" title + subject name (from `getSubject()`)
- Score metadata: "{N} / {M} correct · Projected AP Score: {X}" with pill badge colored by score (5=success, 4=accent, 3=warning, 1-2=danger)
- Unit Breakdown card: per-unit rows with name, 4px accuracy bar (400ms ease-out entrance animation), percentage
- Missed Questions card: top 5 with truncated question, student answer, correct answer, "+ N more" overflow
- CTA stack: Retake Test (accent), Practice by Unit (ghost → `/${subject}/practice`), Back to {SubjectName} (ghost → `/${subject}`)

### app/[subject]/practice-test/page.tsx

3-view orchestrator:
- `use(params)` for Next.js 15+ Promise params
- `AP_TEST_CONFIG[subject]` for question count + duration
- `handleStart` is async: `Promise.allSettled` fetches all unit MCQ JSON files, 404s silently become null, builds `Map<string, MCQ[]>`, calls `composeTest`
- Empty state: "No questions available for this subject yet. Content is being added."
- Error state: "Couldn't load test questions. Check your connection and try again."
- Session view: no max-width constraint; setup/results: max-width 960px centered

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None in Plan 02 components. The practice test UI fully wires to Plan 01 logic. All data paths are live once MCQ JSON files exist under `/public/data/[subject]/mcq/unit-N.json`. Until content phases (6–12) run, subjects will show the empty state: "No questions available for this subject yet."

This is intentional by design — the empty state copy is the correct fallback, not a stub.

## Self-Check: PASSED

- FOUND: components/test/TestSetup.tsx
- FOUND: components/test/TestTimer.tsx
- FOUND: components/test/TestNavGrid.tsx
- FOUND: components/test/TestSession.tsx
- FOUND: components/test/TestResults.tsx
- FOUND: app/[subject]/practice-test/page.tsx (full orchestrator, stub replaced)
- FOUND: commit d5ffaab (TestSetup, TestTimer, TestNavGrid)
- FOUND: commit f8d473f (TestSession, TestResults, page.tsx)
- TypeScript: 0 errors (npx tsc --noEmit passed cleanly)
- Jest: 22 tests passed (testConfig + testSession suites)
- Build note: next build fails on /api/log-event due to missing Supabase env vars — pre-existing issue documented in CLAUDE.md Decisions Log (Task 6 deferred), NOT a regression from Plan 02
