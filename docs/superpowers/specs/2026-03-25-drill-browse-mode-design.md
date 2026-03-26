# Drill Browse Mode — Design Spec
**Date:** 2026-03-25
**Status:** Approved

---

## Overview

Add a non-quiz "Browse" mode to the drills interface. Users can review all terms and definitions for a unit in a searchable, filterable two-column table — without being quizzed. Entry is via a Quiz/Browse toggle on the existing drills unit-selector page.

---

## Architecture

### View State Machine

Add `'browse'` to the existing `DrillView` union type in `utils/drillSession.ts`:

```ts
export type DrillView = 'unit-select' | 'session' | 'results' | 'browse'
```

Updated flow:

```
unit-select (Browse tab) ──[unit click]──▶ browse ──[← Units]──▶ unit-select (Browse tab)
unit-select (Quiz tab)   ──[unit click]──▶ session ──▶ results
```

### State additions in `app/[subject]/drills/page.tsx`

```ts
const [browseMode, setBrowseMode] = useState(false)          // Quiz vs Browse toggle
const [browseCards, setBrowseCards] = useState<DrillCard[] | null>(null)
const [browseUnitSlug, setBrowseUnitSlug] = useState<string | null>(null)
```

`browseMode` lives in the page (not UnitSelector) so the toggle position is preserved when the user navigates into a browse view and hits back. UnitSelector receives it as a controlled prop.

New handlers:

```ts
const handleBrowse = (cards: DrillCard[], unitSlug: string) => {
  setBrowseCards(cards)
  setBrowseUnitSlug(unitSlug)
  setView('browse')
}

const handleBrowseBack = () => {
  setBrowseCards(null)
  setBrowseUnitSlug(null)
  setView('unit-select')
}
```

### Files changed

| File | Change |
|---|---|
| `utils/drillSession.ts` | Add `'browse'` to `DrillView` type |
| `utils/parseInlineMath.ts` | **New.** Extract `parseInlineMath()` from `DrillCard.tsx` |
| `components/drill/DrillCard.tsx` | Import `parseInlineMath` from `utils/parseInlineMath.ts` instead of defining it locally |
| `app/[subject]/drills/page.tsx` | Add `browseMode`, `browseCards`, `browseUnitSlug` state; add `handleBrowse` / `handleBrowseBack`; render `<BrowseView>` when `view === 'browse'`; pass `browseMode` + `onBrowseToggle` + `onBrowse` to UnitSelector |
| `components/drill/UnitSelector.tsx` | Accept `browseMode`, `onBrowseToggle`, `onBrowse` props; render Quiz/Browse toggle; call `onBrowse` instead of `onStart` when `browseMode` is true |
| `components/drill/BrowseView.tsx` | **New component** — see below |

---

## BrowseView Component

### Props

```ts
interface BrowseViewProps {
  cards: DrillCard[]
  unitSlug: string        // e.g. 'unit-1' or 'all'
  subject: string         // used with getSubject() to derive the unit label for the header
  onBack: () => void
}
```

### Layout

```
[← Units]        Unit 1 · Biological Bases of Behavior    [58 terms]

[🔍 Search terms or definitions...]

[All]  [Terms]  [People]

┌─────────────────┬──────────────────────────────────────────────┐
│ Term            │ Definition                                   │
├─────────────────┼──────────────────────────────────────────────┤
│ Neuron          │ A nerve cell that receives and transmits...  │
│ Dendrites       │ Branching extensions of a neuron...          │
│ Roger Sperry 👤 │ Split-brain research revealing...            │
└─────────────────┴──────────────────────────────────────────────┘
```

### Data normalisation

Drill cards must be normalised before display — the "Term" column always shows the vocabulary word/person name, and the "Definition" column always shows the explanation:

| Card mode | Term column | Definition column | Filter category |
|---|---|---|---|
| `definition_to_term` | `card.answer` | `card.prompt` | Terms |
| `term_to_definition` | `card.prompt` | `card.answer` | Terms |
| `person_to_significance` | `card.prompt` | `card.answer` | People |

### Search

- Single text input, controlled
- Filters rows where either the normalised term **or** definition contains the search string (case-insensitive substring)
- Applied after the mode filter chip

### Filter chips

- **All** — show all normalised rows
- **Terms** — `definition_to_term` + `term_to_definition` cards only
- **People** — `person_to_significance` cards only
- Only one chip active at a time; default is All

### People tag

Rows whose source card has `mode === 'person_to_significance'` render a small inline `person` badge next to the term name (green, matching `--accent-success`).

### KaTeX

If a card has `katex_required: true`, the Definition cell renders via `parseInlineMath()` rather than plain text. `parseInlineMath` must be extracted from `DrillCard.tsx` into `utils/parseInlineMath.ts` and exported — both `DrillCard` and `BrowseView` import it from there. This avoids duplication.

### Empty state

If search + filter combination yields zero rows: show a short message ("No terms match your search") centred below the filter row.

---

## UnitSelector Changes

### New props

```ts
interface UnitSelectorProps {
  subject: string
  onStart: (session: SessionState) => void
  browseMode: boolean
  onBrowseToggle: (value: boolean) => void
  onBrowse: (cards: DrillCard[], unitSlug: string) => void
}
```

### Toggle

Rendered between the page subtitle and the "Study All" banner. Two-segment pill: **⚡ Quiz** / **📖 Browse**. Active segment has `background: var(--accent)`, inactive shows `color: var(--text-muted)`.

### Unit card click behaviour

- `browseMode === false` → existing `onStart()` call (no change)
- `browseMode === true` → call `onBrowse(cards, unitSlug)` instead

### "Study All" in browse mode

When `browseMode` is true, the "Study All" banner calls `onBrowse(allLoadedCards, 'all')` instead of `onStart`. The BrowseView unit label reads "All Units" for `unitSlug === 'all'`.

---

## Out of Scope

- Sorting (alphabetical, by difficulty) — can be added later
- Persistent scroll position when returning from browse
- Mastery indicators per row
- Keyboard navigation within the table

---

## Success Criteria

1. Quiz/Browse toggle renders on the unit-selector page; clicking it switches modes without triggering a session
2. Clicking a unit card in Browse mode navigates to the browse table for that unit
3. Clicking "← Units" returns to unit-selector with the Browse tab still active
4. "Study All" in Browse mode shows all units' terms in one table
5. Real-time search filters both the term and definition columns
6. Filter chips (All / Terms / People) correctly partition the rows
7. `person_to_significance` cards display person name as term, significance as definition, with a green `person` badge
8. KaTeX renders correctly for math subjects
9. Empty search state shows a clear message
10. Toggle position is preserved across browse → back → browse navigations
