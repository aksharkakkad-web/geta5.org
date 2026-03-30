# Phase 09 Context — AP Calculus AB Content

**Wave:** 2 (parallel with Phases 10, 12)
**Subject slug:** `ap-calculus-ab`
**ID prefix:** `calc`

## ⚠️ MANDATORY: CED PDF Is the Only Authoritative Source

The local CED PDF **MUST** be read before any other action:

```
.planning/phases/09-ap-calculus-ab-content/reference/ap-calculus-ab-and-bc-course-and-exam-description.pdf
```

**Rules:**
- ALL unit names, unit counts, and exam weights come from the CED PDF — nowhere else
- ALL learning objectives and skill codes come from the CED PDF — nowhere else
- ALL required theorems, formulas, and testable content come from the CED PDF — nowhere else
- Web research is **FORBIDDEN** as a source for topic selection or question content
- Web research is only permitted for supplementary context truly absent from the PDF — must be flagged as `[WEB]`
- The PDF covers both Calculus AB and BC — extract AB-only content; clearly mark anything BC-only as out of scope

**Why:** A previous pipeline run claimed the CED as source but did not use the local PDF file. All content was cleared and must be regenerated from the local CED PDF.

---

## Unit Structure

> **DO NOT use the unit structure below as authoritative.**
> It has not been verified against the local CED PDF. Researcher must confirm units, names, and weights from the PDF.

| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | Limits and Continuity | ~10-12% (unverified) |
| 2 | Differentiation: Definition and Fundamental Properties | ~10-12% (unverified) |
| 3 | Differentiation: Composite, Implicit, and Inverse Functions | ~9-13% (unverified) |
| 4 | Contextual Applications of Differentiation | ~10-15% (unverified) |
| 5 | Analytical Applications of Differentiation | ~15-18% (unverified) |
| 6 | Integration and Accumulation of Change | ~17-20% (unverified) |
| 7 | Differential Equations | ~6-12% (unverified) |
| 8 | Applications of Integration | ~10-15% (unverified) |

---

## Subject Details (Stable — Not PDF-Dependent)

- **KaTeX-heavy** — nearly every question, drill, and study guide entry uses KaTeX
- All formulas MUST be in KaTeX (Critical Rule #1) — most KaTeX-intensive math subject
- `type: "chart"` stimuli for graph-based questions (interpreting derivatives, areas under curves)
- `type: "table"` for numerical approximation questions (Riemann sums, trapezoidal rule)
- Distinguish calculator vs no-calculator sections in difficulty tagging
- **MCQ stimulus target: ~80%**

### Study Guide Formula Requirements (math subjects only)
Every formula object in the study guide MUST include:
- `description`: plain English explanation of what the formula does and when to use it — no jargon, write for a motivated 11th grader seeing it for the first time
- `example`: a worked example showing the formula in action — use `$...$` inline KaTeX delimiters (e.g. `"If $f(x) = x^3$, then $f'(x) = 3x^2$"`)

### Core Concepts KaTeX Rule
`core_concepts` strings MUST use `$...$` delimiters for any math expression. Write in plain English but render all symbols and expressions via KaTeX. Example: `"The power rule: the derivative of $x^n$ is $nx^{n-1}$"`

## Drill Modes to Use
- `name_to_formula` — primary mode (formula name → student types it; simple notation with live KaTeX preview)
- `definition_to_term` — math vocabulary, limit definitions, theorem names, continuity/differentiability conditions
- **No `concept_mc`** — conceptual application belongs in Practice Questions (MCQs) only; drills are pure recall
- **All drills are typed-recall**
- Mark 8–15 cards per unit as `is_key_term: true` (`name_to_formula` and `definition_to_term` only)
- No `concept_mc`, `formula_to_type`, `term_to_definition`, `concept_to_example` — all eliminated

## name_to_formula Notation Reference
Student types using simple notation (NOT LaTeX). Live preview renders KaTeX:
| What student types | Renders as |
|---|---|
| `x^2` | x² |
| `x_0` | x₀ |
| `(a)/(b)` | a/b (fraction) |
| `sqrt(x)` | √x |
| `+-` | ± |
| `int(f)` | ∫f |
| `inf` | ∞ |
| `Delta` | Δ |
| `theta`, `pi`, `lambda` | θ, π, λ |

## KaTeX Patterns to Catalog (from PDF)
Researcher must extract from the PDF all standard formulas:
- Derivative rules (power, product, quotient, chain)
- Integral forms (basic, u-substitution — by parts is BC only, exclude)
- Theorems (MVT, IVT, EVT, FTC I & II)
- L'Hôpital's Rule
- Related rates setups
- Area/volume formulas

## Content Pipeline
```
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Reviewer [Opus] → Commit
```
No Chemistry Checker. No pseudocode. Standard G1–G8 quality gates.
**Extra gate:** Reviewer [Opus] must verify all KaTeX strings render correctly.

## Researcher Step Instructions

1. Read the CED PDF in full using the Read tool:
   `.planning/phases/09-ap-calculus-ab-content/reference/ap-calculus-ab-and-bc-course-and-exam-description.pdf`
2. Extract from the PDF (AB sections only — skip BC-only content):
   - Official unit count, unit names, CB exam weights for AB
   - All learning objectives (with skill codes) for AB
   - All required theorems and formulas listed in the CED
   - Exam format (MCQ count, calculator/no-calculator split, FRQ format)
3. Write RESEARCH.md based ONLY on what the PDF contains
4. Derive meta-draft.json from the PDF unit list
5. Web research is BLOCKED for topic/content selection

## Reference Fixture Note
Previous content in `public/data/ap-calculus-ab/` was generated without verifying against the local PDF and has been cleared. Writer must generate all content from scratch against the schemas in `/data/schemas/`.
