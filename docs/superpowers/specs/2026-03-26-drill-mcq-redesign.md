# Drill & MCQ System Redesign
**Date:** 2026-03-26
**Status:** Approved — ready for planning

## Overview

Full redesign of drill format, drill schema, study guide key terms, and MCQ realism standards before regenerating all content. This spec governs content generation for phases 6–12.

---

## 1. Drill System

### 1.1 Mode Taxonomy

All drills follow one direction: prompt with the descriptive/longer side, student types the exact answer. This guarantees a single unambiguous correct response.

| Mode | Prompt | Answer | Subjects |
|---|---|---|---|
| `definition_to_term` | Definition of a concept | The term | All |
| `significance_to_person` | What someone is known for | Person's name | Psych, World, Gov |
| `significance_to_event` | What an event is / its impact | Event name | World History |
| `significance_to_case` | What a case established | Case name (e.g. *Marbury v. Madison*) | Gov |
| `name_to_formula` | Formula name | Typed formula (custom notation) | Calc, Precalc, Chemistry |
| `concept_mc` | Short scenario or question | Select correct choice (multiple choice) | All |

Removed modes: `term_to_definition`, `person_to_significance`, `event_to_date`, `formula_to_type`, `concept_to_example`. These were either open-ended (multiple valid answers) or duplicates of the wrong direction.

### 1.2 Single Canonical Answer

- **No `alternate_answers` array** — removed from schema entirely.
- Each concept gets exactly **one card** with **one canonical answer**.
- Fuzzy matching applies only for typos, case, and punctuation.
- If a concept has two common names, the Writer picks the more commonly tested one and uses that. No duplicate cards.

### 1.3 Formula Recall UX (`name_to_formula`)

**Interaction:**
1. Prompt shows the formula name ("Quadratic Formula", "Power Rule", "Ideal Gas Law")
2. Student types in a custom simple notation
3. Live KaTeX preview renders as they type (below the input)
4. "formatting help" link → modal (does not reveal the answer)
5. On submit: their typed formula is parsed and compared to the canonical KaTeX answer

**Notation standard (simple, no LaTeX knowledge needed):**
| What to type | Renders as |
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

**Formatting help modal:** Opens on click, shows the full notation reference table. Does not show the formula being tested. Closed by clicking outside or ✕.

**Input placeholder:** Generic — "Type your formula…" — never reveals the answer.

**Answer comparison:** Parse student input → KaTeX string → normalize whitespace/order → compare to canonical. Some tolerance for equivalent representations (e.g. `a/b` vs `(a)/(b)`).

**Schema fields for `name_to_formula` cards:**
- `answer`: canonical KaTeX string (stored as actual KaTeX, rendered in feedback)
- `katex_required: true`
- `format_hint`: optional short string shown above input (e.g. "Use Delta for Δ") for formulas with unusual notation

### 1.4 Concept MC Cards (`concept_mc`)

**Format:**
- Short scenario or direct question (1–3 sentences, no external stimulus)
- 3–4 answer choices with plausible distractors
- Distractors target real misconceptions, not obviously wrong
- No AP-style stimulus, no passage analysis required — tests conceptual understanding directly

**Schema additions:**
```json
{
  "mode": "concept_mc",
  "prompt": "A researcher gives participants a word list, waits 30 minutes, then tests recall. Participants remember the first and last words best. Which phenomenon does this demonstrate?",
  "choices": [
    { "text": "Serial position effect", "is_correct": true, "explanation": "The primacy and recency effects together form the serial position effect — better recall at both ends of a list." },
    { "text": "Proactive interference", "is_correct": false, "explanation": "Proactive interference is when older memories disrupt recall of newer ones — not relevant to position-based recall patterns." },
    { "text": "Encoding specificity", "is_correct": false, "explanation": "Encoding specificity is about matching retrieval cues to encoding context, not about list position." },
    { "text": "Spacing effect", "is_correct": false, "explanation": "The spacing effect is about distributed practice over time improving recall, not about position within a single list." }
  ]
}
```

**Placement:** Mixed into the standard drill session deck alongside typed-recall cards.

### 1.5 Subject Drill Profiles

Content Writers must follow these profiles. The `split` is a target — not a hard constraint per unit, but should hold across the full subject.

| Subject | Active Modes | Typed:MC Split |
|---|---|---|
| AP Psychology | `definition_to_term`, `significance_to_person`, `concept_mc` | 75 : 25 |
| AP World History | `definition_to_term`, `significance_to_person`, `significance_to_event`, `concept_mc` | 75 : 25 |
| AP Government | `definition_to_term`, `significance_to_person`, `significance_to_case`, `concept_mc` | 70 : 30 |
| AP Calculus AB | `name_to_formula`, `definition_to_term`, `concept_mc` | 65 : 35 |
| AP Precalculus | `name_to_formula`, `definition_to_term`, `concept_mc` | 70 : 30 |
| AP CSP | `definition_to_term`, `concept_mc` | 50 : 50 |
| AP Chemistry | `name_to_formula`, `definition_to_term`, `concept_mc` | 60 : 40 |

---

## 2. Study Guide Key Terms

### 2.1 Key Terms as Drill Subset

- **Remove `key_terms` array from study guide schema.**
- Add `is_key_term: boolean` flag to drill schema.
- The study guide page renders its "Key Terms" section by reading all drill cards for that unit where `is_key_term: true`.
- This eliminates divergence between drill definitions and study guide definitions — one source of truth.

**Content rule:** Writers must mark 8–15 drills per unit as `is_key_term: true`. These should be the highest-yield terms (most likely to appear on the AP exam, foundational to understanding the unit). `is_key_term` applies only to typed-recall modes (`definition_to_term`, `significance_to_person`, `significance_to_event`, `significance_to_case`, `name_to_formula`) — never to `concept_mc` cards.

---

## 3. MCQ & Practice Test Realism

### 3.1 Stimulus Rate Targets

| Subject | Target Stimulus % | Primary Stimulus Types |
|---|---|---|
| AP Psychology | ~70% | Research study description, case scenario, experimental design |
| AP World History | ~95% | Primary/secondary source excerpts, data tables, Chart.js charts |
| AP Government | ~90% | Document excerpts (Constitution, Federalist Papers, SCOTUS opinions), polling data |
| AP Calculus AB | ~80% | Chart.js function graphs, equations, table of values |
| AP Precalculus | ~75% | Chart.js graphs, function scenarios |
| AP CSP | ~85% | College Board pseudocode blocks |
| AP Chemistry | ~70% | Data tables, reaction descriptions, experimental setups |

`stimulus: none` is reserved for foundational recall questions only and should be rare.

### 3.2 Distractor Quality Standard

Each distractor must:
- Represent a **specific, real misconception** a student who partially understands would hold
- Be **plausible** — a student who guessed without thinking could pick it
- **Never be obviously wrong** — no distractors that any student with basic knowledge would immediately eliminate
- The explanation for each wrong choice must name the specific misconception it targets

### 3.3 Question Language

Questions must use College Board register:
- "Which of the following best explains…"
- "The [experiment/passage/graph] above most directly supports…"
- "A student who believes X would most likely predict…"
- "Which of the following is most consistent with…"
- Avoid: "What is…", "Name the…", "Which term describes…" (these are recall, not analysis)

### 3.4 Cognitive Demand

Target distribution per unit:
- ~20% knowledge/recall (easy)
- ~45% application/analysis (medium)
- ~35% synthesis/evaluation (hard)

This matches the College Board's actual difficulty weighting and the existing difficulty field in the MCQ schema.

---

## 4. Schema Changes Required

### drill.schema.json
- Remove `alternate_answers`
- Remove modes: `term_to_definition`, `person_to_significance`, `event_to_date`, `formula_to_type`, `concept_to_example`
- Add modes: `significance_to_person`, `significance_to_event`, `significance_to_case`, `name_to_formula`, `concept_mc`
- Add `is_key_term: boolean`
- Add `format_hint?: string` (for `name_to_formula` only)
- Add `choices?: array` (for `concept_mc` only — array of `{text: string, is_correct: boolean, explanation: string}`)

### study-guide.schema.json
- Remove `key_terms` array

### No changes to mcq.schema.json or meta.schema.json

---

## 5. Content Generation Implications

- All existing `public/data/` content is discarded and regenerated from scratch.
- The Researcher reads the College Board CED for each subject.
- The Planner produces a per-unit breakdown respecting drill profiles and stimulus targets.
- The Writer follows this spec for every card and question.
- The Reviewer validates:
  - Drill mode correctness (no reversed prompts)
  - `is_key_term` count per unit (8–15)
  - No `alternate_answers` field present
  - `concept_mc` cards have plausible distractors
  - MCQ stimulus rates hit targets
  - Distractor quality (each targets a named misconception)
  - Question language matches CB register
