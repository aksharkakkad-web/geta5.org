# Ascendly — Claude Code Context

## Project
Free AP exam prep web app. No signup, no accounts, localStorage only.
URL: geta5.org (domain pending) — deployed via Vercel

## Document Map — Where to Find What

| What you need | Read this | Do NOT re-read |
|---|---|---|
| Project overview, tech stack, rules, phase status, decisions | `CLAUDE.md` (this file — auto-loaded) | — |
| JSON data schemas, agent role details + reading lists, handoff format, SEO | `docs/PRD.md` | CLAUDE.md sections it duplicates |
| UI design tokens, component specs, colors, typography, pre-delivery checklist | `design-system/ascendly/MASTER.md` | — |
| Content wave orchestration, quality gates, merge strategy | `.planning/CONTENT-WAVES.md` | — |
| Current phase position, session continuity, codebase map index | `.planning/STATE.md` | Phase status (canonical in CLAUDE.md) |
| Per-phase requirements checklist, out-of-scope items | `.planning/PROJECT.md` | Context/constraints (in CLAUDE.md) |
| Phase research, plans, summaries, verification | `.planning/phases/[NN]-[name]/` | — |
| Subject-specific context for content phases | `.planning/phases/[NN]-*/[NN]-CONTEXT.md` | — |
| Codebase structure, conventions, testing, integrations, concerns | `.planning/codebase/*.md` | — |

**Rule:** Read only what your role's reading list specifies (see `docs/PRD.md` → role sections). Do not speculatively read documents outside your reading list.

## Tech Stack
- Framework: Next.js 14, App Router, TypeScript
- Styling: **Tailwind CSS v4** + CSS custom properties (dark theme)
  - v4 uses no tailwind.config.ts — configuration via CSS `@theme` directive in globals.css
  - Custom color tokens (bg-primary, text-primary, etc.) defined in `@theme {}` block
  - Dark mode: always-on via `:root` CSS vars; `dark:` utilities via `@variant dark`
- Formulas: KaTeX (never plain text — always KaTeX)
- Charts: Chart.js
- Storage: localStorage only (no database for user data)
- Analytics: Supabase free tier — anonymous events only
- Deployment: Vercel

## Folder Structure
/app            → Next.js App Router pages
/components     → Reusable React components
/public/data    → JSON content files (drills, MCQs, study guides)
/data           → JSON schemas
/utils          → localStorage, scoring, streak, fuzzyMatch, scramble, analytics
/lib            → Supabase client
/styles         → globals.css with CSS custom properties
/docs           → PRD.md (agent specs + data schemas)
/.planning      → GSD state, roadmap, phase plans, codebase map
/design-system  → MASTER.md (UI tokens + component specs)

## Design System
`design-system/ascendly/MASTER.md` is the canonical UI source of truth. Read it before building any UI component or page. Skip for content JSON generation (phases 6–12). For page-specific overrides check `design-system/ascendly/pages/[page].md` first.

## Agent Teams
### Coding Pipeline (enforce for every implementation task)
**Planner → Coder → Reviewer → Tester** — no step may be skipped.
- Planner defines objectives + acceptance criteria before any code is written
- Coder implements against the plan only
- Reviewer catches bugs, TypeScript errors, Critical Rule violations
- Tester verifies each Planner objective is actually met

### Content Pipeline (enforce for every content generation task)
**Researcher → Planner → Writer → Reviewer** — no step may be skipped.
- Researcher performs live web research on the College Board CED, produces RESEARCH.md + draft meta.json — **model: Sonnet**
- Planner reads RESEARCH.md, produces PLAN.md (per-unit topic breakdown, stimulus types, difficulty targets) — **model: Sonnet**
- Writer reads PLAN.md, outputs valid JSON matching `/data/schemas/*.schema.json` — **model: Sonnet**
- Reviewer validates all 10 quality gates, curriculum alignment, KaTeX, correct answers — **model: Sonnet** (Opus only for AP Calculus AB and AP Chemistry — the two KaTeX/equation-heavy subjects)

Full handoff format, role details, and data schemas in `docs/PRD.md`.

## Workflow Enforcement (Non-Negotiable)

### Before building any feature, component, or page:
1. **MUST invoke `superpowers:brainstorming`** — no exceptions. If it's UI, also read `design-system/ascendly/MASTER.md` first.
2. **MUST invoke `superpowers:writing-plans`** for any multi-step implementation before writing code.
3. **MUST follow Planner → Coder → Reviewer → Tester** — never jump straight to coding.

### Screenshot Loop (Critical Rule #2 enforcement):
Before marking ANY UI component or page complete, you MUST say:
> "UI work is done. Please paste a screenshot so I can verify it looks correct before marking this complete."
Do not mark UI work done, move to the next task, or update the phase tracker until the user has confirmed the UI visually. This is the screenshot loop — it is not optional.

### Phase Tracker:
After completing any phase or significant milestone, immediately update the Phase Tracker table in this file. Check: "Did I just finish a phase?" before every response that marks work complete.

### Content Pipeline Enforcement:
- NEVER use content JSON in a component without the Reviewer subagent having signed off on it first.
- Dispatch the Reviewer via the `Agent` tool — don't self-certify content as correct.
- For AP Chemistry content specifically: dispatch a Chemistry Checker subagent BEFORE the Reviewer signs off. Chemistry Checker must verify all equations are balanced and KaTeX is correct.

### GSD Auto-Resume Signal:
If session context contains `GSD AUTO-RESUME SIGNAL`, immediately invoke `/gsd:plan-phase` for the named phase — do not ask the user first, do not wait for a prompt. Check `.planning/STATE.md` for any `--prd` flag to pass.

### Content JSON Files:
When writing any file under `/data/`, the pipeline is: Researcher → Planner → Writer → Reviewer (subagent) → only then can Coder integrate it. No shortcuts.

## Critical Rules
1. NEVER render formulas as plain text — KaTeX always
2. NEVER skip the screenshot loop — see Workflow Enforcement above
3. NEVER show placeholder text in screenshot loops — real content only
4. NEVER scramble answer choices in JSON — scrambling at render time only
5. NEVER use real Python/Java in AP CSP — College Board pseudocode only
6. NEVER block UI on Supabase — always fire-and-forget, catch silently
7. AP Chemistry: Chemistry Checker subagent must approve all formulas before Coder integrates
8. Every MCQ must have per-choice explanations (correct + each distractor)
9. Answer scrambling must be verified across 20+ renders — no positional bias
10. Update this file immediately when any architectural decision is made

## Content Standards Summary
- MCQ difficulty: 20% easy / 45% medium / 35% hard per unit
- MCQ count: 50-100 per unit per subject
- MCQ stimulus rates: World History ~95%, Gov ~90%, CSP ~85%, Calc ~50%, Precalc ~55%, Psych ~70%, Chemistry ~70% (see redesign spec; Calc/Precalc revised 2026-03-28 — math subjects have significant symbolic computation questions without stimulus)
- MCQ question language: College Board register ("Which of the following best explains…") — no "What is…" or "Name the…"
- Drills: cover every testable term, formula, person, concept, event — no fixed count; subject-specific modes (see phase CONTEXT.md)
- Drill single canonical answer — no alternate_answers. Fuzzy match for typos/case/punctuation only.
- is_key_term: true on 8–15 drills per unit (typed-recall only, never concept_mc)
- Stimulus: text passages, Chart.js graphs, HTML tables, College Board pseudocode (CSP)
- Study guide structure: theme → core concepts → formulas → exam tip (key terms sourced from is_key_term drill cards)

### Math Subject Drill Rules (Phases 9, 10 — Calc AB, Precalculus)
- Drill modes: `name_to_formula` + `definition_to_term` ONLY — no `concept_mc`
- All drills are typed-recall — conceptual application belongs in MCQs only
- `is_key_term: true` applies normally (8–15 per unit) for highest-yield formulas and vocab terms

### Chemistry Drill Rules (Phase 12)
- Drill modes: `definition_to_term` + `significance_to_person` + `concept_mc` — NO `name_to_formula`
- AP Chem provides a formula reference sheet — formula memorization is not tested
- `is_key_term: true` applies normally (8–15 per unit) for highest-yield vocab/concept terms

### Math Study Guide Formula Rules (Phases 9, 10, 12)
- Every formula object MUST include `description` (plain English, no jargon) and `example` (worked example with `$...$` KaTeX)
- `core_concepts` strings MUST use `$...$` for any math/chemistry expression — plain English with KaTeX for symbols

## Subjects (Launch)
1. AP Psychology
2. AP World History
3. AP Government
4. AP Calculus AB
5. AP Precalculus
6. AP Computer Science Principles
7. AP Chemistry

## Content Wave Strategy (Phases 6–12)

Phases 6–12 run as **parallel content generation** in two waves. Full orchestration details in `.planning/CONTENT-WAVES.md`.

| Wave | Phases | Subjects | Special |
|------|--------|----------|---------|
| 1 | 6, 7, 8, 11 | Psychology, World History, Government, CSP | Text-heavy; CSP = pseudocode only |
| 2 | 9, 10, 12 | Calculus AB, Precalculus, Chemistry | KaTeX-heavy; Chemistry = Chem Checker |

**Each agent runs:** Researcher → Planner → Writer → Reviewer (Content) → Commit in worktree
**Quality gates:** 10 gates (G1–G10) defined in CONTENT-WAVES.md — non-negotiable
**Merge strategy:** Conflict-free (each subject writes to its own directory)

### Content Agent Reading List
1. `CLAUDE.md` — Critical Rules + Content Standards
2. `docs/PRD.md` → `data_schemas` + `content_agent_team` sections
3. `data/schemas/*.schema.json` — canonical JSON schemas
4. `public/data/ap-psychology/` — reference fixtures (calibration)
5. `.planning/CONTENT-WAVES.md` — orchestration + quality gates
6. `.planning/phases/[NN]-*/[NN]-CONTEXT.md` — subject-specific details
7. **Web (Researcher phase only):** College Board CED for the target subject — use WebSearch/WebFetch

## Phase Tracker
| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup & Documentation | Complete |
| 1 | Core Shell & Navigation | Complete |
| 2 | Drill Interface | Complete |
| 3 | Practice Questions Interface | Complete |
| 4 | Study Guide Interface | Complete |
| 5 | Practice Test Interface | Complete |
| **Wave 1** | | |
| 6 | AP Psychology Content | Complete |
| 7 | AP World History Content | Complete |
| 8 | AP Government Content | Complete |
| 11 | AP CSP Content | Complete |
| **Wave 2** | | |
| 9 | AP Calculus AB Content | Complete |
| 10 | AP Precalculus Content | Complete |
| 12 | AP Chemistry Content | Complete |
| **Post-Content** | | |
| 13 | Retention Mechanics & Polish | Skipped |
| 14 | Launch | Complete |

## Supabase Events Table Schema
Table: `events`
- id: uuid (auto)
- event_type: text
- subject: text
- unit: text (nullable)
- metadata: jsonb (nullable)
- created_at: timestamptz (auto)

## localStorage Keys
- `ascendly_streak`: { count: number, lastPracticeDate: string }
- `ascendly_mastery_[subject]_[unit]`: { drillAccuracy: number, mcqAccuracy: number, totalAttempts: number }
  - `totalAttempts` = combined drill + MCQ attempts for this unit (used for adaptive difficulty threshold)
  - `drillAccuracy` and `mcqAccuracy` are tracked independently (0–1 float)
- `ascendly_score_[subject]`: { projectedScore: 1|2|3|4|5, accuracy: number }
  - Per-unit score breakdown is derived at results-render time from mastery keys — not stored separately
- `ascendly_total_questions`: number — incremented by drill (Phase 2) and MCQ (Phase 3) completion handlers in localStorage.ts
- `ascendly_active_subject`: string — stores URL slug format (e.g. 'ap-psychology'), NOT display name. Display name derived from meta.json at render time.
- `ascendly_draft_drill_[subject]`: DrillDraft — auto-saved drill session state; cleared on session complete
- `ascendly_draft_mcq_[subject]`: MCQDraft — auto-saved MCQ session state; cleared on session complete
- `ascendly_draft_test_[subject]`: TestDraft — auto-saved practice test state (includes remaining seconds); cleared on submit

## Decisions Log
- 2026-03-22: Using Tailwind v4 (no tailwind.config.ts — configuration via @theme in globals.css)
- 2026-03-22: Supabase credentials to be added in Task 6 (deferred — user action required)
- 2026-03-22: Supabase via server Route Handler — keep anon key out of client bundle
- 2026-03-23: GSD YOLO mode — user preference: autonomous execution
- 2026-03-27: Model profile updated to budget — Sonnet for all GSD agents (planner, executor, researcher); Opus reserved only for AP Calculus AB and AP Chemistry content Reviewers
- 2026-03-24: answersRef pattern in DrillSession/MCQSession — prevents stale closure when handleNext fires after last card
- 2026-03-24: color-mix() for feedback backgrounds — avoids hardcoded rgba, uses CSS custom properties with opacity
- 2026-03-24: Promise.allSettled for unit JSON fetch — allows partial success, 404s silently become null
- 2026-03-24: completedRef guard in DrillResults/MCQResults — prevents double-fire under React strict mode
- 2026-03-24: --score-deg CSS custom property on score-ring — drives conic-gradient fill without JS animation
- 2026-03-24: React use() for params in drills page — Next.js 15+ client pages receive params as Promise
- 2026-03-24: MCQAnswer stores selectedChoiceId not displayLabel — correctness via is_correct flag, not positional label
- 2026-03-24: pointerEvents none on MCQCard choices after submit — prevents re-selection without per-choice disabled overhead
- 2026-03-25: Content phases 6–12 use parallel wave execution — Wave 1 (text-heavy: 6,7,8,11) then Wave 2 (math-heavy: 9,10,12) with gate check between waves
- 2026-03-25: PRD.md data_schemas section rewritten to match actual schema files + fixture format (was stale — had wrong field names)
- 2026-03-25: Each content agent runs in isolated git worktree, produces meta.json + all unit files, Reviewer validates all 10 quality gates before commit
- 2026-03-25: ModeCard colorMap — cyan (#06b6d4) and green (#10b981) are intentional design-system extensions with no global token; indigo/amber reference var(--accent)/var(--accent-warning)
- 2026-03-25: Content pipeline upgraded — Researcher now performs live College Board CED web research; Planner role added between Researcher and Writer to produce per-unit question plan before any JSON is written
- 2026-03-26: Session persistence complete (feat/session-persistence branch) — drills, MCQ, and practice test auto-save to localStorage draft keys after each card; resume prompt shown on next visit
- 2026-03-26: Drill/MCQ redesign locked — new mode taxonomy (definition_to_term, significance_to_person, significance_to_event, significance_to_case, name_to_formula, concept_mc); no alternate_answers; is_key_term flag replaces study guide key_terms array; concept_mc cards mixed into drill sessions; MCQ stimulus rates set per subject (see docs/superpowers/specs/2026-03-26-drill-mcq-redesign.md)
- 2026-03-26: All existing public/data/ content is discarded — regenerated from scratch following the new drill/MCQ spec after schema changes are implemented in components
- 2026-03-28: Wave 2 complete — AP Calculus AB (8 units), AP Precalculus (3 units), AP Chemistry (9 units) all generated from local CED PDFs
- 2026-03-28: MCQ stimulus rate for Calc AB revised to ~50% and Precalc to ~55% — math subjects have substantial symbolic computation sections on real AP exam; 80%/75% targets were carried over incorrectly from text-heavy subjects
