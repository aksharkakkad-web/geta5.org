# Ascendly — Requirements

> Project overview, tech stack, constraints, decisions → `CLAUDE.md` (auto-loaded).
> This file tracks only requirements and scope boundaries.

## Requirements

### Validated

- ✓ Subject hub navigation with 7 AP subjects — Phase 1
- ✓ Unit progress tracking via localStorage mastery keys — Phase 1
- ✓ Projected AP score badge (1–5) per subject — Phase 1
- ✓ Daily streak tracking — Phase 1
- ✓ Anonymous analytics via Supabase (fire-and-forget) — Phase 1
- ✓ Responsive dark-theme UI with design system tokens — Phase 1
- ✓ Flashcard drill session with fuzzy match — Phase 2
- ✓ Drill state machine: unanswered → correct/incorrect → next — Phase 2
- ✓ Session results screen with score, mastery update, retry — Phase 2
- ✓ localStorage mastery write on drill session complete — Phase 2
- ✓ MCQ interface with stimulus support (text, table, graph, pseudocode) — Phase 3
- ✓ Per-choice explanations on submit (correct + distractors) — Phase 3
- ✓ MCQ mastery tracking to localStorage — Phase 3

### Active

**Study Guide (Phase 4)**
- [ ] Theme → core concepts → key terms → formulas → exam tip structure
- [ ] KaTeX formula rendering in study guide content
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

- **User accounts / authentication** — adds friction, contradicts core value
- **Light mode** — dark only by design
- **Social features (sharing, leaderboards)** — v2 consideration
- **Paid tiers / paywalls** — free forever
- **Native mobile app** — web is mobile-first, no app store friction
- **Real-time collaboration** — irrelevant to solo exam prep
- **Content editing UI** — content managed via JSON files + agent pipeline

---
*Last updated: 2026-03-24 — Phase 2 & 3 requirements validated*
