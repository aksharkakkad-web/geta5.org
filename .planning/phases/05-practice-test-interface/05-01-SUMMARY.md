---
phase: 05-practice-test-interface
plan: 01
subsystem: utils
tags: [tdd, types, session-logic, localStorage, analytics]
dependency_graph:
  requires:
    - utils/mcqSession.ts (MCQ, MCQAnswer types)
    - utils/localStorage.ts (lsGet, lsSet, LS_KEYS)
    - utils/scoring.ts (projectScore)
    - utils/scramble.ts (scramble)
    - utils/analytics.ts (logEvent)
  provides:
    - utils/testConfig.ts (AP_TEST_CONFIG, TestConfig)
    - utils/testSession.ts (TestSessionState, TestAnswer, PerUnitResult, composeTest, computePerUnitAccuracy, handleTestComplete)
  affects:
    - Phase 05 Plan 02 (UI components depend on these types and functions)
tech_stack:
  added: []
  patterns:
    - TDD RED/GREEN/REFACTOR cycle
    - Proportional unit sampling with backfill
    - Fire-and-forget analytics (Critical Rule #6)
key_files:
  created:
    - utils/testConfig.ts
    - utils/testSession.ts
    - utils/__tests__/testConfig.test.ts
    - utils/__tests__/testSession.test.ts
  modified: []
decisions:
  - "D-24 honored: handleTestComplete does not write mastery keys — practice tests are assessment-only"
  - "D-26 honored: event_type locked to 'test_completed' (overrides TEST-05's 'practice_test_complete')"
  - "composeTest uses backfill from leftover pool to handle units with fewer questions than quota"
metrics:
  duration: "189 seconds (~3 minutes)"
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_created: 4
  tests_written: 22
---

# Phase 05 Plan 01: Test Configuration and Session Logic Summary

**One-liner:** AP exam config constants (7 subjects, College Board counts) + full TDD-covered session logic (proportional composition, per-unit accuracy, localStorage/analytics completion handler).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | testConfig.ts -- AP exam configuration constants | 00c9baf | utils/testConfig.ts, utils/__tests__/testConfig.test.ts |
| 2 | testSession.ts -- types, composeTest, computePerUnitAccuracy, handleTestComplete | 1dd8d11 | utils/testSession.ts, utils/__tests__/testSession.test.ts |

## What Was Built

### utils/testConfig.ts

Exports `TestConfig` interface (`questionCount`, `durationMinutes`) and `AP_TEST_CONFIG` constant with College Board accurate data for all 7 AP subjects:

- ap-psychology: 75 questions / 90 min
- ap-world-history: 55 questions / 55 min
- ap-government: 55 questions / 80 min
- ap-calculus-ab: 45 questions / 105 min
- ap-precalculus: 40 questions / 120 min
- ap-csp: 70 questions / 120 min
- ap-chemistry: 60 questions / 90 min

### utils/testSession.ts

Exports three types and three functions:

**Types:**
- `TestAnswer` — `{ selectedChoiceId, isCorrect }` (parallel to MCQAnswer)
- `TestSessionState` — full session state including questions, answers, flagged, timer state, timed mode
- `PerUnitResult` — `{ unitNumber, unitName, correct, total, accuracy }` for score report

**Functions:**
- `composeTest(questionsByUnit, targetCount)` — proportional sampling with backfill for sparse units, final scramble
- `computePerUnitAccuracy(questions, answers)` — groups by unit, unanswered = incorrect
- `handleTestComplete(session, subject)` — writes score/totalQuestions to localStorage, fires analytics, never touches mastery keys

## TDD Coverage

- 9 tests for testConfig.ts (all subjects, all config values, positive guard)
- 13 tests for testSession.ts:
  - 6 for composeTest (exact count, proportional, backfill, under-supply, empty, shuffle)
  - 3 for computePerUnitAccuracy (grouping, unanswered=incorrect, empty)
  - 4 for handleTestComplete (score write, totalQuestions increment, analytics shape, no mastery write)
- Total: 22 tests, all passing

## Deviations from Plan

None — plan executed exactly as written.

The `scramble` mock strategy (identity function by default, non-identity in Test 6 to verify shuffle was called) matched the plan's directive without modification.

## Known Stubs

None. This plan is pure logic/data with no UI rendering. No placeholder values flow to any display layer.

## Self-Check: PASSED

- FOUND: utils/testConfig.ts
- FOUND: utils/testSession.ts
- FOUND: utils/__tests__/testConfig.test.ts
- FOUND: utils/__tests__/testSession.test.ts
- FOUND: commit 00c9baf (testConfig.ts)
- FOUND: commit 1dd8d11 (testSession.ts)
