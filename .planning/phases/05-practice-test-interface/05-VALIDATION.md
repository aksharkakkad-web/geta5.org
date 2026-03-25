---
phase: 5
slug: practice-test-interface
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (unit tests) + TypeScript compiler (type checks) + manual browser verification |
| **Config file** | next.config.ts, tsconfig.json |
| **Quick run command** | `npx jest --passWithNoTests` |
| **Full suite command** | `npx jest --passWithNoTests && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --passWithNoTests`
- **After every plan wave:** Run `npx jest --passWithNoTests && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | TEST-01, TEST-04 | unit (TDD) | `npx jest utils/__tests__/testConfig.test.ts -x` | ❌ W0 (created in Plan 01 RED phase) | ⬜ pending |
| 05-01-02 | 01 | 1 | TEST-03, TEST-04, TEST-05 | unit (TDD) | `npx jest utils/__tests__/testSession.test.ts -x` | ❌ W0 (created in Plan 01 RED phase) | ⬜ pending |
| 05-02-01 | 02 | 2 | TEST-01, TEST-02 | typecheck | `npx tsc --noEmit --project tsconfig.json 2>&1 \| head -30` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | TEST-02, TEST-03, TEST-04 | typecheck | `npx tsc --noEmit --project tsconfig.json 2>&1 \| head -30` | ✅ | ⬜ pending |
| 05-03-01 | 03 | 3 | TEST-01–05 | manual | Screenshot loop checkpoint | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Test stubs are created within Plan 01's TDD RED phase (not pre-existing):

- [ ] `utils/__tests__/testConfig.test.ts` — unit tests for AP exam config constants and composeTest sampling
- [ ] `utils/__tests__/testSession.test.ts` — unit tests for computePerUnitAccuracy, handleTestComplete, localStorage writes

*These are created as the first step of Plan 01 execution (RED → GREEN → REFACTOR). No pre-existing stubs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Timer counts down and auto-submits | TEST-02 | Requires real-time UI interaction | Start test, wait for timer expiry, verify auto-submit |
| Question navigation grid updates state | TEST-03 | Visual state indicators | Navigate between questions, verify grid colors update |
| Score report shows per-unit breakdown | TEST-03 | Visual layout verification | Complete test, verify score report renders correctly |
| Results persist in localStorage | TEST-04 | Browser storage interaction | Complete test, check localStorage keys, refresh page |
| Analytics event fires | TEST-05 | Network tab verification | Complete test, check Supabase event in Network tab |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
