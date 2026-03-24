---
phase: 3
slug: practice-questions-interface
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-24
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest (project standard — see package.json, jest.config.ts) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npx jest --verbose` |
| **Full suite command** | `npx jest --verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --verbose`
- **After every plan wave:** Run `npx jest --verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | MCQ-02, MCQ-03 | unit | `npx jest --testPathPattern=mcqSession --verbose 2>&1 \| tail -30` | utils/__tests__/mcqSession.test.ts (created in task) | pending |
| 03-01-02 | 01 | 1 | MCQ-05 | typecheck | `npx tsc --noEmit components/mcq/StimulusRenderer.tsx 2>&1 \| head -20` | N/A (typecheck only) | pending |
| 03-01-03 | 01 | 1 | MCQ-07, MCQ-08 | typecheck | `npx tsc --noEmit components/mcq/MCQCard.tsx 2>&1 \| head -20` | N/A (typecheck only) | pending |
| 03-02-01 | 02 | 2 | MCQ-01 | typecheck | `npx tsc --noEmit components/mcq/UnitSelector.tsx 2>&1 \| head -20` | N/A (typecheck only) | pending |
| 03-02-02 | 02 | 2 | MCQ-06 | typecheck | `npx tsc --noEmit components/mcq/MCQSession.tsx 2>&1 \| head -20` | N/A (typecheck only) | pending |
| 03-02-03 | 02 | 2 | MCQ-06, MCQ-07 | typecheck | `npx tsc --noEmit components/mcq/MCQResults.tsx 2>&1 \| head -20` | N/A (typecheck only) | pending |
| 03-02-04 | 02 | 2 | MCQ-08 | typecheck | `npx tsc --noEmit app/[subject]/practice/page.tsx 2>&1 \| head -20` | N/A (typecheck only) | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `utils/__tests__/mcqSession.test.ts` — created as part of Plan 01 Task 1 (TDD task creates tests first)
- [x] Existing jest infrastructure covers test execution (jest.config.ts, package.json scripts)

*Existing infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chart.js renders with dark theme colors | MCQ-02 | Visual verification | Screenshot loop: verify chart canvas renders with dark background, accent-colored data |
| Pseudocode block renders in monospace | MCQ-02 | Visual verification | Screenshot loop: verify `<pre>` block with College Board pseudocode styling |
| Choice scrambling shows correct answer in all positions | MCQ-03 | Statistical verification | Render 20+ times and verify correct answer appears in positions A-D |
| Score ring conic gradient renders correctly | MCQ-06 | Visual verification | Screenshot loop: verify at 0%, 50%, 100% accuracy |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
