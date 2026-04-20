# AP World History Vocab Realignment — Design

**Date:** 2026-04-20
**Source of truth:** `C:\Users\kakka\Downloads\APWH All Units Vocab.pdf`
**Scope confirmed:** drills only — MCQs and study guides untouched (option A)

## Goal

Realign the AP World History drill set to match the vocab list in the user's PDF:
1. Add every PDF term missing from drills
2. Remove every drill term missing from the PDF
3. Reorganize the browse section by the PDF's region/empire clusters (replacing the current Terms/People filter)

## Scale

| Unit | PDF terms | Current drills | Add | Remove |
|------|---:|---:|---:|---:|
| 1 | 159 (15 groups) | 45 | 141 | 21 |
| 2 | 50 (7) | 42 | 29 | 21 |
| 3 | 140 (21) | 39 | 127 | 19 |
| 4 | 87 (16) | 40 | 66 | 21 |
| 5 | 153 (19) | 40 | 131 | 23 |
| 6 | 83 (12) | 35 | 67 | 14 |
| 7 | 139 (17) | 40 | 111 | 11 |
| 8 | 136 (16) | 37 | 104 | 8 |
| 9 | 97 (13) | 30 | 84 | 10 |
| **Total** | **1,044** | **348** | **~860** | **~148** |

Effectively a full regeneration. PDF is the master list.

## Schema change

Add an optional `group` field to `DrillCard`:

```ts
export interface DrillCard {
  // ... existing fields
  group?: string  // Region/empire/theme label for browse grouping (e.g. "East Asia")
}
```

Update `data/schemas/drill.schema.json` to allow (but not require) `group`. Backwards compatible — existing non-APWH subjects omit the field and render in an "All" section.

## Group labels (per unit)

Manually assigned by the Writer subagent, merging the PDF's region-terms and region-people clusters into one region. Examples:

- **Unit 1:** East Asia, South Asia, Southeast Asia, Islamic World, Mesoamerica, Andes & Pacific, Africa, Europe
- **Unit 2:** Silk Roads, Indian Ocean, Mongol Empire, Trans-Saharan (referring to Unit 1 Africa)
- **Unit 3:** East Asia (Ming/Qing), Russia, Ottoman, Safavid, Mughal, Tokugawa Japan, Western Europe, Renaissance, Reformation
- **Unit 4:** Maritime Technology, European Exploration, American Conquest, Atlantic System, Asian Trade Networks, Social Hierarchy
- **Unit 5:** Scientific Revolution, Enlightenment, Political Revolutions, Industrial Revolution (Origins), Industrial Expansion, Capitalism, Reactions & Reform, Social Change
- **Unit 6:** Imperialism Ideology, Resistance Movements, Scramble for Africa, Economic Imperialism, Migration
- **Unit 7:** Interwar Revolutions, WWI, WWII Origins, WWII Combat, Genocide, Interwar Economics (Part II is merged into Unit 7)
- **Unit 8:** Cold War Origins, Cold War Conflicts, Chinese Communism, Decolonization, Middle East & Africa, Late Cold War
- **Unit 9:** Technology, Environment, Disease, Economics, Culture, International Organizations

Final labels determined during Writer execution; Reviewer verifies cohesion.

## Browse view redesign

Replace the All/Terms/People filter chips with region-based sections:

- **Sections:** one per unique `group` value in the unit's cards, rendered in the order they first appear
- **Section header:** sticky within the scroll container, shows region name + card count pill
- **Within section:** terms (definition_to_term) first, then people (significance_to_person), then events/cases — alphabetical within each mode
- **Search:** searches across all sections, hides sections with zero matches
- **Cards missing a `group`:** rendered under "Other" section (backward compat)

## Cross-unit relocation

If drills currently place a term in Unit A but the PDF places it in Unit B, follow the PDF. Delete from Unit A, create fresh in Unit B. No soft-moves.

## Writer subagent instructions (per unit)

Input:
- PDF group listing for the unit (extracted by pre-processing script)
- Existing drill card patterns for tone/format
- Writer team role + schema (`docs/PRD.md` content_agent_team section)

Output: full replacement `public/data/ap-world-history/drills/unit-N.json` containing:
- One card per PDF term
- Correct `mode` inferred from term type:
  - Person name → `significance_to_person`
  - Named event / war / conference / revolt → `significance_to_event`
  - Specific legal/landmark case / document → `significance_to_case`
  - Concept, place, institution, technology → `definition_to_term`
- `group` field set to the region/empire label
- `prompt`: AP-level definition/significance (CED register, "Which of the following…" style N/A — drill prompts are descriptive, not questions)
- `answer`: exact term as it appears in the PDF (preserve diacritics, parenthetical disambiguation)
- `is_key_term`: 8-15 per unit, highest-yield only
- `difficulty`: 20% easy / 45% medium / 35% hard target spread per unit
- `id`: `whist-uN-dXXX` sequential, zero-padded 3 digits

Writer must write incrementally — max 50 cards per Write call — to stay under 32k token limit.

## Reviewer subagent checks (per unit)

1. Every PDF term has exactly one card
2. No card exists whose answer is not in the PDF term list
3. Modes are correctly inferred (spot-check 20 random cards)
4. `group` field present on every card
5. `is_key_term: true` count in [8, 15]
6. Difficulty spread within ±5% of target
7. IDs sequential, no gaps
8. JSON passes `data/schemas/drill.schema.json`
9. `answer` strings match PDF casing + diacritics
10. Cross-unit: no term appears in another unit's drill file

## Execution workflow

1. Schema change (coding) — `DrillCard` type + JSON schema
2. BrowseView redesign (coding) — Planner → Coder → Reviewer → Tester
3. Regenerate Unit 1 as canary (content pipeline)
4. Wave A: Units 2, 3, 4, 5 parallel subagents
5. Wave B: Units 6, 7, 8, 9 parallel subagents
6. Integration check + screenshot loop

## Out of scope (per user decision)

- MCQ updates when their referenced terms are removed from drills
- Study guide `key_terms` resync when is_key_term membership changes
- Other AP subjects (this is APWH-only)
