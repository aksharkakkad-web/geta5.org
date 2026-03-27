# Phase 11 Context — AP Computer Science Principles Content

**Wave:** 1 (parallel with Phases 6, 7, 8)
**Subject slug:** `ap-csp`
**ID prefix:** `csp`
**Units:** 5

## Subject Details

| Unit | Name | CB Weight |
|------|------|-----------|
| 1 | Creative Development | ~10-13% |
| 2 | Data | ~17-22% |
| 3 | Algorithms and Programming | ~30-35% |
| 4 | Computer Systems and Networks | ~11-15% |
| 5 | Impact of Computing | ~21-26% |

> **Note:** Exact CB percentages must be confirmed by Researcher from the official CED.
> AP CSP exam: 70 MCQs in 120 minutes (single-select and multi-select). No FRQ section (Create Performance Task is separate).

## Special Notes — CRITICAL

- **College Board pseudocode ONLY** (Critical Rule #5) — NEVER use Python, Java, JavaScript, or any real programming language
- `type: "code"` stimulus for all code-based questions — uses CB pseudocode syntax
- CB pseudocode uses: `←` for assignment, `DISPLAY()`, `INPUT()`, `PROCEDURE`, `IF/ELSE`, `REPEAT`, `FOR EACH`, `RETURN`, `MOD`, `NOT/AND/OR`, `RANDOM(a,b)`, `APPEND()`, `INSERT()`, `REMOVE()`, `LENGTH()`
- Some questions are **multi-select** (choose 2) — the schema supports this via explanations, but the `is_correct` field should mark both correct options as `true` for multi-select questions. Flag these clearly.
- Unit 1 (Creative Development) and Unit 5 (Impact of Computing) are concept-heavy with few/no code stimuli
- Units 2-3 are code-heavy

## College Board Pseudocode Reference

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
- `concept_mc` — conceptual application questions; for CSP these may include short pseudocode snippets in the prompt (not as a stimulus block, just inline in the question)
- **Typed : MC split: 50 : 50**
- Mark 8–15 cards per unit as `is_key_term: true` (definition_to_term only, never concept_mc)
- No `term_to_definition`, `concept_to_example` — eliminated

## Content Pipeline
```
Researcher [Sonnet] → Planner [Sonnet] → Writer [Sonnet] → Reviewer [Opus] → Commit
```
No Chemistry Checker needed. Standard G1–G9 quality gates.
**Gate G9 is critical:** Reviewer [Opus] must verify ZERO Python/Java in any MCQ or drill.
