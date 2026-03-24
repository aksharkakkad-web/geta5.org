---
phase: 3
slug: practice-questions-interface
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing in project) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | MCQ-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | MCQ-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | MCQ-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | MCQ-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | MCQ-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | MCQ-06, MCQ-07 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 2 | MCQ-08 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `utils/__tests__/mcqSession.test.ts` — stubs for MCQ session logic
- [ ] Existing vitest infrastructure covers test execution

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
