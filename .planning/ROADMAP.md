# Roadmap: Ascendly

## Overview

Build a complete free AP exam prep web app — no signup, no accounts, no paywalls. Phase 1 delivered the navigation shell and design system. Phases 2–5 build the four practice interfaces (drills, MCQ, study guide, practice test). Phases 6–12 generate content for all 7 subjects via **parallel wave execution** (see `.planning/CONTENT-WAVES.md`). Phase 13 polishes retention mechanics, and Phase 14 launches at ascendly.vercel.app.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Core Shell & Navigation** - Subject hub, nav, design system, localStorage utilities
- [x] **Phase 2: Drill Interface** - Flashcard drill sessions with fuzzy match and mastery tracking
- [x] **Phase 3: Practice Questions Interface** - Stimulus-based MCQ with per-choice explanations
- [x] **Phase 4: Study Guide Interface** - Per-unit study guides with KaTeX formulas
- [x] **Phase 5: Practice Test Interface** - Full-length timed practice tests with score reports
- [ ] **Wave 1 (parallel):**
  - [ ] **Phase 6: AP Psychology Content** - 8 units — drills + MCQs + study guides
  - [ ] **Phase 7: AP World History Content** - 9 units — drills + MCQs + study guides
  - [ ] **Phase 8: AP Government Content** - 5 units — drills + MCQs + study guides
  - [ ] **Phase 11: AP CSP Content** - 5 units — drills + MCQs + study guides (CB pseudocode)
- [ ] **Wave 2 (parallel):**
  - [ ] **Phase 9: AP Calculus AB Content** - 8 units — KaTeX-heavy drills + MCQs + study guides
  - [ ] **Phase 10: AP Precalculus Content** - 4 units — KaTeX-heavy drills + MCQs + study guides
  - [ ] **Phase 12: AP Chemistry Content** - 9 units — Chemistry Checker required
- [ ] **Phase 13: Retention Mechanics & Polish** - Score calibration, adaptive difficulty, accessibility
- [ ] **Phase 14: Launch** - Deploy to ascendly.vercel.app, smoke test, verify all routes live

## Phase Details

### Phase 1: Core Shell & Navigation
**Goal**: Working navigation shell with all routes stubbed, design system, subject data, progress tracking components, localStorage utilities, and analytics infrastructure.
**Depends on**: Nothing (first phase)
**Requirements**: [SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, SHELL-06, SHELL-07, SHELL-08]
**Success Criteria** (what must be TRUE):
  1. User can navigate to any subject hub and see mode cards
  2. Unit progress grid renders mastery bars from localStorage
  3. Projected score badge reads from localStorage
  4. Streak strip shows daily streak count
  5. All 7 subjects accessible via slug routes
**Plans**: Complete

Plans:
- [x] 01-01: Subject hub page with mode cards, unit progress grid, projected score badge

### Phase 2: Drill Interface
**Goal**: A student can navigate to any subject/unit, complete a full drill session with fuzzy-matched free-response answers, see per-card feedback, view a results screen, and have drillAccuracy updated in localStorage.
**Depends on**: Phase 1
**Requirements**: [DRILL-01, DRILL-02, DRILL-03, DRILL-04, DRILL-05, DRILL-06, DRILL-07, DRILL-08, DRILL-09]
**Success Criteria** (what must be TRUE):
  1. Student can select a unit and start a drill session from the drills page
  2. Each card shows prompt; student types answer; fuzzy match accepts correct variants
  3. KaTeX renders correctly for formula drill cards
  4. Session progresses through all cards; results screen shows score and missed cards
  5. drillAccuracy updated in localStorage after session completes
  6. Supabase drill_complete event fires (fire-and-forget)
**Plans**: 3 plans

Plans:
- [x] 02-01: Foundation — test stubs, fixture JSON, DrillCard + DrillSession components
- [x] 02-02: UnitSelector, DrillResults, page orchestrator wiring
- [ ] 02-03: Screenshot loops and visual verification

### Phase 3: Practice Questions Interface
**Goal**: A student can answer stimulus-based MCQs (text, graph, table, pseudocode stimuli), see per-choice explanations on submit, and have mcqAccuracy updated in localStorage.
**Depends on**: Phase 1
**Requirements**: [MCQ-01, MCQ-02, MCQ-03, MCQ-04, MCQ-05, MCQ-06, MCQ-07, MCQ-08]
**Success Criteria** (what must be TRUE):
  1. Student can start an MCQ session for any unit
  2. All 4 stimulus types render correctly (text, Chart.js, table, pseudocode)
  3. Answer choices scrambled at render time; correct answer appears in all positions across renders
  4. All 4 choice explanations shown on submit
  5. mcqAccuracy updated in localStorage after session
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — MCQ types, session logic with tests, StimulusRenderer, MCQCard
- [x] 03-02-PLAN.md — UnitSelector, MCQSession, MCQResults, page orchestrator

### Phase 4: Study Guide Interface
**Goal**: A student can read a structured per-unit study guide with sidebar navigation, KaTeX-rendered formulas, and section-by-section reading pane.
**Depends on**: Phase 1
**Requirements**: [GUIDE-01, GUIDE-02, GUIDE-03, GUIDE-04]
**Success Criteria** (what must be TRUE):
  1. Study guide renders theme -> core concepts -> key terms -> formulas -> exam tip structure
  2. All formulas rendered via KaTeX (no plain text math)
  3. Unit selector allows switching between units within a subject
  4. Supabase study_guide_view event fires on unit load
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — Types, InlineKatex, section renderers, SidebarNav, StudyGuideReader, fixture JSON
- [x] 04-02-PLAN.md — StudyGuideUnitSelector, page orchestrator, analytics wiring

### Phase 5: Practice Test Interface
**Goal**: A student can take a full-length timed practice test per subject and receive a score report with per-unit breakdown.
**Depends on**: Phase 3
**Requirements**: [TEST-01, TEST-02, TEST-03, TEST-04, TEST-05]
**Success Criteria** (what must be TRUE):
  1. Timer counts down and auto-submits on expiry
  2. Score report shows total score and per-unit breakdown
  3. Test results written to localStorage
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Test config constants + session logic with TDD (testConfig.ts, testSession.ts)
- [x] 05-02-PLAN.md — UI components (TestSetup, TestTimer, TestNavGrid, TestSession, TestResults) + page orchestrator
- [x] 05-03-PLAN.md — Screenshot verification of all 3 views

### Phase 6: AP Psychology Content
**Goal**: Complete drill cards, MCQs, and study guides for all AP Psychology units, reviewed and committed from CED PDF source.
**Wave**: 1 (parallel with Phases 7, 8, 11)
**Depends on**: Phases 2, 3, 4 (UI interfaces must exist)
**Requirements**: [PSY-01, PSY-02, PSY-03, PSY-04]
**Success Criteria** (what must be TRUE):
  1. `meta.json` exists with all units, CB percentages, learning objectives (count from CED PDF)
  2. Drill JSON files exist for all units (every testable term/concept covered)
  3. MCQ JSON files exist for all units (50-100 per unit, 20/45/35 difficulty split)
  4. Study guide JSON files exist for all units
  5. All content passes G1–G8, G8b, G8c, G8d quality gates (see CONTENT-WAVES.md)
  6. Content Reviewer subagent (Sonnet) has signed off
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Researcher (CED PDF → RESEARCH.md + meta-draft.json) + Content Planner (RESEARCH.md → PLAN.md)
- [ ] 06-02-PLAN.md — Writer (all units: drills + MCQs + study guides) + Reviewer (Sonnet, G1–G8, G8b, G8c, G8d) + commit to content/ap-psychology

### Phase 7: AP World History Content
**Goal**: Complete content for all 9 AP World History units.
**Wave**: 1 (parallel with Phases 6, 8, 11)
**Depends on**: Phases 2, 3, 4
**Requirements**: [WHI-01, WHI-02, WHI-03, WHI-04]
**Success Criteria** (what must be TRUE):
  1. `meta.json` exists with all 9 units, CB percentages, learning objectives
  2. Drill, MCQ, and study guide JSON files exist for all 9 units
  3. All content passes G1–G8 quality gates
  4. Content Reviewer subagent has signed off
**Plans**: 2 plans

Plans:
- [ ] 07-01: Research (CED brief + meta.json) + Units 1-5 content
- [ ] 07-02: Units 6-9 content

### Phase 8: AP Government Content
**Goal**: Complete content for all 5 AP Government units.
**Wave**: 1 (parallel with Phases 6, 7, 11)
**Depends on**: Phases 2, 3, 4
**Requirements**: [GOV-01, GOV-02, GOV-03, GOV-04]
**Success Criteria** (what must be TRUE):
  1. `meta.json` exists with all 5 units, CB percentages, learning objectives
  2. Drill, MCQ, and study guide JSON files exist for all 5 units
  3. All content passes G1–G8 quality gates
  4. Content Reviewer subagent has signed off
**Plans**: 1 plan

Plans:
- [ ] 08-01: Research (CED brief + meta.json) + Units 1-5 content

### Phase 9: AP Calculus AB Content
**Goal**: Complete KaTeX-heavy content for all 8 AP Calculus AB units.
**Wave**: 2 (parallel with Phases 10, 12)
**Depends on**: Phases 2, 3, 4 + Wave 1 gate check
**Requirements**: [CALC-01, CALC-02, CALC-03, CALC-04]
**Success Criteria** (what must be TRUE):
  1. `meta.json` exists with all 8 units, CB percentages, learning objectives
  2. Drill, MCQ, and study guide JSON files exist for all 8 units
  3. All KaTeX strings parse without errors
  4. All content passes G1–G8 quality gates
  5. Content Reviewer subagent has signed off
**Plans**: 2 plans

Plans:
- [ ] 09-01: Research (CED brief + meta.json) + Units 1-4 content (KaTeX)
- [ ] 09-02: Units 5-8 content (KaTeX)

### Phase 10: AP Precalculus Content
**Goal**: Complete KaTeX-heavy content for all 4 AP Precalculus units.
**Wave**: 2 (parallel with Phases 9, 12)
**Depends on**: Phases 2, 3, 4 + Wave 1 gate check
**Requirements**: [PRE-01, PRE-02, PRE-03, PRE-04]
**Success Criteria** (what must be TRUE):
  1. `meta.json` exists with all 4 units, CB percentages, learning objectives
  2. Drill, MCQ, and study guide JSON files exist for all 4 units
  3. All KaTeX strings parse without errors
  4. All content passes G1–G8 quality gates
  5. Content Reviewer subagent has signed off
**Plans**: 1 plan

Plans:
- [ ] 10-01: Research (CED brief + meta.json) + Units 1-4 content (KaTeX)

### Phase 11: AP CSP Content
**Goal**: Complete content for all 5 AP CSP units using College Board pseudocode format.
**Wave**: 1 (parallel with Phases 6, 7, 8)
**Depends on**: Phases 2, 3, 4
**Requirements**: [CSP-01, CSP-02, CSP-03, CSP-04]
**Success Criteria** (what must be TRUE):
  1. `meta.json` exists with all 5 units, CB percentages, learning objectives
  2. Drill, MCQ, and study guide JSON files exist for all 5 units
  3. No Python or Java in any MCQ — College Board pseudocode format only (Critical Rule #5)
  4. All content passes G1–G9 quality gates (G9 = pseudocode check)
  5. Content Reviewer subagent has signed off
**Plans**: 1 plan

Plans:
- [ ] 11-01: Research (CED brief + meta.json) + Units 1-5 content (College Board pseudocode)

### Phase 12: AP Chemistry Content
**Goal**: Complete content for all 9 AP Chemistry units with Chemistry Checker verification of all equations.
**Wave**: 2 (parallel with Phases 9, 10)
**Depends on**: Phases 2, 3, 4 + Wave 1 gate check
**Requirements**: [CHEM-01, CHEM-02, CHEM-03, CHEM-04, CHEM-05]
**Success Criteria** (what must be TRUE):
  1. `meta.json` exists with all 9 units, CB percentages, learning objectives
  2. Drill, MCQ, and study guide JSON files exist for all 9 units
  3. Chemistry Checker subagent signs off on all balanced equations and KaTeX
  4. All content passes G1–G10 quality gates (G10 = Chemistry Checker)
  5. Content Reviewer subagent has signed off after Chemistry Checker
**Plans**: 2 plans

Plans:
- [ ] 12-01: Research (CED brief + meta.json) + Units 1-5 content (Chem Checker)
- [ ] 12-02: Units 6-9 content (Chem Checker)

### Phase 13: Retention Mechanics & Polish
**Goal**: Calibrate AP scoring, add adaptive difficulty, fix accessibility gaps, and harden the app for production.
**Depends on**: Phase 12 (all content phases complete)
**Requirements**: [POLISH-01, POLISH-02, POLISH-03, POLISH-04, POLISH-05, POLISH-06, POLISH-07]
**Success Criteria** (what must be TRUE):
  1. Score projection uses College Board-calibrated thresholds per subject
  2. Adaptive difficulty surfaces harder cards after totalAttempts exceeds threshold
  3. prefers-reduced-motion respected across all animations
  4. Error boundaries prevent full page crashes from bad content
  5. Bundle analysis run; KaTeX/Chart.js use dynamic imports
**Plans**: 2 plans

Plans:
- [ ] 13-01: Score calibration and adaptive difficulty
- [ ] 13-02: Accessibility, error boundaries, bundle optimization

### Phase 14: Launch
**Goal**: Ascendly is live at ascendly.vercel.app, all 7 subjects fully functional, no placeholder content visible.
**Depends on**: Phase 13
**Requirements**: [LAUNCH-01, LAUNCH-02, LAUNCH-03, LAUNCH-04, LAUNCH-05]
**Success Criteria** (what must be TRUE):
  1. ascendly.vercel.app loads and all 7 subjects are accessible
  2. No stub pages visible to users
  3. Supabase events flowing (page_view events recorded)
  4. All 4 modes functional for all 7 subjects
**Plans**: 1 plan

Plans:
- [ ] 14-01: Vercel deployment and smoke test

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Shell & Navigation | 1/1 | Complete | 2026-03-22 |
| 2. Drill Interface | 3/3 | Complete | 2026-03-24 |
| 3. Practice Questions Interface | 2/2 | Complete | 2026-03-24 |
| 4. Study Guide Interface | 2/2 | Complete | 2026-03-24 |
| 5. Practice Test Interface | 3/3 | Complete | 2026-03-25 |
| Session Persistence | — | Complete (feat branch) | 2026-03-26 |
| **Pre-Wave Blocker** | | | |
| DrillCard new modes + study guide key terms refactor | — | Not started | - |
| **Wave 1** | | | |
| 6. AP Psychology Content | 0/2 | Not started | - |
| 7. AP World History Content | 0/1 | Not started | - |
| 8. AP Government Content | 0/1 | Not started | - |
| 11. AP CSP Content | 0/1 | Not started | - |
| **Wave 2** | | | |
| 9. AP Calculus AB Content | 0/1 | Not started | - |
| 10. AP Precalculus Content | 0/1 | Not started | - |
| 12. AP Chemistry Content | 0/1 | Not started | - |
| **Post-Content** | | | |
| 13. Retention Mechanics & Polish | 0/2 | Not started | - |
| 14. Launch | 0/1 | Not started | - |
