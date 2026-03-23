# Ascendly — Claude Code Context

## Project
Free AP exam prep web app. No signup, no accounts, localStorage only.
URL: ascendly.vercel.app (planned)

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
/app           → Next.js App Router pages
/components    → Reusable React components
/data          → JSON content files + schemas
/utils         → localStorage, scoring, streak, fuzzyMatch, scramble, analytics
/lib           → Supabase client
/styles        → globals.css with CSS custom properties
/docs          → PRD.md, research docs, plans

## Design System
`design-system/ascendly/MASTER.md` is the canonical UI source of truth. Read it before building any component or page. For page-specific overrides check `design-system/ascendly/pages/[page].md` first.

## Agent Teams
### Coding Pipeline (enforce for every implementation task)
**Planner → Coder → Reviewer → Tester** — no step may be skipped.
- Planner defines objectives + acceptance criteria before any code is written
- Coder implements against the plan only
- Reviewer catches bugs, TypeScript errors, Critical Rule violations
- Tester verifies each Planner objective is actually met

### Content Pipeline (enforce for every content generation task)
**Researcher → Writer → Reviewer** — no step may be skipped.
- Researcher produces a College Board brief before Writer starts
- Writer outputs valid JSON matching `/data/schemas/*.schema.json`
- Reviewer verifies accuracy, curriculum alignment, KaTeX, correct answers

Full handoff format and communication standards in `docs/PRD.md` → `agent_team_communication`.

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

### Content JSON Files:
When writing any file under `/data/`, the pipeline is: Researcher → Writer → Reviewer (subagent) → only then can Coder integrate it. No shortcuts.

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
- Drills: cover every testable term, formula, person, concept, event — no fixed count
- Stimulus: text passages, Chart.js graphs, HTML tables, College Board pseudocode (CSP)
- Study guide structure: theme → core concepts → key terms → formulas → exam tip

## Subjects (Launch)
1. AP Psychology
2. AP World History
3. AP Government
4. AP Calculus AB
5. AP Precalculus
6. AP Computer Science Principles
7. AP Chemistry

## Phase Tracker
| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup & Documentation | Complete |
| 1 | Core Shell & Navigation | Not Started |
| 2 | Drill Interface | Not Started |
| 3 | Practice Questions Interface | Not Started |
| 4 | Study Guide Interface | Not Started |
| 5 | Practice Test Interface | Not Started |
| 6 | AP Psychology Content | Not Started |
| 7 | AP World History Content | Not Started |
| 8 | AP Government Content | Not Started |
| 9 | AP Calculus AB Content | Not Started |
| 10 | AP Precalculus Content | Not Started |
| 11 | AP CSP Content | Not Started |
| 12 | AP Chemistry Content | Not Started |
| 13 | Retention Mechanics & Polish | Not Started |
| 14 | Launch | Not Started |

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

## Decisions Log
- 2026-03-22: Using Tailwind v4 (no tailwind.config.ts — configuration via @theme in globals.css)
- 2026-03-22: Supabase credentials to be added in Task 6 (deferred — user action required)
