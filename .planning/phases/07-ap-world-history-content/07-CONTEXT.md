# Phase 07 Context — AP World History Content

**Wave:** 1 (parallel with Phases 6, 8, 11)
**Subject slug:** `ap-world-history`
**ID prefix:** `whist`

## ⚠️ MANDATORY: CED PDF Is the Only Authoritative Source

The local CED PDF **MUST** be read before any other action:

```
.planning/phases/07-ap-world-history-content/reference/ap-world-history-modern-course-and-exam-description.pdf
```

**Rules:**
- ALL unit names, unit counts, and exam weights come from the CED PDF — nowhere else
- ALL learning objectives and skill codes come from the CED PDF — nowhere else
- ALL testable vocabulary, concepts, people, and events come from the CED PDF — nowhere else
- Web research (Fiveable, Albert.io, Barron's, etc.) is **FORBIDDEN** as a source for topic selection or question content
- Web research is only permitted for supplementary context the PDF does not cover — must be flagged as `[WEB]`

**Why:** A previous pipeline run used third-party study sites. All content was cleared and must be regenerated from the CED PDF.

---

## Unit Structure

> **DO NOT use the unit structure below as authoritative.**
> It has not been verified against the CED PDF. Researcher must derive units, names, and weights from the PDF.

| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | The Global Tapestry (1200–1450) | ~8-10% (unverified) |
| 2 | Networks of Exchange (1200–1450) | ~8-10% (unverified) |
| 3 | Land-Based Empires (1450–1750) | ~12-15% (unverified) |
| 4 | Transoceanic Interconnections (1450–1750) | ~12-15% (unverified) |
| 5 | Revolutions (1750–1900) | ~12-15% (unverified) |
| 6 | Consequences of Industrialization (1750–1900) | ~12-15% (unverified) |
| 7 | Global Conflict (1900–present) | ~8-10% (unverified) |
| 8 | Cold War and Decolonization (1900–present) | ~8-10% (unverified) |
| 9 | Globalization (1900–present) | ~8-10% (unverified) |

---

## Subject Details (Stable — Not PDF-Dependent)

- Heavy on `type: "text"` stimuli (primary source passages, historical excerpts)
- Uses `type: "table"` for trade routes, empire comparisons, demographic data
- Uses `type: "chart"` for population graphs, trade volume over time
- **MCQ stimulus target: ~95%** — stimulus-based is the norm on the real AP exam
- Periodization is heavily tested — `significance_to_event` covers impact/significance → student types event name

## Drill Modes to Use
- `definition_to_term` — key historical concepts, movements, systems
- `significance_to_person` — leaders, thinkers, explorers (significance given → student types name)
- `significance_to_event` — significance/impact given → student types event name (periodization focus)
- `concept_mc` — conceptual application questions (no stimulus, 1–3 sentence scenarios)
- **Typed : MC split: 75 : 25**
- Mark 8–15 cards per unit as `is_key_term: true` (typed-recall modes only, never concept_mc)
- No `term_to_definition`, `person_to_significance`, `event_to_date` — all eliminated

## Content Pipeline
```
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Reviewer [Sonnet] → Commit
```
No Chemistry Checker needed. No pseudocode. Standard G1–G8 quality gates.

## Researcher Step Instructions

1. Read the CED PDF in full using the Read tool:
   `.planning/phases/07-ap-world-history-content/reference/ap-world-history-modern-course-and-exam-description.pdf`
2. Extract from the PDF:
   - Official unit count, unit names, CB exam weights
   - All learning objectives (with skill codes)
   - All required content (key terms, required historical figures, required events/developments)
   - Exam format (MCQ count, time, SAQ/DBQ/LEQ format)
   - Any required primary sources or documents
3. Write RESEARCH.md based ONLY on what the PDF contains
4. Derive meta-draft.json from the PDF unit list
5. Web research is BLOCKED for topic/content selection — only permitted for exam logistics if absent from the PDF

## Predefined Vocabulary List

**See:** `vocab-list.md` in this directory (`.planning/phases/07-ap-world-history-content/vocab-list.md`)

The Writer MUST generate a drill card for every term in the predefined vocabulary list. These 9 units of terms are the **minimum drill coverage** — additional terms from the CED are welcome, but every listed term must have a drill card.

- Unit numbering in `vocab-list.md` matches the 9 CED units — map terms directly
- `is_key_term: true` on 8–15 highest-yield terms per unit — these become study guide key terms
- Drill vocab and study guide key terms are automatically aligned since key terms are sourced from `is_key_term: true` drill cards

## Reference Fixture Note
Previous content in `public/data/ap-world-history/` was generated from third-party sources and has been cleared. Writer must generate all content from scratch against the schemas in `/data/schemas/`.
