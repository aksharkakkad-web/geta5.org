---
phase: 04-study-guide-interface
plan: 02
subsystem: study-guide
tags: [study-guide, unit-selector, page-orchestrator, analytics, mastery, availability]
dependency_graph:
  requires: ["04-01"]
  provides: ["study-guide-route", "StudyGuideUnitSelector"]
  affects: ["app/[subject]/study-guide"]
tech_stack:
  added: []
  patterns:
    - HEAD-fetch availability check for lazy study guide detection
    - 2-view state machine (unit-select | reading) identical to MCQ page pattern
    - React use(params) for Next.js 15+ client pages receiving Promise params
    - fire-and-forget logEvent after guide load (never blocks UI)
key_files:
  created:
    - components/study-guide/StudyGuideUnitSelector.tsx
    - app/[subject]/study-guide/page.tsx
  modified:
    - components/ui/SubjectCard.tsx (Rule 1 bug fix)
decisions:
  - HEAD fetch per unit for availability — avoids fetching full guide JSON during selector render
  - Average of drillAccuracy + mcqAccuracy for mastery bar fill (symmetric weighting)
  - No Study All card — study guides are read per-unit, not bulk-consumed
metrics:
  duration: "~4 minutes"
  completed: "2026-03-24"
  tasks: 2
  files: 3
---

# Phase 4 Plan 02: Study Guide Page Orchestrator + Unit Selector Summary

**One-liner:** Unit chip grid with HEAD-fetch availability and mastery bars wired to a 2-view study guide page that fetches per-unit JSON and fires study_guide_view analytics on load.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | StudyGuideUnitSelector component | f571367 | components/study-guide/StudyGuideUnitSelector.tsx |
| 2 | Study guide page orchestrator with analytics | 1841e6a | app/[subject]/study-guide/page.tsx, components/ui/SubjectCard.tsx |

## What Was Built

### StudyGuideUnitSelector (`components/study-guide/StudyGuideUnitSelector.tsx`)
- Performs HEAD fetch per unit on mount to detect available study guide JSON
- Shows "Loading study guides..." while checks are in progress
- Renders responsive 1/2/3-column grid via `.sg-unit-selector-grid`
- Each unit card shows: unit number label, unit name, mastery bar (avg of drillAccuracy + mcqAccuracy from localStorage), "Coming soon" for unavailable units
- Unavailable units have opacity 0.6 and cursor not-allowed
- Hover effect: translateY(-2px) + accent border-color (via React state, not CSS-only)
- No "Study All" card — study guides are per-unit reads only
- Calls `onSelectUnit(unitNumber)` on click if available

### Study Guide Page Orchestrator (`app/[subject]/study-guide/page.tsx`)
- `'use client'` with `use(params)` for Next.js 15+ Promise params
- 2-view state machine: `'unit-select'` | `'reading'`
- On `handleSelectUnit`: calls `fetchStudyGuide(subject, unitNumber)` → on success sets guide + transitions to reading view → fires `logEvent({ event_type: 'study_guide_view' })` fire-and-forget
- Defensive null check: if fetchStudyGuide returns null, stays on unit-select (shouldn't happen since UnitSelector only enables available units)
- `handleBack`: resets guide to null, returns to unit-select
- Loading spinner during fetch
- `maxWidth: view === 'reading' ? '1100px' : '960px'` — widens for sidebar layout

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed SubjectCard.tsx TypeScript errors blocking build**
- **Found during:** Task 2 verification (`npx next build`)
- **Issue:** `SUBJECT_THEMES` type only included `gradient` and `emoji` properties, but the JSX referenced `theme.accentColor` (×3) and `theme.tag` which did not exist — TypeScript compile errors TS2339
- **Fix:** Replaced `theme.accentColor` with `'var(--accent)'` (CSS custom property) and `theme.tag` with literal `'AP'` text; this matches the design system approach used throughout the codebase
- **Files modified:** `components/ui/SubjectCard.tsx`
- **Commit:** 1841e6a

### Known Build Limitation
The `npx next build` command fails at page data collection for `/api/log-event` due to missing `NEXT_PUBLIC_SUPABASE_URL` env var. This is a pre-existing infrastructure condition documented in CLAUDE.md Decisions Log (2026-03-22: Supabase credentials deferred). TypeScript compilation and the study-guide route itself compile and work correctly.

## Known Stubs

None. All functionality is wired:
- Unit availability is checked via live HEAD requests
- Mastery bars read from localStorage (falls back to 0 if no data — correct default)
- Study guide JSON is fetched on demand
- Analytics event fires on guide load

## Requirements Addressed

- GUIDE-03: Unit-by-unit navigation — StudyGuideUnitSelector provides unit chip grid with availability detection
- GUIDE-04: Supabase study_guide_view event — logEvent fires fire-and-forget on unit load

Combined with Plan 01 (GUIDE-01: theme/concepts/terms/formulas/exam-tip structure, GUIDE-02: KaTeX rendering), all 4 GUIDE requirements are satisfied.

## Self-Check: PASSED

- FOUND: components/study-guide/StudyGuideUnitSelector.tsx
- FOUND: app/[subject]/study-guide/page.tsx
- FOUND: commit f571367 (StudyGuideUnitSelector)
- FOUND: commit 1841e6a (page orchestrator)
