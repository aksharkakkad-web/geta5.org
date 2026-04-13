# AP Calculus BC — Feature Design Spec

## Overview
Add AP Calculus BC as the 8th subject on Ascendly. Fully standalone content — all 10 units generated from scratch at BC-level rigor. No content sharing with AB.

## Architecture
Zero routing/component changes. The app uses dynamic `[subject]` routes and fetches data by slug. Adding BC = new subject entry + new data directory.

## Units (College Board CED)

| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | Limits and Continuity | 4–7% |
| 2 | Differentiation: Definition and Fundamental Properties | 4–7% |
| 3 | Differentiation: Composite, Implicit, and Inverse Functions | 4–7% |
| 4 | Contextual Applications of Differentiation | 6–9% |
| 5 | Analytical Applications of Differentiation | 8–11% |
| 6 | Integration and Accumulation of Change | 17–20% |
| 7 | Differential Equations | 6–9% |
| 8 | Applications of Integration | 6–9% |
| 9 | Parametric Equations, Polar Coordinates, and Vector-Valued Functions | 11–12% |
| 10 | Infinite Sequences and Series | 17–18% |

Units 1-8 share topic names with AB but have lower weight (units 9-10 absorb ~30%). Content must reflect BC-level rigor: faster pacing, more advanced techniques (integration by parts, partial fractions, improper integrals, logistic growth, Euler's method, Taylor/Maclaurin series, etc.).

## Content Standards

- **Drills:** `name_to_formula` + `definition_to_term` only. 8-15 `is_key_term` per unit. Typed recall only — no `concept_mc`.
- **MCQs:** 50-100 per unit, ~50% stimulus rate, 20/45/35 easy/medium/hard. College Board register language. Per-choice explanations required.
- **Study guides:** Every formula gets `description` + `example` with KaTeX. `core_concepts` use `$...$` for math.
- **Practice tests:** Pull from MCQ pool (existing component, no code changes).
- **FRQs:** Deferred — user will provide BC FRQ PDFs + scoring guidelines for extraction after core content ships.

## Content Pipeline

Researcher (Sonnet) → Planner (Sonnet) → Writer (Sonnet) → Reviewer (Opus)

Reviewer responsibilities:
- Verify all concepts align with official College Board CED
- Verify all CED concepts are present (no gaps)
- Verify all correct answers are actually correct
- Verify all answer explanations are accurate
- Verify KaTeX renders correctly
- Verify difficulty distribution matches targets
- Verify stimulus rates match targets

## Code Changes

| File | Change |
|------|--------|
| `utils/subjects.ts` | Add `ap-calculus-bc` entry with 10 units |
| `public/data/ap-calculus-bc/meta.json` | New — subject metadata |
| `public/data/ap-calculus-bc/drills/unit-{1-10}.json` | New — drill cards |
| `public/data/ap-calculus-bc/mcq/unit-{1-10}.json` | New — MCQ questions |
| `public/data/ap-calculus-bc/study-guide/unit-{1-10}.json` | New — study guide content |
| `public/data/ap-calculus-bc/adi-context.json` | New — Adi chatbot context |
| `CLAUDE.md` | Add BC to subjects list + phase tracker |
| `app/page.tsx` metadata | "7 AP subjects" → "8 AP subjects" |

No component changes, no routing changes, no new pages.

## FRQ Intake (Post-Launch)

1. User drops BC FRQ PDFs + scoring guidelines into `content-sources/`
2. Extract each FRQ into existing JSON schema (`frq/*.json` + `frq/manifest.json`)
3. Same extraction pattern as AB FRQs
