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

## Critical Rules
1. NEVER render formulas as plain text — KaTeX always
2. NEVER skip the screenshot loop — UI must be polished before marking done
3. NEVER show placeholder text in screenshot loops — real content only
4. NEVER scramble answer choices in JSON — scrambling at render time only
5. NEVER use real Python/Java in AP CSP — College Board pseudocode only
6. NEVER block UI on Supabase — always fire-and-forget, catch silently
7. AP Chemistry: Checker must approve all formulas before Coder integrates
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
| 0 | Project Setup & Documentation | In Progress |
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
