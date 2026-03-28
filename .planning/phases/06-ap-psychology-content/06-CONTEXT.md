# Phase 06 Context — AP Psychology Content

**Wave:** 1 (parallel with Phases 7, 8, 11)
**Subject slug:** `ap-psychology`
**ID prefix:** `psych`

## ⚠️ MANDATORY: CED PDF Is the Only Authoritative Source

The local CED PDF **MUST** be read before any other action:

```
.planning/phases/06-ap-psychology-content/reference/ap-psychology-course-and-exam-description.pdf
```

**Rules:**
- ALL unit names, unit counts, and exam weights come from the CED PDF — nowhere else
- ALL learning objectives and skill codes come from the CED PDF — nowhere else
- ALL testable vocabulary, concepts, and key psychologists come from the CED PDF — nowhere else
- Web research (Fiveable, Albert.io, Barron's, etc.) is **FORBIDDEN** as a source for topic selection or question content
- Web research is only permitted for supplementary context the PDF does not cover (e.g., a recent study update, exact exam date) — and must be flagged as `[WEB]`

**Why:** A previous pipeline run used third-party study sites and produced content that may not match College Board's official topic coverage, vocabulary, or exam weighting. All content was cleared and must be regenerated from the CED PDF.

---

## Unit Structure

> **DO NOT use any prior unit structure as authoritative.**
> The Researcher MUST derive the unit count, names, and CB weights by reading the PDF.
> Previous runs referenced an 8-unit and a 5-unit framework — neither has been verified against the PDF.

---

## Subject Details (Stable — Not PDF-Dependent)

- **Subject slug:** `ap-psychology`
- **MCQ stimulus target:** ~70% of questions have stimuli (text passage, case study, research description, table)
- **Drill typed:MC split:** 75:25
- **is_key_term per unit:** 8–15 (typed-recall modes only, never concept_mc)
- **Heavy on:** `significance_to_person` drills (Pavlov, Skinner, Freud, Piaget, Bandura, etc.)

## Drill Modes to Use
- `definition_to_term` — primary typed mode (vocabulary-heavy subject)
- `significance_to_person` — heavy use (many key psychologists)
- `concept_mc` — conceptual application questions (no stimulus, 1–3 sentence scenarios)
- **No** `term_to_definition`, `concept_to_example`, `person_to_significance` (reversed direction — eliminated)

## Content Pipeline
```
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Reviewer [Sonnet] → Commit
```
No Chemistry Checker needed. No pseudocode. Standard G1–G8 quality gates.

## Researcher Step Instructions

1. Read the CED PDF in full using the Read tool:
   `.planning/phases/06-ap-psychology-content/reference/ap-psychology-course-and-exam-description.pdf`
2. Extract from the PDF:
   - Official unit count, unit names, CB exam weights
   - All learning objectives (with skill codes)
   - All required content (key terms, key psychologists, required experiments/studies)
   - Exam format (MCQ count, time, FRQ format)
3. Write RESEARCH.md based ONLY on what the PDF contains
4. Derive meta-draft.json from the PDF unit list
5. Web research is BLOCKED for topic/content selection — only permitted for exam logistics (date, format confirmations) if truly absent from the PDF

## Predefined Vocabulary List

**See:** `vocab-list.md` in this directory (`.planning/phases/06-ap-psychology-content/vocab-list.md`)

The Writer MUST generate a drill card for every term in the predefined vocabulary list. These topic-grouped terms are the **minimum drill coverage** — additional terms from the CED are welcome, but every listed term must have a drill card.

- The vocab list uses the user's course topic groupings, NOT CED unit numbers — map each term to the correct CED unit by topic alignment
- `is_key_term: true` on 8–15 highest-yield terms per unit — these become study guide key terms
- Drill vocab and study guide key terms are automatically aligned since key terms are sourced from `is_key_term: true` drill cards

## Reference Fixture Note
Previous content in `public/data/ap-psychology/` was generated from third-party sources and has been cleared. There is no reference fixture — the Writer must generate all content from scratch against the schemas in `/data/schemas/`.
