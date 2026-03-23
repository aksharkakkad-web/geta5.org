# Phase 2 — Drill Interface Design Spec

**Date:** 2026-03-23
**Phase:** 2
**Status:** Approved

---

## Overview

The drill interface lets students practice AP exam vocabulary, formulas, and concepts using a type-your-answer flashcard system. It lives at `/[subject]/drills` and is a single route with three client-side views: unit selector → drill session → results.

---

## Architecture

### Routing
- **Single route:** `app/[subject]/drills/page.tsx` — `'use client'` component
- No sub-routes. All three views (unit-select, session, results) are managed via React state
- URL never changes during a session. Browser back exits to the subject hub.

### View state
```ts
type DrillView = 'unit-select' | 'session' | 'results'
```

### Component tree
```
app/[subject]/drills/page.tsx       'use client' orchestrator
  view === 'unit-select'  →  <UnitSelector />
  view === 'session'      →  <DrillSession />
  view === 'results'      →  <DrillResults />

components/drill/
  UnitSelector.tsx        unit grid with mastery bars, reads localStorage
  DrillSession.tsx        manages card queue, score, current index
  DrillCard.tsx           single card: prompt + input + feedback state machine
  DrillResults.tsx        score ring, missed cards list, CTAs
```

### Data files
```
data/[subject]/drills/unit-[n].json   loaded lazily on unit selection
```

---

## Drill Card Data Shape

From `data/schemas/drill.schema.json`. All fields used in components must match exactly:

```ts
interface DrillCard {
  id: string                  // e.g. "psych-u1-d001"
  unit: string                // e.g. "unit-1"
  subject: string             // e.g. "ap-psychology"
  mode: DrillMode
  prompt: string              // shown to student
  answer: string              // canonical correct answer
  alternate_answers?: string[] // also accepted by fuzzy matcher
  difficulty: 'easy' | 'medium' | 'hard'
  katex_required?: boolean    // true = render answer through KatexRenderer
}

type DrillMode =
  | 'definition_to_term'
  | 'formula_to_type'
  | 'person_to_significance'
  | 'event_to_date'
  | 'concept_to_example'
  | 'term_to_definition'
```

### Mode → display label mapping
Used as the mode tag in the session card header:

| Mode | Display label |
|------|--------------|
| `definition_to_term` | Definition → Term |
| `formula_to_type` | Formula → Type |
| `person_to_significance` | Person → Significance |
| `event_to_date` | Event → Date |
| `concept_to_example` | Concept → Example |
| `term_to_definition` | Term → Definition |

### Drill file structure
```json
{
  "subject": "ap-psychology",
  "unit": "1",
  "unit_name": "Biological Bases of Behavior",
  "cards": [ ...DrillCard[] ]
}
```

---

## View 1 — Unit Selector

### Layout
- Page title: "Drills" with subtitle "Pick a unit to start drilling terms, concepts, and key people."
- **Study All** shortcut card at the top — full-width, accent-bordered, shows total card count badge. Queues cards from all units shuffled together.
- **Unit grid** below — 3-column grid on desktop, 2-column at `768px`, 1-column at `375px`

### Unit card anatomy
Each card contains:
- **Art area** (96px tall): unique gradient background + thematic emoji per unit, with drop shadow glow matching the gradient color. Gradient map defined as a constant in `UnitSelector.tsx` keyed by unit number (1–9+). Units beyond the map repeat a default gradient.
- **Unit number** label (e.g. "Unit 1") — muted uppercase micro text
- **Unit name** — H3 weight
- **Card count** — total drill cards in that unit. Source: loaded from the unit's JSON file. If the file has not loaded yet (initial render), show a skeleton/dash. If 404 (no content yet), show "Coming soon" and disable the card.
- **Mastery bar** — reads `ascendly_mastery_[subject]_[unit]` from localStorage; shows 0% until practiced. Bar uses `var(--mastery-fill)` color.

### Missing data edge cases
- **Unit JSON returns 404:** Card appears with "Coming soon" label, muted style, click disabled. No error thrown.
- **Unit JSON fails to load (network error):** Same treatment as 404.
- **"Study All" when zero units have data:** Button is disabled with label "No content yet". Unit grid still renders with "Coming soon" state per card.
- **"Study All" with partial data:** Loads only the units that succeed, skips 404s silently. Badge shows combined card count of loaded units only.

### Interactions
- Hover: card lifts (`translateY(-2px)`) and border transitions to `var(--accent)`
- Click: loads drill JSON for selected unit, transitions to session view

---

## View 2 — Drill Session

### Session header (fixed at top of card)
- Left: subject unit label (e.g. "Unit 1 · Biological Bases")
- Right: progress bar (width = index/total) + "X of Y" count + live score badges (✓ N in `var(--accent-success)` pill, ✗ N in `var(--accent-danger)` pill)

### Session state shape
```ts
interface SessionState {
  cards: DrillCard[]
  index: number
  answers: Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
  isRetry: boolean
  unitSlug: string | 'all'   // 'all' for Study All sessions
}
```

### Card lifecycle — 4 states

#### State 1: Prompt (idle)
- Mode tag: display label from mode mapping table above (muted uppercase)
- Prompt text rendered through `KatexRenderer` — always parse `$...$` in prompts regardless of `katex_required` flag
- Empty input field with placeholder "Type your answer…"
- **Check Answer button — disabled** until user types at least 1 character
- No hint UI (schema has no `hint` field; `additionalProperties: false`)

#### State 2: Typing
- Input border transitions to `var(--accent)` (indigo)
- Check Answer button becomes active
- **Enter key** submits (same as clicking Check Answer)

#### State 3a: Correct
- Input border turns `var(--accent-success)`
- Green feedback panel: "✓ Correct" label + canonical answer in bold + full definition (the `prompt` text, shown as context)
- "Next card →" button (success-tinted)
- Score badge updates: correct count +1

#### State 3b: Wrong
- Input border turns `var(--accent-danger)`
- Red feedback panel: "✗ Not quite" label + "You wrote: [userInput]" + "Correct: [answer]" + prompt text as context
- "Next card →" button (danger-tinted)
- Score badge updates: missed count +1
- Card's `userInput` stored in `answers` record for results screen

### Fuzzy matching
- Run `fuzzyMatch(userInput, card.answer)` from `utils/fuzzyMatch.ts`
- Also check each item in `card.alternate_answers[]` via fuzzyMatch — any match = correct
- Binary result only: correct or wrong. No partial credit state.

### KaTeX rendering
- **Prompts:** Always parsed for `$...$` inline math regardless of `katex_required`
- **Answers:** Only rendered through `KatexRenderer` when `katex_required === true`. Plain-text answers render as-is.

### Card queue
- Cards shuffled on session start using `utils/scramble.ts`
- "Study All" mode concatenates all loaded units' cards then shuffles
- Retry mode: re-queues only the missed cards (cards with verdict `'wrong'` in `answers`) with `isRetry: true`

---

## View 3 — Results Screen

### Header
- Title: "Session Complete"
- Subtitle: unit name (e.g. "Unit 1 · Biological Bases") — or "All Units" for Study All sessions

### Score ring
- Conic gradient circle showing accuracy percentage filled in `var(--accent)`, empty arc in `var(--mastery-empty)`
- Inner circle shows percentage number + "score" label
- Contextual heading based on accuracy:
  - ≥ 90%: "Excellent work!"
  - ≥ 70%: "Good progress!"
  - ≥ 50%: "Keep at it!"
  - < 50%: "Room to grow!"
- Subtext: card count + unit name (e.g. "20 cards · Unit 1")

### Missed cards list
- Section label "Missed Cards" with `var(--accent-danger)` count badge
- Each missed card shows:
  - Term/answer (bold) + truncated prompt as definition
  - "you: [userInput]" in `var(--accent-danger)` (right-aligned); if `userInput` is empty string show "you: —"
- If > 5 missed: show first 5, then "+ N more" text (non-interactive)
- **If 0 missed:** entire missed section is hidden; heading becomes "Perfect score!" and retry CTA is hidden

### CTAs (top to bottom)
1. **Primary (accent):** Lucide `RotateCcw` icon + "Retry missed cards (N)" — hidden when missed === 0; re-enters session view with missed cards only (`isRetry: true`)
2. **Secondary (default border):** "← Back to [subject display name]" — navigates to `router.push(`/${subjectSlug}`)`
3. **Tertiary (link):** "Study another unit" — sets view back to `'unit-select'`

---

## Data Flow

### Loading
- Drill JSON fetched client-side via `fetch(`/data/${subject}/drills/unit-${n}.json`)` when unit is selected
- On success: cards are shuffled immediately via `utils/scramble.ts`
- On failure (404 or network): show inline error state, stay on unit-select view
- "Study All" fetches all unit JSON files via `Promise.all`; failed fetches are filtered out silently

### On session complete (non-retry, non-Study-All)
```ts
// 1. Calculate accuracy
const drillAccuracy = correctCount / totalCards  // 0–1 float

// 2. Write mastery to localStorage
const existing = lsGet(LS_KEYS.mastery(subject, unitSlug), {
  drillAccuracy: 0,
  mcqAccuracy: 0,
  totalAttempts: 0,
})
lsSet(LS_KEYS.mastery(subject, unitSlug), {
  ...existing,
  drillAccuracy,
  totalAttempts: existing.totalAttempts + totalCards,
})

// 3. Increment total questions answered
const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
lsSet(LS_KEYS.totalQuestions, prevTotal + totalCards)

// 4. Fire analytics (fire-and-forget, no .catch() needed — logEvent handles it)
logEvent({
  event_type: 'drill_completed',
  subject,
  unit: unitSlug,
  metadata: { accuracy: drillAccuracy, cards_count: totalCards, is_retry: false },
})
```

### On retry session complete
- **Do NOT write `drillAccuracy` to localStorage** — retry sessions are practice runs, not mastery measurements. Writing them would overwrite a good session score with a partial-deck retry score.
- **Do** increment `ascendly_total_questions` by the retry card count.
- **Do** fire `logEvent` with `is_retry: true`.

### On Study All session complete
- **Do NOT write mastery** — there is no single unit key to write against.
- **Do** increment `ascendly_total_questions`.
- **Do** fire `logEvent` with `unit: 'all'`.

---

## Styling Rules

- All colors via CSS custom properties — no hardcoded hex in components
- Dark theme only — matches existing `globals.css` tokens
- Unit card gradients: each unit gets a unique dark gradient defined as a constant map in `UnitSelector.tsx` keyed by unit number. Units beyond the map use a default fallback gradient.
- Mobile-first: unit grid collapses to 2-col at `768px`, 1-col at `375px`
- Drill card is centered, max-width `560px`, with `var(--bg-card)` background
- No KaTeX in plain text — any formula in prompt/answer must use `KatexRenderer`
- Icons: Lucide React SVG icons only — no emoji as icons in interactive elements

---

## Files to Create / Modify

| Action | File |
|--------|------|
| Rewrite | `app/[subject]/drills/page.tsx` |
| Create | `components/drill/UnitSelector.tsx` |
| Create | `components/drill/DrillSession.tsx` |
| Create | `components/drill/DrillCard.tsx` |
| Create | `components/drill/DrillResults.tsx` |
| Modify | `app/globals.css` — add drill-specific CSS if needed |

---

## Acceptance Criteria

1. Unit selector renders all units for the subject with gradient art, card count, and mastery bar
2. Units with missing JSON (404) show "Coming soon" in muted style with click disabled
3. "Study All" card appears at top; disabled with "No content yet" label if zero unit files load
4. Selecting a unit loads its JSON and enters session view
5. Input is disabled until user types at least 1 character; Enter key submits
6. Correct answers show green feedback panel with canonical answer + prompt context
7. Wrong answers show red feedback panel with user's input, correct answer, and prompt context
8. Score badges (✓ / ✗) update live in the session header after each card
9. Session completes when last card is answered → results view
10. Results show score ring with `var(--accent)` fill and `var(--mastery-empty)` empty arc
11. Results contextual heading matches accuracy tier (≥90% / ≥70% / ≥50% / <50%)
12. Missed cards list shows what the user typed vs correct answer; hidden when 0 missed
13. "Retry missed" CTA hidden when 0 missed; re-enters session with only missed cards (`isRetry: true`)
14. "Back to [subject name]" CTA uses the subject's display name dynamically (not hardcoded)
15. "Study another unit" returns to unit-select view without a page reload
16. `drillAccuracy` and `totalAttempts` written to `LS_KEYS.mastery(subject, unitSlug)` on non-retry, non-Study-All session complete
17. `ascendly_total_questions` incremented by card count on every session complete (including retry and Study All)
18. `drill_completed` logEvent fired on every session complete with correct `is_retry` flag
19. Retry sessions do not overwrite `drillAccuracy` in localStorage
20. Study All sessions do not write any mastery key
21. KaTeX renders correctly for `katex_required: true` cards; `$...$` in prompts always parsed
22. Fuzzy match accepts `alternate_answers`
23. All UI uses CSS custom properties — no hardcoded hex
24. Mobile layout functional at 375px, 768px, 1280px
