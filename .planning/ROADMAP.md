# Roadmap: Ascendly v1.0

**Created:** 2026-03-23
**Goal:** Launch Ascendly at ascendly.vercel.app with complete AP prep content for 7 subjects.

## Phase Overview

| Phase | Name | Status | Requirements |
|-------|------|--------|-------------|
| 1 | Core Shell & Navigation | ✅ Complete | SHELL-01–08 |
| 2 | Drill Interface | 🔲 Not Started | DRILL-01–09 |
| 3 | Practice Questions Interface | 🔲 Not Started | MCQ-01–08 |
| 4 | Study Guide Interface | 🔲 Not Started | GUIDE-01–04 |
| 5 | Practice Test Interface | 🔲 Not Started | TEST-01–05 |
| 6 | AP Psychology Content | 🔲 Not Started | PSY-01–04 |
| 7 | AP World History Content | 🔲 Not Started | WHI-01–04 |
| 8 | AP Government Content | 🔲 Not Started | GOV-01–04 |
| 9 | AP Calculus AB Content | 🔲 Not Started | CALC-01–04 |
| 10 | AP Precalculus Content | 🔲 Not Started | PRE-01–04 |
| 11 | AP CSP Content | 🔲 Not Started | CSP-01–04 |
| 12 | AP Chemistry Content | 🔲 Not Started | CHEM-01–05 |
| 13 | Retention Mechanics & Polish | 🔲 Not Started | POLISH-01–07 |
| 14 | Launch | 🔲 Not Started | LAUNCH-01–05 |

---

## Phase 1 — Core Shell & Navigation ✅ Complete

**Goal:** Working navigation shell with all routes stubbed, design system, subject data, and progress tracking components.

**Completed:**
- Homepage with subject grid
- Subject hub with mode cards, unit progress, projected score badge, streak
- Fixed header
- localStorage utilities, analytics, scoring utilities
- All stub pages at correct routes
- Design system (globals.css, MASTER.md)

---

## Phase 2 — Drill Interface

**Goal:** A student can navigate to any subject → unit, complete a full drill session, get feedback on each card, see results, and have mastery updated in localStorage.

**Scope:**
- Drill session page at `app/[subject]/drills/page.tsx` (replace stub)
- Unit selector UI
- Flashcard component with flip/reveal interaction
- Free-response input with fuzzy match
- State machine: unanswered → correct/incorrect → next card
- Results screen with score, missed cards list, retry CTA
- localStorage mastery write (drillAccuracy)
- All 6 drill modes from drill.schema.json
- KaTeX rendering for formula cards (katex_required: true)
- Supabase drill_complete event

**Dependencies:** Phase 1 ✅

**Success criteria:**
- Student can complete a drill session start-to-finish
- Fuzzy match correctly accepts/rejects edge cases (verified by tests)
- Mastery updates correctly in localStorage after session
- KaTeX renders without errors for formula cards
- No positional bias in answer scrambling (20+ renders verified)

---

## Phase 3 — Practice Questions Interface

**Goal:** A student can answer stimulus-based MCQs for any unit, see per-choice explanations, and have MCQ mastery tracked.

**Scope:**
- MCQ session page at `app/[subject]/practice/page.tsx`
- Stimulus rendering: text, Chart.js graph, HTML table, CB pseudocode
- 4-choice MCQ with runtime scrambling
- Submit → feedback with all-choice explanations
- Results screen with score and mastery update
- localStorage mcqAccuracy write

**Dependencies:** Phase 1 ✅, Phase 2 recommended

**Success criteria:**
- All 4 stimulus types render correctly
- Scrambling shows correct answer in all positions across 20+ renders
- All 4 choice explanations displayed on submit
- Mastery updates correctly after session

---

## Phase 4 — Study Guide Interface

**Goal:** A student can read a structured study guide per unit with KaTeX formulas rendered.

**Scope:**
- Study guide page at `app/[subject]/study-guide/page.tsx`
- Unit selector navigation
- Theme → core concepts → key terms → formulas → exam tip layout
- KaTeX for all formulas
- Analytics event

**Dependencies:** Phase 1 ✅

---

## Phase 5 — Practice Test Interface

**Goal:** A student can take a full-length timed practice test and receive a score report.

**Scope:**
- Practice test page at `app/[subject]/practice-test/page.tsx`
- Timer with auto-submit
- Score report with per-unit breakdown (derived from mastery keys)
- localStorage test results write

**Dependencies:** Phases 1–3

---

## Phases 6–12 — Content (Parallel Execution)

**Goal:** Complete AP content for all 7 subjects — drills, MCQs, study guides per unit.

**Agent pipeline (enforced):** Researcher → Writer → Reviewer (→ Chemistry Checker for Phase 12)

**Content standards:**
- MCQ difficulty: 20% easy / 45% medium / 35% hard per unit
- MCQ count: 50–100 per unit
- Drills: cover every testable term, formula, person, concept, event
- All KaTeX strings parseable without errors
- All answer keys correct (Reviewer-verified)

**Phase 6 — AP Psychology** (8 units)
- Units: Biological Bases, Sensation/Perception, Learning, Cognitive Psych, Developmental, Motivation/Emotion/Personality, Clinical, Social

**Phase 7 — AP World History** (9 units)
- Units: Global Tapestry, Networks of Exchange, Land-Based Empires, Transoceanic Interconnections, Revolutions, Industrialization, Global Conflict, Cold War/Decolonization, Globalization

**Phase 8 — AP Government** (5 units)
- Units: Foundations, Branches of Government, Civil Liberties/Rights, Political Ideologies, Political Participation

**Phase 9 — AP Calculus AB** (8 units, KaTeX-heavy)
- Units: Limits, Differentiation (basic), Differentiation (composite/implicit/inverse), Contextual Differentiation, Analytical Differentiation, Integration, Differential Equations, Applications of Integration

**Phase 10 — AP Precalculus** (4 units, KaTeX-heavy)
- Units: Polynomial/Rational Functions, Exponential/Logarithmic, Trigonometric/Polar, Parameters/Vectors/Matrices

**Phase 11 — AP CSP** (5 units, College Board pseudocode)
- Units: Creative Development, Data, Algorithms/Programming, Computer Systems/Networks, Impact of Computing

**Phase 12 — AP Chemistry** (9 units, Chemistry Checker required)
- Units: Atomic Structure, Molecular/Ionic Structure, Intermolecular Forces, Chemical Reactions, Kinetics, Thermodynamics, Equilibrium, Acids/Bases, Applications of Thermodynamics

**Dependencies:** Phases 2–4 must be complete before content is useful to students. Content phases can run in parallel with each other.

---

## Phase 13 — Retention Mechanics & Polish

**Goal:** Calibrate scoring, add adaptive difficulty, fix accessibility gaps, and harden the app for launch.

**Scope:**
- Score calibration with real College Board AP distributions
- Adaptive difficulty (surface harder cards when totalAttempts > threshold)
- sessionStorage guard on analytics (prevent duplicate events)
- Accessibility: prefers-reduced-motion, focus rings, ARIA audit
- Error boundaries around content-rendering sections
- Security headers (CSP, X-Frame-Options) in next.config.ts
- Bundle analysis + dynamic imports for KaTeX/Chart.js
- Fix raw localStorage access in UnitProgressGrid (use lsGet)
- loading.tsx for all routes

**Dependencies:** Phases 2–12

---

## Phase 14 — Launch

**Goal:** Ascendly is live at ascendly.vercel.app, fully functional, no placeholder content.

**Scope:**
- Vercel deployment with all environment variables
- Smoke test all 7 subjects across all 4 modes
- Verify no stub pages visible
- Final analytics check (events flowing to Supabase)

**Dependencies:** All previous phases ✅

---

## Execution Notes

**Parallel opportunities:**
- Phases 6–12 can run in parallel once Phase 2–4 interfaces are ready
- Within each content phase, units can be generated in parallel (multiple units simultaneously)

**Model profile:** balanced (Opus for planning, Sonnet for execution)

**Commit strategy:** Each phase gets a conventional commit after verification. Planning docs committed separately.

---
*Roadmap created: 2026-03-23*
*Last updated: 2026-03-23 after GSD initialization*
