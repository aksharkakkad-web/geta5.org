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

## View 1 — Unit Selector

### Layout
- Page title: "Drills" with subtitle "Pick a unit to start drilling terms, concepts, and key people."
- **Study All** shortcut card at the top — full-width, accent-bordered, shows total card count badge. Queues cards from all units shuffled together.
- **Unit grid** below — 3-column grid on desktop, 2-column on tablet, 1-column on mobile

### Unit card anatomy
Each card contains:
- **Art area** (96px tall): unique gradient background + thematic emoji per unit, with drop shadow glow matching the gradient color
- **Unit number** label (e.g. "Unit 1") — muted uppercase micro text
- **Unit name** — H3 weight
- **Card count** — total drill cards in that unit (e.g. "48 cards")
- **Mastery bar** — reads `ascendly_mastery_[subject]_[unit]` from localStorage; shows 0% until practiced. Bar uses `var(--mastery-fill)` color.

### Interactions
- Hover: card lifts (`translateY(-2px)`) and border transitions to `var(--accent)`
- Click: loads drill JSON for selected unit, transitions to session view

---

## View 2 — Drill Session

### Session header (fixed at top of card)
- Left: subject unit label (e.g. "Unit 1 · Biological Bases")
- Right: progress bar (width = index/total) + "X of Y" count + live score badges (✓ N correct, ✗ N missed) in green/red pill styles

### Card lifecycle — 4 states

#### State 1: Prompt (idle)
- Mode tag: e.g. "Definition → Term" (muted uppercase)
- Prompt text (full definition, formula description, etc.)
- Empty input field with placeholder "Type your answer…"
- **Check Answer button — disabled** until user types anything
- "Show hint" link below (reveals `card.hint` if present)

#### State 2: Typing
- Input border transitions to `var(--accent)` (indigo)
- Check Answer button becomes active
- **Enter key** submits (same as clicking Check Answer)

#### State 3a: Correct
- Input border turns green (`var(--accent-success)`)
- Green feedback panel: "✓ Correct" label + canonical answer in bold + full definition
- "Next card →" button (green-tinted border)
- Score badge updates: correct count +1

#### State 3b: Wrong
- Input border turns red (`var(--accent-danger)`)
- Red feedback panel: "✗ Not quite" label + "You wrote: [user input]" + "Correct: [answer]" + definition
- "Next card →" button (red-tinted border)
- Score badge updates: missed count +1
- Card added to missed list for results screen

### Fuzzy matching
- Run `fuzzyMatch(userInput, card.answer)` from `utils/fuzzyMatch.ts`
- Also check `card.alternate_answers[]` — any match = correct
- Binary result only: correct or wrong. No partial credit state.

### KaTeX rendering
- Cards with `katex_required: true`: render `card.answer` through `KatexRenderer` in the feedback panel
- Prompts may contain inline `$...$` math — `KatexRenderer` handles inline rendering

### Card queue
- Cards shuffled on session start using `utils/scramble.ts`
- "Study All" mode concatenates all units' cards then shuffles
- Retry mode: re-queues only the missed cards array with `isRetry: true`

---

## View 3 — Results Screen

### Header
- Title: "Session Complete"
- Subtitle: unit name (e.g. "Unit 1 · Biological Bases")

### Score ring
- Conic gradient circle showing accuracy percentage (e.g. 72% filled in `var(--accent)`, remainder in `#222`)
- Inner circle shows percentage number + "score" label
- Contextual heading: "Good progress!" / "Keep at it!" / "Perfect score!" based on accuracy
- Subtext: card count + unit name (e.g. "20 cards · Unit 1")

### Missed cards list
- Section label "Missed Cards" with red count badge
- Each missed card shows:
  - Term (bold) + truncated definition
  - "you: [what they typed]" in red (right-aligned)
- If > 5 missed: show first 5, then "+ N more missed cards" link
- If 0 missed: section is hidden; heading becomes "Perfect score! 🎉"

### CTAs (top to bottom)
1. **Primary (accent):** "🔁 Retry missed cards (N)" — only shown if missed > 0; re-enters session view with missed cards only
2. **Secondary:** "← Back to AP Psychology" — navigates to subject hub
3. **Tertiary (link):** "Study another unit" — returns to unit selector view

---

## Data Flow

### Loading
- Drill JSON fetched client-side (`fetch('/data/[subject]/drills/unit-[n].json')`) when unit is selected
- Cards shuffled immediately via `utils/scramble.ts`
- "Study All" fetches all unit files in parallel via `Promise.all`

### Session state shape
```ts
interface SessionState {
  cards: DrillCard[]
  index: number
  answers: Record<string, 'correct' | 'wrong'>
  isRetry: boolean
}
```

### On session complete
1. Calculate `drillAccuracy = correctCount / totalCards` (0–1 float)
2. Write to localStorage:
   ```ts
   setMastery(subject, unitSlug, { drillAccuracy })
   // updates ascendly_mastery_[subject]_[unit]
   ```
3. Increment `ascendly_total_questions` by `totalCards`
4. Fire Supabase event (fire-and-forget):
   ```ts
   logEvent('drill_completed', subject, unitSlug, {
     accuracy: drillAccuracy,
     cards_count: totalCards,
     is_retry: isRetry
   }).catch(() => {})
   ```

---

## Styling Rules

- All colors via CSS custom properties — no hardcoded hex in components
- Dark theme only — matches existing `globals.css` tokens
- Unit card gradients: each unit gets a unique dark gradient (defined as a constant map in `UnitSelector.tsx`) — not derived from data
- Mobile-first: unit grid collapses to 2-col at `768px`, 1-col at `480px`
- Drill card is centered, max-width `560px`, with standard `var(--bg-card)` background
- No KaTeX in plain text — any formula in prompt/answer must use `KatexRenderer`

---

## Files to Create / Modify

| Action | File |
|--------|------|
| Rewrite | `app/[subject]/drills/page.tsx` |
| Create | `components/drill/UnitSelector.tsx` |
| Create | `components/drill/DrillSession.tsx` |
| Create | `components/drill/DrillCard.tsx` |
| Create | `components/drill/DrillResults.tsx` |
| Modify | `app/globals.css` — add any drill-specific CSS classes |

---

## Acceptance Criteria

1. Unit selector renders all units for the subject with gradient art, card count, and mastery bar
2. "Study All" card appears at top and queues all units' cards shuffled
3. Selecting a unit loads its JSON and enters session view
4. Input is disabled until user types; Enter key submits
5. Correct answers show green feedback with definition
6. Wrong answers show red feedback with user's input vs correct answer + definition
7. Score badges (✓ / ✗) update live in the session header
8. Session completes when last card is answered → results view
9. Results show score ring, missed cards list with what the user typed
10. "Retry missed" re-enters session with only missed cards
11. "Back to AP Psychology" navigates to subject hub
12. `drillAccuracy` written to localStorage on session complete
13. `drill_completed` Supabase event fired on session complete (fire-and-forget)
14. `ascendly_total_questions` incremented by card count
15. KaTeX renders correctly for `katex_required` cards
16. Fuzzy match accepts `alternate_answers`
17. All UI uses CSS custom properties — no hardcoded hex
18. Mobile layout tested at 375px, 768px, 1280px
