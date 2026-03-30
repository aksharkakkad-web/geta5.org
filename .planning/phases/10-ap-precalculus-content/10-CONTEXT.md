# Phase 10 Context — AP Precalculus Content

**Wave:** 2 (parallel with Phases 9, 12)
**Subject slug:** `ap-precalculus`
**ID prefix:** `precalc`

## ⚠️ MANDATORY: CED PDF Is the Only Authoritative Source

The local CED PDF **MUST** be read before any other action:

```
.planning/phases/10-ap-precalculus-content/reference/ap-precalculus-course-and-exam-description.pdf
```

**Rules:**
- ALL unit names, unit counts, and exam weights come from the CED PDF — nowhere else
- ALL learning objectives and skill codes come from the CED PDF — nowhere else
- ALL required functions, formulas, and testable content come from the CED PDF — nowhere else
- Web research is **FORBIDDEN** as a source for topic selection or question content
- Web research is only permitted for supplementary context truly absent from the PDF — must be flagged as `[WEB]`

**Why:** A previous pipeline run did not use the local PDF file. All content was cleared and must be regenerated from the local CED PDF.

---

## Unit Structure

> **DO NOT use the unit structure below as authoritative.**
> It has not been verified against the local CED PDF. Researcher must confirm units, names, and weights from the PDF.

| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | Polynomial and Rational Functions | ~30-40% (unverified) |
| 2 | Exponential and Logarithmic Functions | ~27-40% (unverified) |
| 3 | Trigonometric and Polar Functions | ~15-20% (unverified) |
| 4 | Functions Involving Parameters, Vectors, and Matrices | ~10-15% (unverified) |

---

## Subject Details (Stable — Not PDF-Dependent)

- **KaTeX-heavy** — functions, transformations, and equations throughout
- Fewer units (4) but each is dense — expect more questions per unit
- `type: "chart"` stimuli heavily used (graph transformations, function behavior)
- `type: "table"` for function value tables, rate of change tables
- Emphasize graphical interpretation and function behavior analysis
- Units 3–4 are only on the non-calculator section of the FRQ
- **MCQ stimulus target: ~75%**
- Newer AP exam (first administered May 2024) — CED is the definitive source

### Study Guide Formula Requirements (math subjects only)
Every formula object in the study guide MUST include:
- `description`: plain English explanation of what the formula does and when to use it — no jargon, write for a motivated 11th grader seeing it for the first time
- `example`: a worked example showing the formula in action — use `$...$` inline KaTeX delimiters (e.g. `"The amplitude of $f(x) = 3\sin(x)$ is $3$"`)

### Core Concepts KaTeX Rule
`core_concepts` strings MUST use `$...$` delimiters for any math expression. Write in plain English but render all symbols and expressions via KaTeX. Example: `"A function is even if $f(-x) = f(x)$ — its graph is symmetric about the y-axis"`

## Drill Modes to Use
- `name_to_formula` — primary mode (formula name → student types it; simple notation with live KaTeX preview)
- `definition_to_term` — function properties, asymptote behavior, transformation vocabulary
- **No `concept_mc`** — conceptual application belongs in Practice Questions (MCQs) only; drills are pure recall
- **All drills are typed-recall**
- Mark 8–15 cards per unit as `is_key_term: true` (`name_to_formula` and `definition_to_term` only)
- No `concept_mc`, `formula_to_type`, `term_to_definition`, `concept_to_example` — all eliminated

## Content Pipeline
```
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Reviewer [Sonnet] → Commit
```
No Chemistry Checker. No pseudocode. Standard G1–G8 quality gates.
**Extra gate:** Reviewer [Sonnet] must verify all KaTeX strings render correctly.

## Researcher Step Instructions

1. Read the CED PDF in full using the Read tool:
   `.planning/phases/10-ap-precalculus-content/reference/ap-precalculus-course-and-exam-description.pdf`
2. Extract from the PDF:
   - Official unit count, unit names, CB exam weights
   - All learning objectives (with skill codes)
   - All required functions, formulas, and identities listed in the CED
   - Exam format (MCQ count, calculator/no-calculator split, FRQ structure)
3. Write RESEARCH.md based ONLY on what the PDF contains
4. Derive meta-draft.json from the PDF unit list
5. Web research is BLOCKED for topic/content selection

## Reference Fixture Note
Previous content in `public/data/ap-precalculus/` was generated without verifying against the local PDF and has been cleared. Writer must generate all content from scratch against the schemas in `/data/schemas/`.
