# Phase 12 Context — AP Chemistry Content

**Wave:** 2 (parallel with Phases 9, 10)
**Subject slug:** `ap-chemistry`
**ID prefix:** `chem`

## ⚠️ MANDATORY: CED PDF Is the Only Authoritative Source

The local CED PDF **MUST** be read before any other action:

```
.planning/phases/12-ap-chemistry-content/reference/ap-chemistry-course-and-exam-description.pdf
```

**Rules:**
- ALL unit names, unit counts, and exam weights come from the CED PDF — nowhere else
- ALL learning objectives and skill codes come from the CED PDF — nowhere else
- ALL required reactions, equations, formulas, and testable content come from the CED PDF — nowhere else
- Web research (Fiveable, Princeton Review, etc.) is **FORBIDDEN** as a source for topic selection or question content
- Web research is only permitted for supplementary context truly absent from the PDF — must be flagged as `[WEB]`

**Why:** A previous pipeline run used Fiveable and Princeton Review as sources. All content was cleared and must be regenerated from the local CED PDF.

---

## Unit Structure

> **DO NOT use the unit structure below as authoritative.**
> It has not been verified against the local CED PDF. Researcher must confirm units, names, and weights from the PDF.

| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | Atomic Structure and Properties | ~7-9% (unverified) |
| 2 | Molecular and Ionic Compound Structure and Properties | ~7-9% (unverified) |
| 3 | Intermolecular Forces and Properties | ~18-22% (unverified) |
| 4 | Chemical Reactions | ~7-9% (unverified) |
| 5 | Kinetics | ~7-9% (unverified) |
| 6 | Thermodynamics | ~7-9% (unverified) |
| 7 | Equilibrium | ~7-9% (unverified) |
| 8 | Acids and Bases | ~11-15% (unverified) |
| 9 | Applications of Thermodynamics | ~7-9% (unverified) |

---

## Subject Details — CRITICAL RULES

- **Chemistry Checker subagent REQUIRED** (Critical Rule #7) — runs before Reviewer
- All chemical equations must be balanced — Chemistry Checker verifies before Reviewer
- **KaTeX-heavy**: equilibrium expressions, rate laws, thermodynamic equations, pH calculations
- `type: "table"` stimuli: periodic table data, experimental data, titration data
- `type: "chart"` stimuli: reaction energy diagrams, kinetics graphs, titration curves
- `type: "text"` stimuli: lab procedure descriptions, experimental observations
- **MCQ stimulus target: ~70%**

### Study Guide Formula Requirements
Every formula object in the study guide MUST include:
- `description`: plain English explanation of what the formula means and when to use it — no jargon (e.g. "Relates pressure, volume, moles, and temperature for an ideal gas")
- `example`: a concrete example showing it applied — use `$...$` inline KaTeX (e.g. `"For 2 mol of gas at 300 K in 10 L: $P = \\frac{nRT}{V}$"`)

### Core Concepts KaTeX Rule
`core_concepts` strings MUST use `$...$` delimiters for any chemical expression, equation, or symbol. Write in plain English with KaTeX for math/chemistry notation.

## Chemistry Checker Requirements

The Chemistry Checker subagent must verify:
1. **All equations are balanced** (atoms and charge)
2. **State symbols** are correct: (s), (l), (g), (aq)
3. **KaTeX renders correctly** — no broken LaTeX strings
4. **Equilibrium expressions** match the balanced equation
5. **Thermodynamic signs** are correct (exo = negative ΔH, endo = positive)
6. **Significant figures** are appropriate in numerical answers
7. **Unit consistency** — mol, L, atm, K, J, kJ as appropriate

## KaTeX Patterns to Catalog (from PDF)
Researcher must extract from the PDF all standard formulas and equation types:
- Molar mass calculations
- Stoichiometry ratios
- Ideal gas law: $PV = nRT$
- Rate laws: $\text{rate} = k[A]^m[B]^n$
- Equilibrium: $K_c$, $K_p$, $K_{sp}$, $K_a$, $K_b$
- pH/pOH: $\text{pH} = -\log[H^+]$
- Gibbs free energy: $\Delta G = \Delta H - T\Delta S$
- Hess's Law applications
- Nernst equation

## Drill Modes to Use
- `definition_to_term` — primary mode: chemical concepts, law names, reaction types, thermodynamic terms (e.g. "A reaction that releases heat to the surroundings" → `exothermic`)
- `significance_to_person` — named laws and principles (e.g. "States that a system at equilibrium shifts to oppose a stress applied to it" → `Le Chatelier's Principle`)
- `concept_mc` — predict outcomes, experimental reasoning, identify reaction type (no stimulus block — scenario in prompt only)
- **No `name_to_formula`** — AP Chem students receive a reference sheet with formulas during the exam; formula memorization is not tested
- **Typed : MC split: 60 : 40** (typed = `definition_to_term` + `significance_to_person`; MC = `concept_mc`)
- Mark 8–15 cards per unit as `is_key_term: true` (`definition_to_term` and `significance_to_person` only, never `concept_mc`)
- No `name_to_formula`, `formula_to_type`, `term_to_definition`, `concept_to_example` — all eliminated

## Content Pipeline
```
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Chemistry Checker → Reviewer [Opus] → Commit
```
**ALL quality gates G1–G10 apply.** G10 (Chemistry Checker) is the extra gate.
Chemistry Checker runs BEFORE Reviewer [Opus] — Reviewer assumes equations are already verified.

## Researcher Step Instructions

1. Read the CED PDF in full using the Read tool:
   `.planning/phases/12-ap-chemistry-content/reference/ap-chemistry-course-and-exam-description.pdf`
2. Extract from the PDF:
   - Official unit count, unit names, CB exam weights
   - All learning objectives (with skill codes)
   - All required equations, formulas, and reaction types listed in the CED
   - Exam format (MCQ count, time, FRQ structure, reference tables provided)
   - Any formula sheets or reference tables included in the CED
3. Write RESEARCH.md based ONLY on what the PDF contains
4. Derive meta-draft.json from the PDF unit list
5. Web research is BLOCKED for topic/content selection

## Reference Fixture Note
Previous content in `public/data/ap-chemistry/` was generated from third-party sources and has been cleared. Writer must generate all content from scratch against the schemas in `/data/schemas/`.
