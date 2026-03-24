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
| **Framework** | Next.js dev server + manual browser verification |
| **Config file** | next.config.ts |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build && npx next start` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build && npx next start`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | TEST-01 | build | `npx next build` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | TEST-02 | build | `npx next build` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 1 | TEST-03 | build | `npx next build` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 1 | TEST-04 | build | `npx next build` | ✅ | ⬜ pending |
| 05-03-01 | 03 | 2 | TEST-05 | build | `npx next build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Timer counts down and auto-submits | TEST-02 | Requires real-time UI interaction | Start test, wait for timer expiry, verify auto-submit |
| Question navigation grid updates state | TEST-03 | Visual state indicators | Navigate between questions, verify grid colors update |
| Score report shows per-unit breakdown | TEST-04 | Visual layout verification | Complete test, verify score report renders correctly |
| Test results persist in localStorage | TEST-05 | Browser storage interaction | Complete test, check localStorage keys, refresh page |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
