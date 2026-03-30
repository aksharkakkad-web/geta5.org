# Formula Flip-Card Self-Assessment

**Date:** 2026-03-28
**Scope:** `name_to_formula` drill cards only

## Problem
Typed input for formula cards is broken for complex notation (limits, arrows, trig). Students cannot type `lim_{x→c}` syntax on a standard keyboard. The notation parser lacks limit/arrow support.

## Solution
Replace typed input in `FormulaCard` with flip-card self-assessment.

## Flow
1. Card shows prompt (formula name) — no input field
2. Single **"Show Formula"** button
3. Click reveals KaTeX-rendered formula (display mode, centered)
4. Two buttons appear:
   - **"I knew this"** → verdict = `correct`, green state
   - **"I didn't know this"** → verdict = `wrong`, red state + card re-inserted into deck (RETRY_INTERVAL positions ahead, same as today)
5. After verdict: **"Next card →"** button (or Enter key) advances

## Out of Scope
- No changes to `definition_to_term`, `significance_*`, or `concept_mc` cards
- No changes to retry logic, scoring, draft persistence, or session state
- Remove: text input, live KaTeX preview, notation reference modal, `formatHint` display

## Files Changed
- `components/drill/DrillCard.tsx` — rewrite `FormulaCard` component only
- No schema changes, no data changes, no util changes
