# Ascendly

## What This Is

Ascendly is a free AP exam prep web app for high school students — no signup, no accounts, no paywalls. Students practice drills (flashcard-style term recall), answer stimulus-based MCQs, read study guides, and take full practice tests across 7 AP subjects. All progress is stored locally in localStorage. Deployed on Vercel at ascendly.vercel.app.

## Core Value

**Zero friction to practice** — open the site and start learning immediately, no barrier between the student and the content.

## Requirements

### Validated

- ✓ Subject hub navigation with 7 AP subjects — Phase 1
- ✓ Unit progress tracking via localStorage mastery keys — Phase 1
- ✓ Projected AP score badge (1–5) per subject — Phase 1
- ✓ Daily streak tracking — Phase 1
- ✓ Anonymous analytics via Supabase (fire-and-forget) — Phase 1
- ✓ Responsive dark-theme UI with design system tokens — Phase 1

### Active

**Drill Interface (Phase 2)**
- [ ] Flashcard drill session for any subject/unit
- [ ] Free-response answer input with fuzzy match
- [ ] Drill state machine: unanswered → correct/incorrect → next
- [ ] Session results screen with score, mastery update, and retry flow
- [ ] localStorage mastery write on session complete

**Practice Questions (Phase 3)**
- [ ] Multiple-choice question interface with stimulus support
- [ ] Stimulus types: text, Chart.js graph, HTML table, pseudocode (CSP)
- [ ] Per-choice explanations on submit (correct + distractors)
- [ ] MCQ mastery tracking to localStorage

**Study Guide (Phase 4)**
- [ ] Theme → core concepts → key terms → formulas → exam tip structure
- [ ] KaTeX formula rendering
- [ ] Unit-by-unit navigation

**Practice Test (Phase 5)**
- [ ] Full-length timed test per subject
- [ ] Timed mode with auto-submit
- [ ] Score report with per-unit breakdown

**Content (Phases 6–12)**
- [ ] AP Psychology: drills + MCQs + study guide per unit (8 units)
- [ ] AP World History: drills + MCQs + study guide per unit (9 units)
- [ ] AP Government: drills + MCQs + study guide per unit (5 units)
- [ ] AP Calculus AB: drills + MCQs + study guide per unit (8 units)
- [ ] AP Precalculus: drills + MCQs + study guide per unit (4 units)
- [ ] AP CSP: drills + MCQs + study guide per unit (5 units)
- [ ] AP Chemistry: drills + MCQs + study guide per unit (9 units)

**Polish (Phase 13)**
- [ ] Score calibration with real AP thresholds
- [ ] Adaptive difficulty based on mastery
- [ ] sessionStorage deduplication for analytics
- [ ] Accessibility audit (prefers-reduced-motion, focus states, contrast)

### Out of Scope

- **User accounts / authentication** — adds friction, contradicts core value. localStorage is sufficient.
- **Light mode** — dark only by design. Reduces complexity.
- **Social features (sharing, leaderboards)** — v2 consideration at earliest.
- **Paid tiers / paywalls** — free forever is the value proposition.
- **Native mobile app** — web is mobile-first. No app store friction.
- **Real-time collaboration** — irrelevant to solo exam prep.
- **Content editing UI** — content managed via JSON files + agent pipeline.

## Context

- **Codebase:** Next.js 14 (App Router), TypeScript strict, Tailwind v4, localStorage-first
- **Phase 1 complete:** Subject hub, navigation shell, all UI components, mastery/streak/score display
- **Content pipeline:** Researcher → Writer → Reviewer (+ Chemistry Checker) subagents per unit
- **Agent team:** Planner → Coder → Reviewer → Tester (enforced for all implementation)
- **Design system:** `design-system/ascendly/MASTER.md` — canonical. Read before any UI work.
- **Codebase map:** `.planning/codebase/` — 7 documents written 2026-03-23

## Constraints

- **Tech stack:** Next.js 14 + TypeScript + Tailwind v4 — no changes. Locked.
- **Storage:** localStorage only — no user database, no server state for user data.
- **Analytics:** Supabase fire-and-forget only — no blocking calls, no PII.
- **Formulas:** KaTeX always — never plain text math.
- **CSP pseudocode:** College Board pseudocode format only — never Python/Java.
- **Deployment:** Vercel free tier — no paid infrastructure.
- **Bundle:** KaTeX + Chart.js are heavy — dynamic imports required before Phase 3 ships.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| localStorage over database | No signup friction; free tier constraints | ✓ Good |
| Tailwind v4 (no config file) | Simpler setup, @theme directive | ✓ Good |
| Supabase via server Route Handler | Keeps anon key out of client bundle | ✓ Good |
| Subjects hardcoded in subjects.ts | No CMS complexity; fast, type-safe | ✓ Good |
| force-dynamic on subject page | Prevents stale exam countdown at build time | ✓ Good |
| Lucide React for icons | No emojis; consistent SVG library | ✓ Good |
| Content as JSON files | No CMS; agent-generated; schema-validated | — Pending |
| Answer scrambling at render time | Prevents positional bias; CLAUDE.md rule | ✓ Good |

---
*Last updated: 2026-03-23 after GSD initialization (brownfield — Phase 1 complete)*
