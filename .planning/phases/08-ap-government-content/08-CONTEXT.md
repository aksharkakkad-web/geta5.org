# Phase 08 Context — AP Government Content

**Wave:** 1 (parallel with Phases 6, 7, 11)
**Subject slug:** `ap-government`
**ID prefix:** `gov`

## ⚠️ MANDATORY: CED PDF Is the Only Authoritative Source

The local CED PDF **MUST** be read before any other action:

```
.planning/phases/08-ap-government-content/reference/ap-us-government-and-politics-course-and-exam-description.pdf
```

**Rules:**
- ALL unit names, unit counts, and exam weights come from the CED PDF — nowhere else
- ALL learning objectives and skill codes come from the CED PDF — nowhere else
- ALL required Foundational Documents, required SCOTUS cases, and testable content come from the CED PDF — nowhere else
- Web research (Albert.io, Fiveable, etc.) is **FORBIDDEN** as a source for topic selection or question content
- Web research is only permitted for supplementary context the PDF does not cover — must be flagged as `[WEB]`

**Why:** A previous pipeline run used Albert.io and Fiveable as sources. All content was cleared and must be regenerated from the CED PDF.

---

## Unit Structure

> **DO NOT use the unit structure below as authoritative.**
> It has not been verified against the CED PDF. Researcher must derive units, names, and weights from the PDF.

| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | Foundations of American Democracy | ~15-22% (unverified) |
| 2 | Interactions Among Branches of Government | ~25-36% (unverified) |
| 3 | Civil Liberties and Civil Rights | ~13-18% (unverified) |
| 4 | American Political Ideologies and Beliefs | ~10-15% (unverified) |
| 5 | Political Participation | ~20-27% (unverified) |

---

## Subject Details (Stable — Not PDF-Dependent)

- Heavy on `type: "text"` stimuli (Supreme Court cases, Founding Documents, political speeches, SCOTUS opinions)
- Uses `type: "table"` for election data, polling data, demographic breakdowns
- Uses `type: "chart"` for voting trends, approval ratings, party identification over time
- **15 required Foundational Documents + 15 required SCOTUS cases** — Researcher must catalog all 30 from the PDF
- **MCQ stimulus target: ~90%** — stimulus-based dominates the real exam

## Drill Modes to Use
- `definition_to_term` — constitutional concepts, political terms, amendment content
- `significance_to_person` — Founding Fathers, key justices (significance given → student types name)
- `significance_to_case` — what a case established → student types case name (e.g. *Marbury v. Madison*)
- `concept_mc` — conceptual application questions (no stimulus, 1–3 sentence scenarios)
- **Typed : MC split: 70 : 30**
- Mark 8–15 cards per unit as `is_key_term: true` (typed-recall modes only, never concept_mc)
- No `term_to_definition`, `concept_to_example`, `person_to_significance` — all eliminated

## Content Pipeline
```
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Reviewer [Sonnet] → Commit
```
No Chemistry Checker needed. No pseudocode. Standard G1–G8 quality gates.

## Researcher Step Instructions

1. Read the CED PDF in full using the Read tool:
   `.planning/phases/08-ap-government-content/reference/ap-us-government-and-politics-course-and-exam-description.pdf`
2. Extract from the PDF:
   - Official unit count, unit names, CB exam weights
   - All learning objectives (with skill codes)
   - **Complete list of all 9 required Foundational Documents** (exact titles from PDF)
   - **Complete list of all required SCOTUS cases** (exact case names from PDF)
   - Exam format (MCQ count, time, FRQ types)
3. Write RESEARCH.md based ONLY on what the PDF contains
4. Derive meta-draft.json from the PDF unit list
5. Web research is BLOCKED for topic/content selection — only permitted for exam logistics if absent from the PDF

## Predefined Vocabulary List

**See:** `vocab-list.md` in this directory (`.planning/phases/08-ap-government-content/vocab-list.md`)

The Writer MUST generate a drill card for every term in the predefined vocabulary list. These terms are the **minimum drill coverage** — additional terms from the CED (especially required SCOTUS cases and Foundational Documents) are welcome.

- `is_key_term: true` on 8–15 highest-yield terms per unit
- Drill vocab and study guide key terms are automatically aligned since key terms are sourced from `is_key_term: true` drill cards

## Skipped Units — Units 3 and 5

**Units 3 (Civil Liberties and Civil Rights) and Unit 5 (Political Participation) are NOT generated in this phase.** Vocabulary for these units will be provided in a follow-up session.

- Generate drill, MCQ, and study guide files ONLY for Units 1, 2, and 4
- `meta.json` must list only Units 1, 2, and 4 (not Units 3 or 5)
- Do not generate empty or placeholder files for Units 3 or 5

## Reference Fixture Note
Previous content in `public/data/ap-government/` was generated from third-party sources and has been cleared. Writer must generate all content from scratch against the schemas in `/data/schemas/`.
