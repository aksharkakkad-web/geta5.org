---
phase: 2
slug: drill-interface
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest ^30.3.0 + ts-jest ^29.4.6 |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npm test -- --testPathPattern=utils` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=utils`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | 01 | 0 | DRILL-07, DRILL-08 | unit | `npm test -- --testPathPattern=drillSession` | ❌ W0 | ⬜ pending |
| 02-W0-02 | 01 | 0 | DRILL-01 (fixture) | manual | — | ❌ W0 | ⬜ pending |
| 02-01-01 | 01 | 1 | DRILL-01 | manual (screenshot) | — | N/A | ⬜ pending |
| 02-01-02 | 01 | 1 | DRILL-09 | manual (screenshot) | — | N/A | ⬜ pending |
| 02-01-03 | 01 | 2 | DRILL-02 | manual (screenshot) | — | N/A | ⬜ pending |
| 02-01-04 | 01 | 2 | DRILL-03 | unit | `npm test -- --testPathPattern=fuzzyMatch` | ✅ | ⬜ pending |
| 02-01-05 | 01 | 2 | DRILL-04 | manual (screenshot) | — | N/A | ⬜ pending |
| 02-01-06 | 01 | 2 | DRILL-05 | manual (screenshot) | — | N/A | ⬜ pending |
| 02-02-01 | 02 | 3 | DRILL-06 | manual (screenshot) | — | N/A | ⬜ pending |
| 02-02-02 | 02 | 3 | DRILL-07 | unit | `npm test -- --testPathPattern=drillSession` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 3 | DRILL-08 | unit | `npm test -- --testPathPattern=drillSession` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `utils/__tests__/drillSession.test.ts` — covers DRILL-07 (mastery write guards: no write on retry or Study All) and DRILL-08 (logEvent fires with correct `is_retry` flag and `unit: 'all'` for Study All)
- [ ] `public/data/ap-psychology/drills/unit-1.json` — minimum viable drill fixture JSON (5 cards: mix of modes, one with `katex_required: true`, one with `alternate_answers`) for integration testing

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Unit selector renders gradient art, card count, mastery bar | DRILL-01 | Visual component; no component test infra | Screenshot loop — unit selector view in browser |
| "Coming soon" card for 404 units | DRILL-01 | Requires real fetch failure | Load subject with no unit JSON; confirm card shows disabled "Coming soon" |
| Drill card 4-state transitions (idle→typing→correct/wrong) | DRILL-02 | Visual state machine | Screenshot each state for one card |
| KaTeX renders in prompts and katex_required answers | DRILL-04 | Visual math rendering | Confirm formula in test fixture renders as KaTeX, not literal `$...$` |
| All 6 mode tags display correct labels | DRILL-09 | Visual label check | Verify mode tag in card header matches locked mode→label map |
| Results screen: score ring, missed cards, CTAs | DRILL-06 | Visual layout | Screenshot results view with >0 missed and 0 missed cases |
| Mobile layout at 375px and 768px | DRILL-01–06 | Viewport-specific visual | Resize browser to each breakpoint; screenshot unit selector, session, results |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
