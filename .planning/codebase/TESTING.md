# Testing

**Analysis Date:** 2026-03-23

## Test Infrastructure

**Runner:** Jest `^30.3.0`
**TypeScript transform:** `ts-jest ^29.4.6`
**Environment:** `jest-environment-jsdom` (browser DOM simulation)
**Test command:** `npm test` (runs `jest`)
**Config:** `jest.config.ts` or inline in `package.json` (not verified — inferred from deps)

## Existing Tests

All tests live in `utils/__tests__/`:

### `scramble.test.ts`
Tests `utils/scramble.ts` (Fisher-Yates shuffle):
- Preserves all elements (sort-compare)
- Preserves array length
- Does not mutate input array

### `scoring.test.ts`
Tests `utils/scoring.ts` (score projection):
- Contents not read — tests the `projectScore()` function (0→1, 0.35→2, 0.5→3, 0.65→4, 0.8→5)

### `fuzzyMatch.test.ts`
Tests `utils/fuzzyMatch.ts`:
- Contents not read — validates fuzzy answer matching for drill free-response

### `subjects.test.ts`
Tests `utils/subjects.ts`:
- Contents not read — validates subject registry (slugs, unit counts, etc.)

## What Is NOT Tested

**Components:** No component tests exist. No `@testing-library/react` in dependencies.
**Pages:** No integration tests for Next.js pages or routing.
**localStorage:** No tests for `utils/localStorage.ts` (the core data persistence layer).
**Analytics:** No tests for `utils/analytics.ts` or the `/api/log-event` route.
**Streak:** No tests for `utils/streak.ts`.
**End-to-end:** No Playwright or Cypress setup.

## Testing Strategy (from CLAUDE.md Agent Pipeline)

The Tester agent in the Planner → Coder → Reviewer → **Tester** pipeline is responsible for:
- Verifying each Planner objective is actually met
- Not just running unit tests — verifying functional correctness of delivered features
- The screenshot loop (visual verification before marking UI work complete)

## Test Gaps for Upcoming Phases

**Phase 2 (Drill Interface) — High Priority Gaps:**
- Drill state machine transitions (unanswered → correct/incorrect → next)
- Fuzzy match acceptance/rejection across edge cases
- localStorage write on drill completion (mastery update correctness)
- Answer scrambling: no positional bias across 20+ renders (CLAUDE.md Critical Rule #9)

**Content Phases (6–12) — Required:**
- JSON schema validation against `data/schemas/*.schema.json`
- KaTeX string validity (parseable without errors)
- Answer key correctness (all `correct_index` values point to correct answers)
- Scramble invariant: correct answer appears in all positions across many renders

## Notes

- Jest + jsdom is appropriate for utility tests and component logic
- For visual UI verification, the project relies on the screenshot loop (human-in-the-loop)
- No CI/CD configured — tests run manually via `npm test`
- Adding `@testing-library/react` would be needed before writing component tests

---
*Testing analysis: 2026-03-23*
