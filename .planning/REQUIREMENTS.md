# Requirements: Ascendly

**Defined:** 2026-03-23
**Core Value:** Zero friction to practice — open and learn immediately, no barriers.

## v1 Requirements

### Shell & Navigation (Phase 1 — Complete)

- [x] **SHELL-01**: Homepage displays all 7 AP subjects as navigable cards
- [x] **SHELL-02**: Subject hub shows 4 mode cards (Drills, Practice, Study Guide, Practice Test)
- [x] **SHELL-03**: Unit progress grid with mastery bars per unit (localStorage-driven)
- [x] **SHELL-04**: Projected AP score badge (1–5) per subject
- [x] **SHELL-05**: Daily streak display
- [x] **SHELL-06**: Fixed header navigation across all pages
- [x] **SHELL-07**: Anonymous analytics (page_view event on subject hub)
- [x] **SHELL-08**: Responsive dark-theme UI (mobile-first, 375px→1440px)

### Drill Interface (Phase 2)

- [ ] **DRILL-01**: Student can select a unit and start a drill session
- [ ] **DRILL-02**: Drill card displays prompt; student types or reveals answer
- [ ] **DRILL-03**: Correct/incorrect feedback with fuzzy match (utils/fuzzyMatch.ts)
- [ ] **DRILL-04**: KaTeX rendering for formula drill cards (katex_required: true)
- [ ] **DRILL-05**: Session progresses through all cards in unit; no repeat until session ends
- [ ] **DRILL-06**: Results screen: score, cards mastered, retry missed cards CTA
- [ ] **DRILL-07**: Mastery written to localStorage on session complete (drillAccuracy update)
- [ ] **DRILL-08**: Supabase drill_complete event logged (fire-and-forget)
- [ ] **DRILL-09**: All 6 drill modes supported (definition_to_term, formula_to_type, etc.)

### Practice Questions Interface (Phase 3)

- [x] **MCQ-01**: Student can select a unit and start a MCQ session
- [x] **MCQ-02**: MCQ displays stimulus content (text, Chart.js graph, HTML table, pseudocode)
- [x] **MCQ-03**: 4 answer choices displayed; scrambled at render time (utils/scramble.ts)
- [x] **MCQ-04**: Submit answer → immediate feedback (correct/incorrect + explanation for all choices)
- [x] **MCQ-05**: Per-choice explanations shown: correct answer explanation + each distractor explanation
- [x] **MCQ-06**: Results screen with score and unit mastery update
- [x] **MCQ-07**: MCQ mastery written to localStorage (mcqAccuracy update)
- [x] **MCQ-08**: Supabase mcq_complete event logged

### Study Guide Interface (Phase 4)

- [x] **GUIDE-01**: Study guide per unit: theme → core concepts → key terms → formulas → exam tip
- [x] **GUIDE-02**: KaTeX rendering for all formulas
- [x] **GUIDE-03**: Unit selector navigation within subject
- [x] **GUIDE-04**: Supabase study_guide_view event logged

### Practice Test Interface (Phase 5)

- [ ] **TEST-01**: Full-length timed practice test per subject
- [ ] **TEST-02**: Timer display with auto-submit on expiry
- [ ] **TEST-03**: Score report with per-unit breakdown after submission
- [ ] **TEST-04**: Test results written to localStorage
- [ ] **TEST-05**: Supabase practice_test_complete event logged

### AP Psychology Content (Phase 6)

- [ ] **PSY-01**: Drill cards for all 8 units (≥20 cards/unit)
- [ ] **PSY-02**: MCQs for all 8 units (50–100/unit, 20% easy/45% medium/35% hard)
- [ ] **PSY-03**: Study guide for all 8 units
- [ ] **PSY-04**: All content reviewed by Reviewer subagent before integration

### AP World History Content (Phase 7)

- [ ] **WHI-01**: Drill cards for all 9 units
- [ ] **WHI-02**: MCQs for all 9 units (50–100/unit)
- [ ] **WHI-03**: Study guide for all 9 units
- [ ] **WHI-04**: All content Reviewer-approved

### AP Government Content (Phase 8)

- [ ] **GOV-01**: Drill cards for all 5 units
- [ ] **GOV-02**: MCQs for all 5 units (50–100/unit)
- [ ] **GOV-03**: Study guide for all 5 units
- [ ] **GOV-04**: All content Reviewer-approved

### AP Calculus AB Content (Phase 9)

- [ ] **CALC-01**: Drill cards for all 8 units (formula-heavy, KaTeX required)
- [ ] **CALC-02**: MCQs for all 8 units (50–100/unit)
- [ ] **CALC-03**: Study guide for all 8 units
- [ ] **CALC-04**: All KaTeX verified, Reviewer-approved

### AP Precalculus Content (Phase 10)

- [ ] **PRE-01**: Drill cards for all 4 units (KaTeX required)
- [ ] **PRE-02**: MCQs for all 4 units (50–100/unit)
- [ ] **PRE-03**: Study guide for all 4 units
- [ ] **PRE-04**: All KaTeX verified, Reviewer-approved

### AP CSP Content (Phase 11)

- [ ] **CSP-01**: Drill cards for all 5 units
- [ ] **CSP-02**: MCQs for all 5 units (50–100/unit); pseudocode in College Board format
- [ ] **CSP-03**: Study guide for all 5 units
- [ ] **CSP-04**: No Python/Java — College Board pseudocode only; Reviewer-approved

### AP Chemistry Content (Phase 12)

- [ ] **CHEM-01**: Drill cards for all 9 units (chemical equations in KaTeX)
- [ ] **CHEM-02**: MCQs for all 9 units (50–100/unit)
- [ ] **CHEM-03**: Study guide for all 9 units
- [ ] **CHEM-04**: Chemistry Checker subagent verifies all balanced equations + KaTeX
- [ ] **CHEM-05**: Reviewer-approved after Chemistry Checker sign-off

### Retention Mechanics & Polish (Phase 13)

- [ ] **POLISH-01**: Score calibration with College Board AP score distributions per subject
- [ ] **POLISH-02**: Adaptive difficulty: harder cards surfaced when totalAttempts > threshold
- [ ] **POLISH-03**: sessionStorage guard on analytics to prevent duplicate events
- [ ] **POLISH-04**: Accessibility audit: prefers-reduced-motion, focus rings, contrast
- [ ] **POLISH-05**: Error boundaries around content-rendering sections
- [ ] **POLISH-06**: Security headers in next.config.ts (CSP, X-Frame-Options)
- [ ] **POLISH-07**: Bundle analysis + dynamic imports for KaTeX and Chart.js

### Launch (Phase 14)

- [ ] **LAUNCH-01**: Vercel deployment live at ascendly.vercel.app
- [ ] **LAUNCH-02**: All Supabase environment variables configured in Vercel
- [ ] **LAUNCH-03**: All 7 subjects have complete content (all interface phases done)
- [ ] **LAUNCH-04**: No stub pages visible to users
- [ ] **LAUNCH-05**: loading.tsx stubs for all routes

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Adds friction; localStorage sufficient for v1 |
| Light mode | Dark-only by design decision; reduces complexity |
| Social features (sharing, leaderboards) | v2 consideration; adds complexity |
| Paid tiers / paywalls | Free forever is the value proposition |
| Native mobile app | Web is mobile-first; no app store friction |
| Real-time collaboration | Irrelevant to solo exam prep |
| Content editing UI / CMS | Agent-generated JSON pipeline is sufficient |
| Per-unit score breakdown in localStorage | Derived at render time from mastery keys |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-01 through SHELL-08 | Phase 1 | ✅ Complete |
| DRILL-01 through DRILL-09 | Phase 2 | Pending |
| MCQ-01 through MCQ-08 | Phase 3 | Pending |
| GUIDE-01 through GUIDE-04 | Phase 4 | Pending |
| TEST-01 through TEST-05 | Phase 5 | Pending |
| PSY-01 through PSY-04 | Phase 6 | Pending |
| WHI-01 through WHI-04 | Phase 7 | Pending |
| GOV-01 through GOV-04 | Phase 8 | Pending |
| CALC-01 through CALC-04 | Phase 9 | Pending |
| PRE-01 through PRE-04 | Phase 10 | Pending |
| CSP-01 through CSP-04 | Phase 11 | Pending |
| CHEM-01 through CHEM-05 | Phase 12 | Pending |
| POLISH-01 through POLISH-07 | Phase 13 | Pending |
| LAUNCH-01 through LAUNCH-05 | Phase 14 | Pending |

**Coverage:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after GSD initialization*
