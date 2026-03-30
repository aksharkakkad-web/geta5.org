# Phase 11 Context — AP Computer Science Principles Content

**Wave:** 1 (parallel with Phases 6, 7, 8)
**Subject slug:** `ap-csp`
**ID prefix:** `csp`

## ⚠️ MANDATORY: CED PDF Is the Only Authoritative Source

The local CED PDF **MUST** be read before any other action:

```
.planning/phases/11-ap-csp-content/reference/ap-computer-science-principles-course-and-exam-description.pdf
```

**Rules:**
- ALL unit names, unit counts, and exam weights come from the CED PDF — nowhere else
- ALL learning objectives and skill codes come from the CED PDF — nowhere else
- ALL required computing concepts and testable content come from the CED PDF — nowhere else
- Web research (Fiveable, etc.) is **FORBIDDEN** as a source for topic selection or question content
- Web research is only permitted for supplementary context truly absent from the PDF — must be flagged as `[WEB]`

**Why:** A previous pipeline run used Fiveable as a source. All content was cleared and must be regenerated from the local CED PDF.

---

## Unit Structure

> **DO NOT use the unit structure below as authoritative.**
> It has not been verified against the local CED PDF. Researcher must confirm units, names, and weights from the PDF.

| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | Creative Development | ~10-13% (unverified) |
| 2 | Data | ~17-22% (unverified) |
| 3 | Algorithms and Programming | ~30-35% (unverified) |
| 4 | Computer Systems and Networks | ~11-15% (unverified) |
| 5 | Impact of Computing | ~21-26% (unverified) |

---

## Subject Details — CRITICAL RULES

- **College Board pseudocode ONLY** (Critical Rule #5) — NEVER use Python, Java, JavaScript, or any real language
- `type: "code"` stimulus for all code-based questions — uses CB pseudocode syntax exclusively
- Some questions are **multi-select** (choose 2) — mark both correct options `is_correct: true`
- Unit 1 (Creative Development) and Unit 5 (Impact of Computing) are concept-heavy with few/no code stimuli
- Units 2–3 are code-heavy
- **MCQ stimulus target: ~85%**

## College Board Pseudocode Reference (from CED — do not deviate)

```
Assignment:     a ← expression
Display:        DISPLAY(expression)
Input:          INPUT()
Selection:      IF(condition) { } ELSE { }
Iteration:      REPEAT n TIMES { }
                REPEAT UNTIL(condition) { }
                FOR EACH item IN list { }
Procedure:      PROCEDURE name(param1, param2) { RETURN(expression) }
List ops:       list[i], APPEND(list, value), INSERT(list, i, value),
                REMOVE(list, i), LENGTH(list)
Math:           MOD (modulus), RANDOM(a, b)
Logic:          NOT, AND, OR
Robot:          MOVE_FORWARD(), ROTATE_LEFT(), ROTATE_RIGHT(), CAN_MOVE(direction)
```

## Drill Modes to Use
- `definition_to_term` — computing concepts, internet protocols, data types, abstractions, algorithm definitions
- `concept_mc` — conceptual application questions; may include short pseudocode snippets inline in the question
- **Typed : MC split: 50 : 50**
- Mark 8–15 cards per unit as `is_key_term: true` (definition_to_term only, never concept_mc)
- No `term_to_definition`, `concept_to_example` — eliminated

## Content Pipeline
```
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Reviewer [Sonnet] → Commit
```
No Chemistry Checker needed. Standard G1–G9 quality gates.
**Gate G9 is critical:** Reviewer [Sonnet] must verify ZERO Python/Java/real-language code in any MCQ or drill.

## Researcher Step Instructions

1. Read the CED PDF in full using the Read tool:
   `.planning/phases/11-ap-csp-content/reference/ap-computer-science-principles-course-and-exam-description.pdf`
2. Extract from the PDF:
   - Official unit count, unit names, CB exam weights
   - All learning objectives (with skill codes / essential knowledge statements)
   - The official CB pseudocode specification (confirm it matches the reference above)
   - Exam format (MCQ count, single-select vs multi-select breakdown, Create PT details)
3. Write RESEARCH.md based ONLY on what the PDF contains
4. Derive meta-draft.json from the PDF unit list
5. Web research is BLOCKED for topic/content selection

## Predefined Vocabulary List

**See:** `vocab-list.md` in this directory (`.planning/phases/11-ap-csp-content/vocab-list.md`)

The Writer MUST generate a drill card for every term in the predefined vocabulary list. These terms are the **minimum drill coverage** — additional terms from the CED are welcome, but every listed term must have a drill card.

- The vocab list uses the user's textbook unit numbering (Units 1–10, Unit 9 skipped) — this does NOT match the 5 CED units. Map terms to the correct CED unit by topic alignment.
- `is_key_term: true` on 8–15 highest-yield terms per CED unit
- Drill vocab and study guide key terms are automatically aligned since key terms are sourced from `is_key_term: true` drill cards

## MCQ Application Question Standard

MCQs must emphasize **application over recall** per College Board CED. The CED tests computational thinking practices — prioritize scenario-based questions requiring students to apply computing concepts to new situations. Avoid questions that simply test verbatim vocab recall (that is what drills are for). MCQs should test understanding, tracing pseudocode, predicting program output, and applying computing concepts.

## Reference Fixture Note
Previous content in `public/data/ap-csp/` was generated from third-party sources and has been cleared. Writer must generate all content from scratch against the schemas in `/data/schemas/`.
