# Phase 2: Drill Interface - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Source:** PRD Express Path (docs/superpowers/specs/2026-03-23-phase2-drill-interface-design.md)

<domain>
## Phase Boundary

Replace the stub at `app/[subject]/drills/page.tsx` with a full drill interface. Deliver three client-side views (unit-select → session → results) managed via React state — no sub-routes. Write 4 new components under `components/drill/`. Load drill JSON from `data/[subject]/drills/unit-[n].json` client-side on unit selection. Write mastery to localStorage and fire analytics on session complete.

</domain>

<decisions>
## Implementation Decisions

### Routing & Architecture
- Single route: `app/[subject]/drills/page.tsx` — `'use client'` orchestrator component
- No sub-routes. All three views managed via React state: `type DrillView = 'unit-select' | 'session' | 'results'`
- URL never changes during a session. Browser back exits to subject hub.
- Component tree: `page.tsx` orchestrates `<UnitSelector />`, `<DrillSession />`, `<DrillResults />`

### Component Files (locked)
| Action | File |
|--------|------|
| Rewrite | `app/[subject]/drills/page.tsx` |
| Create | `components/drill/UnitSelector.tsx` |
| Create | `components/drill/DrillSession.tsx` |
| Create | `components/drill/DrillCard.tsx` |
| Create | `components/drill/DrillResults.tsx` |
| Modify | `app/globals.css` — drill-specific CSS if needed |

### Data Shape (locked — from drill.schema.json)
```ts
interface DrillCard {
  id: string
  unit: string
  subject: string
  mode: DrillMode
  prompt: string
  answer: string
  alternate_answers?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  katex_required?: boolean
}
type DrillMode = 'definition_to_term' | 'formula_to_type' | 'person_to_significance' | 'event_to_date' | 'concept_to_example' | 'term_to_definition'
```

Drill file structure: `{ subject, unit, unit_name, cards: DrillCard[] }`
Load path: `fetch('/data/${subject}/drills/unit-${n}.json')` client-side on unit selection.

### Session State Shape (locked)
```ts
interface SessionState {
  cards: DrillCard[]
  index: number
  answers: Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
  isRetry: boolean
  unitSlug: string | 'all'
}
```

### Unit Selector View (locked)
- Page title: "Drills", subtitle: "Pick a unit to start drilling terms, concepts, and key people."
- "Study All" shortcut card at top — full-width, accent-bordered, shows total card count badge
- Unit grid: 3-col desktop, 2-col at 768px, 1-col at 375px
- Each unit card: art area (96px tall, unique gradient + thematic emoji per unit number), unit number label (muted uppercase micro), unit name (H3), card count, mastery bar from localStorage
- Missing JSON (404 or network error): "Coming soon" label, muted style, click disabled, no error thrown
- "Study All" when zero units load: disabled with "No content yet" label
- "Study All" with partial data: loads only successful units, badge shows combined count of loaded units
- Hover: `translateY(-2px)` lift + border to `var(--accent)`

### Drill Card States (locked — 4 states)
1. **Prompt (idle):** Mode tag (muted uppercase), prompt via `KatexRenderer` (always parse `$...$`), empty input placeholder "Type your answer…", Check Answer button **disabled** until ≥1 char typed
2. **Typing:** Input border → `var(--accent)`, Check Answer active, Enter key submits
3. **Correct:** Input border → `var(--accent-success)`, green panel "✓ Correct" + canonical answer bold + prompt as context, "Next card →" button success-tinted, correct score badge +1
4. **Wrong:** Input border → `var(--accent-danger)`, red panel "✗ Not quite" + "You wrote: [input]" + "Correct: [answer]" + prompt context, "Next card →" danger-tinted, missed badge +1

### Fuzzy Matching (locked)
- Call `fuzzyMatch(userInput, card.answer)` from `utils/fuzzyMatch.ts`
- Also check each `card.alternate_answers[]` item via fuzzyMatch — any match = correct
- Binary result only: correct or wrong. No partial credit state.

### KaTeX Rendering (locked)
- **Prompts:** Always parse `$...$` inline math regardless of `katex_required`
- **Answers:** Only render through `KatexRenderer` when `katex_required === true`; plain-text answers render as-is

### Card Queue (locked)
- Shuffle on session start via `utils/scramble.ts`
- "Study All" concatenates all loaded units' cards then shuffles
- Retry: re-queues only cards with verdict `'wrong'` in `answers`, `isRetry: true`

### Results Screen (locked)
- Title: "Session Complete", subtitle: unit name or "All Units"
- **Score ring:** conic gradient circle — `var(--accent)` fill, `var(--mastery-empty)` empty arc, inner circle shows % + "score" label
- Contextual heading: ≥90% "Excellent work!", ≥70% "Good progress!", ≥50% "Keep at it!", <50% "Room to grow!"
- Subtext: card count + unit name (e.g. "20 cards · Unit 1")
- **Missed cards list:** "Missed Cards" section with `var(--accent-danger)` count badge; each card shows term/answer (bold) + truncated prompt + "you: [input]" (right-aligned, `var(--accent-danger)`); if input empty show "you: —"; if >5 missed, show first 5 + "+ N more" (non-interactive); if 0 missed: section hidden, heading "Perfect score!", retry CTA hidden
- **CTAs (top to bottom):**
  1. Primary accent: Lucide `RotateCcw` + "Retry missed cards (N)" — hidden when missed === 0
  2. Secondary border: "← Back to [subject display name]" — `router.push('/${subjectSlug}')`
  3. Tertiary link: "Study another unit" — sets view back to `'unit-select'`

### Data Flow on Session Complete (locked)
**Non-retry, non-Study-All:**
```ts
const drillAccuracy = correctCount / totalCards
const existing = lsGet(LS_KEYS.mastery(subject, unitSlug), { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 })
lsSet(LS_KEYS.mastery(subject, unitSlug), { ...existing, drillAccuracy, totalAttempts: existing.totalAttempts + totalCards })
const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
lsSet(LS_KEYS.totalQuestions, prevTotal + totalCards)
logEvent({ event_type: 'drill_completed', subject, unit: unitSlug, metadata: { accuracy: drillAccuracy, cards_count: totalCards, is_retry: false } })
```
**Retry sessions:** Do NOT write `drillAccuracy`. Do increment `totalQuestions`. Do fire logEvent with `is_retry: true`.
**Study All sessions:** Do NOT write any mastery key. Do increment `totalQuestions`. Do fire logEvent with `unit: 'all'`.

### Session Header (locked)
- Left: subject unit label (e.g. "Unit 1 · Biological Bases")
- Right: progress bar (width = index/total) + "X of Y" + live score badges (✓ N green pill, ✗ N red pill)

### Mode → Display Label Map (locked)
| Mode | Label |
|------|-------|
| `definition_to_term` | Definition → Term |
| `formula_to_type` | Formula → Type |
| `person_to_significance` | Person → Significance |
| `event_to_date` | Event → Date |
| `concept_to_example` | Concept → Example |
| `term_to_definition` | Term → Definition |

### Styling Rules (locked)
- All colors via CSS custom properties — no hardcoded hex
- Dark theme only — existing `globals.css` tokens
- Unit card gradients: unique dark gradient constant map in `UnitSelector.tsx` keyed by unit number; units beyond the map use default fallback gradient
- Drill card: centered, max-width `560px`, `var(--bg-card)` background
- Mobile-first: grid 3-col → 2-col at 768px → 1-col at 375px
- Icons: Lucide React SVG only — no emoji in interactive elements

### Claude's Discretion
- Exact gradient colors per unit number (choose aesthetically coherent dark gradients)
- Thematic emoji per unit (choose contextually appropriate; consistent with subject)
- Exact CSS class names for drill-specific styles in globals.css
- Internal component prop interfaces beyond what the spec mandates
- Transition timing details within the MASTER.md guidelines (150–300ms ease)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `design-system/ascendly/MASTER.md` — Color tokens, typography, spacing, component specs, anti-patterns, pre-delivery checklist

### Project Rules
- `CLAUDE.md` — Critical rules (KaTeX, screenshot loop, agent pipeline, localStorage patterns)

### Data Schemas
- `data/schemas/drill.schema.json` — Canonical drill card schema (all fields, types, enums)

### Existing Utilities (MUST use — do not reimplement)
- `utils/fuzzyMatch.ts` — Fuzzy answer matching; call `fuzzyMatch(input, answer)`
- `utils/scramble.ts` — Fisher-Yates shuffle; call `scramble(cards)`
- `utils/localStorage.ts` — `lsGet`, `lsSet`, `LS_KEYS` — all localStorage access goes through these
- `utils/analytics.ts` — `logEvent()` fire-and-forget wrapper
- `components/KatexRenderer.tsx` — KaTeX rendering component
- `utils/subjects.ts` — `getSubject(slug)` for subject display name

### Codebase Map
- `.planning/codebase/ARCHITECTURE.md` — App Router patterns, server/client boundary, data flow
- `.planning/codebase/CONVENTIONS.md` — TypeScript, CSS, naming, import conventions

### Phase Requirements
- `.planning/REQUIREMENTS.md` — DRILL-01 through DRILL-09

</canonical_refs>

<specifics>
## Specific Ideas

### Acceptance Criteria (all 24 — locked)
1. Unit selector renders all units with gradient art, card count, and mastery bar
2. Units with missing JSON (404) show "Coming soon" muted style, click disabled
3. "Study All" card at top; disabled with "No content yet" if zero unit files load
4. Selecting a unit loads JSON and enters session view
5. Input disabled until ≥1 char typed; Enter key submits
6. Correct answer: green feedback with canonical answer + prompt context
7. Wrong answer: red feedback with user input, correct answer, prompt context
8. Score badges (✓ / ✗) update live in session header after each card
9. Session ends when last card answered → results view
10. Score ring: `var(--accent)` fill, `var(--mastery-empty)` empty arc
11. Contextual heading matches accuracy tier (≥90/70/50/<50%)
12. Missed cards list with user input vs correct; hidden when 0 missed
13. "Retry missed" CTA hidden when 0 missed; re-enters with only missed cards, `isRetry: true`
14. "Back to [subject name]" uses dynamic display name (not hardcoded)
15. "Study another unit" returns to unit-select without page reload
16. `drillAccuracy` + `totalAttempts` written on non-retry, non-Study-All session complete
17. `ascendly_total_questions` incremented on every session complete (including retry + Study All)
18. `drill_completed` logEvent fired on every session complete with correct `is_retry` flag
19. Retry sessions do NOT overwrite `drillAccuracy`
20. Study All sessions do NOT write any mastery key
21. KaTeX renders for `katex_required: true`; `$...$` in prompts always parsed
22. Fuzzy match accepts `alternate_answers`
23. All UI uses CSS custom properties — no hardcoded hex
24. Mobile layout functional at 375px, 768px, 1280px

</specifics>

<deferred>
## Deferred Ideas

- Hint system — spec explicitly excludes it (`additionalProperties: false` in schema, no `hint` field)
- Audio pronunciation — not in scope
- Spaced repetition algorithm — Phase 13 (adaptive difficulty)
- Drill-specific analytics beyond `drill_completed` event — Phase 13 polish
- Content JSON files — content phases (6–12) generate these; Phase 2 only builds the interface

</deferred>

---

*Phase: 02-drill-interface*
*Context gathered: 2026-03-23 via PRD Express Path*
