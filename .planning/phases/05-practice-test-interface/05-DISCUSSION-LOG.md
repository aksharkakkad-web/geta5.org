# Phase 5: Practice Test Interface - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24

---

## Test Composition
**Question:** How many questions per test? All units combined? Fixed AP-accurate count or load all available MCQs?

**Options considered:**
- Fixed AP-accurate count (proportional sampling across units)
- Load all available MCQs regardless of count
- User picks which units to include

**Decision:** Fixed AP-accurate question count per subject, with proportional unit sampling. Researcher to look up College Board MCQ section totals per subject.

---

## Question Navigation
**Question:** Forward-only like current MCQ sessions, or can students jump back to review/change answers?

**Options considered:**
- Forward-only (strict, matches drill/MCQ pattern)
- Free navigation (jump to any question, AP exam style)
- Back-only (go back but not skip ahead)

**Decision:** Free navigation — students can jump to any question at any time. Explicit "Submit Test" button (no auto-advance at end).

---

## Timer Mechanics
**Question:** Duration, expiry behavior, and display?

**Options considered:**
- Fixed AP-accurate duration per subject
- Configurable duration
- Per-question time estimate

**Decision:**
- Fixed AP-accurate duration per subject (researcher documents per-subject values)
- On expiry: auto-submit, mark unanswered as wrong
- Timer always visible in session header (default)
- Warning state at <5 minutes (accent-danger color)
- Timed/untimed mode toggle on setup screen (default: timed)
- Show/hide timer toggle available during session

---

## Score Report Depth
**Question:** Minimal (total + projected score) vs. rich (per-unit breakdown + missed questions)?

**Options considered:**
- Minimal: total score + projected AP score (1–5)
- Rich: total score + projected score + per-unit accuracy + missed questions list

**Decision:** Rich score report — total score, projected AP score (1–5), per-unit breakdown, missed questions list with student's answer vs. correct answer.
