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
- ✓ Study guide renders theme → core concepts → formulas → exam tip structure — Phase 4
- ✓ KaTeX formula rendering in study guide content — Phase 4
- ✓ Unit-by-unit navigation — Phase 4
- ✓ Full-length timed practice test per subject — Phase 5
- ✓ Timed mode with auto-submit — Phase 5
- ✓ Score report with per-unit breakdown — Phase 5
- ✓ Session auto-save to localStorage draft keys (drill, MCQ, test) — feat/session-persistence
- ✓ Resume prompt shown when draft exists — feat/session-persistence

### Active

**Drill/MCQ Schema + Component Updates (pre-content blocker)**
- [ ] DrillCard: `name_to_formula` mode — simple notation input, live KaTeX preview, formatting help modal
- [ ] DrillCard: `concept_mc` mode — multiple choice UI within drill session
- [ ] Formula notation parser utility (^ exponents, sqrt(), +-, int(), Delta, etc. → KaTeX)
- [ ] Study guide: key terms section reads from `is_key_term: true` drill cards (remove key_terms array rendering)
- [ ] data/schemas/drill.schema.json updated (done 2026-03-26)
- [ ] data/schemas/study-guide.schema.json updated (done 2026-03-26)
- [ ] Existing public/data/ content discarded (all content regenerated per new spec)

**Content — Wave 1 (Phases 6, 7, 8, 11 — parallel) — blocked until above complete**
- [ ] AP Psychology: meta.json + drills + MCQs + study guide per unit (8 units)
- [ ] AP World History: meta.json + drills + MCQs + study guide per unit (9 units)
- [ ] AP Government: meta.json + drills + MCQs + study guide per unit (5 units) — RESEARCH.md exists
- [ ] AP CSP: meta.json + drills + MCQs + study guide per unit (5 units) — CB pseudocode only; RESEARCH.md exists

**Content — Wave 2 (Phases 9, 10, 12 — parallel after Wave 1 gate)**
- [ ] AP Calculus AB: meta.json + drills + MCQs + study guide per unit (8 units) — KaTeX-heavy
- [ ] AP Precalculus: meta.json + drills + MCQs + study guide per unit (4 units) — KaTeX-heavy
- [ ] AP Chemistry: meta.json + drills + MCQs + study guide per unit (9 units) — Chemistry Checker required

**Content quality gates (all subjects):**
- [ ] Every JSON file validates against `data/schemas/*.schema.json`
- [ ] Difficulty distribution: 20% easy / 45% medium / 35% hard (±5%)
- [ ] 50–100 MCQs per unit, drill modes per subject profile, is_key_term 8–15 per unit
- [ ] Per-choice explanations on all MCQs and concept_mc drills (no vague)
- [ ] All math in KaTeX — zero plain text formulas
- [ ] MCQ stimulus rates meet targets (see redesign spec)
- [ ] Content Reviewer subagent signed off per subject

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
*Last updated: 2026-03-26 — Post-redesign spec, pre-component implementation*
