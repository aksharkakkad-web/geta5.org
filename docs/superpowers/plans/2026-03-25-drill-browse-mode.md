# Drill Browse Mode — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Quiz/Browse toggle to the drills page so users can review any unit's terms and definitions in a searchable two-column table without being quizzed.

**Architecture:** Extend the `DrillView` state machine with a `'browse'` state. `browseMode` (toggle) and `browseCards` are lifted to `page.tsx` so the toggle position persists across unit navigation. A new `BrowseView` component handles the table, search, and filter chips. `parseInlineMath` is extracted from `DrillCard.tsx` into a shared util used by both `DrillCard` and `BrowseView`.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, KaTeX (via `KatexRenderer`), Jest (unit tests on pure functions)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `utils/parseInlineMath.tsx` | **Create** | Shared inline math parser (extracted from DrillCard) |
| `utils/drillSession.ts` | Modify | Add `'browse'` to `DrillView`; add `NormalizedCard` type + `normalizeCard()` |
| `components/drill/DrillCard.tsx` | Modify | Import `parseInlineMath` from util instead of defining locally |
| `components/drill/BrowseView.tsx` | **Create** | Two-column table with search + filter chips |
| `components/drill/UnitSelector.tsx` | Modify | Accept `browseMode`/`onBrowseToggle`/`onBrowse` props; render Quiz/Browse toggle |
| `app/[subject]/drills/page.tsx` | Modify | Add browse state + handlers; render `BrowseView` |
| `__tests__/utils/parseInlineMath.test.ts` | **Create** | Unit tests for the math parser |
| `__tests__/utils/drillSession.test.ts` | **Create** | Unit tests for `normalizeCard` |

---

## Task 1: Extract `parseInlineMath` to a shared util

**Files:**
- Create: `utils/parseInlineMath.tsx`
- Create: `__tests__/utils/parseInlineMath.test.ts`
- Modify: `components/drill/DrillCard.tsx`

- [ ] **Step 1.1: Write the failing tests**

Create `__tests__/utils/parseInlineMath.test.ts`:

```ts
import React from 'react'

jest.mock('@/components/KatexRenderer', () => ({
  __esModule: true,
  default: function KatexRenderer({ formula, displayMode }: { formula: string; displayMode: boolean }) {
    return null
  },
}))

import { parseInlineMath } from '@/utils/parseInlineMath'

describe('parseInlineMath', () => {
  it('returns empty array for empty string', () => {
    expect(parseInlineMath('')).toEqual([])
  })

  it('wraps plain text in a span with the text as children', () => {
    const nodes = parseInlineMath('hello world')
    expect(nodes).toHaveLength(1)
    const el = nodes[0] as React.ReactElement
    expect(el.type).toBe('span')
    expect(el.props.children).toBe('hello world')
  })

  it('creates a KatexRenderer node for an isolated $formula$ token', () => {
    const nodes = parseInlineMath('$x^2$')
    expect(nodes).toHaveLength(1)
    const el = nodes[0] as React.ReactElement
    expect(el.props.formula).toBe('x^2')
    expect(el.props.displayMode).toBe(false)
  })

  it('splits mixed text and math into three ordered nodes', () => {
    const nodes = parseInlineMath('Area is $\\pi r^2$ always')
    expect(nodes).toHaveLength(3)
    expect((nodes[0] as React.ReactElement).props.children).toBe('Area is ')
    expect((nodes[1] as React.ReactElement).props.formula).toBe('\\pi r^2')
    expect((nodes[2] as React.ReactElement).props.children).toBe(' always')
  })

  it('handles multiple math tokens in one string', () => {
    const nodes = parseInlineMath('$a$ and $b$')
    expect(nodes).toHaveLength(3) // KatexRenderer, span(' and '), KatexRenderer
    expect((nodes[0] as React.ReactElement).props.formula).toBe('a')
    expect((nodes[2] as React.ReactElement).props.formula).toBe('b')
  })
})
```

- [ ] **Step 1.2: Run tests — expect FAIL (module not found)**

```bash
npm test -- __tests__/utils/parseInlineMath.test.ts
```

Expected: `Cannot find module '@/utils/parseInlineMath'`

- [ ] **Step 1.3: Create `utils/parseInlineMath.tsx`**

```tsx
import React from 'react'
import KatexRenderer from '@/components/KatexRenderer'

/**
 * Splits text on $...$ inline math tokens.
 * Plain text segments → <span>, math segments → <KatexRenderer />.
 */
export function parseInlineMath(text: string): React.ReactNode[] {
  const regex = /\$([^$]+)\$/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }
    nodes.push(<KatexRenderer key={`math-${match.index}`} formula={match[1]} displayMode={false} />)
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return nodes
}
```

- [ ] **Step 1.4: Run tests — expect PASS**

```bash
npm test -- __tests__/utils/parseInlineMath.test.ts
```

Expected: 5 tests pass

- [ ] **Step 1.5: Update `DrillCard.tsx` to import from util**

Remove the `parseInlineMath` function definition (lines 21–40) and add this import at the top of `components/drill/DrillCard.tsx`:

```tsx
import { parseInlineMath } from '@/utils/parseInlineMath'
```

The two usages at `parseInlineMath(card.prompt)` (prompt rendering) and `parseInlineMath(card.answer)` (feedback rendering) remain unchanged.

- [ ] **Step 1.6: Verify the app still compiles**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 1.7: Commit**

```bash
git add utils/parseInlineMath.tsx __tests__/utils/parseInlineMath.test.ts components/drill/DrillCard.tsx
git commit -m "refactor: extract parseInlineMath to shared util"
```

---

## Task 2: Add `NormalizedCard` + `normalizeCard` and `'browse'` view to `drillSession.ts`

**Files:**
- Modify: `utils/drillSession.ts`
- Create: `__tests__/utils/drillSession.test.ts`

- [ ] **Step 2.1: Write the failing tests**

Create `__tests__/utils/drillSession.test.ts`:

```ts
import { normalizeCard, DrillCard } from '@/utils/drillSession'

const makeCard = (overrides: Partial<DrillCard>): DrillCard => ({
  id: 'test-1',
  unit: 'unit-1',
  subject: 'ap-psychology',
  mode: 'definition_to_term',
  prompt: 'default prompt',
  answer: 'default answer',
  difficulty: 'easy',
  ...overrides,
})

describe('normalizeCard', () => {
  it('swaps prompt/answer for definition_to_term so answer becomes the term', () => {
    const card = makeCard({ mode: 'definition_to_term', prompt: 'A nerve cell', answer: 'Neuron' })
    const result = normalizeCard(card)
    expect(result.term).toBe('Neuron')
    expect(result.definition).toBe('A nerve cell')
    expect(result.mode).toBe('definition_to_term')
  })

  it('keeps prompt as term for term_to_definition', () => {
    const card = makeCard({ mode: 'term_to_definition', prompt: 'Dopamine', answer: 'Neurotransmitter involved in reward' })
    const result = normalizeCard(card)
    expect(result.term).toBe('Dopamine')
    expect(result.definition).toBe('Neurotransmitter involved in reward')
  })

  it('keeps prompt as term for person_to_significance', () => {
    const card = makeCard({ mode: 'person_to_significance', prompt: 'Roger Sperry', answer: 'Split-brain research' })
    const result = normalizeCard(card)
    expect(result.term).toBe('Roger Sperry')
    expect(result.definition).toBe('Split-brain research')
  })

  it('keeps prompt as term for formula_to_type', () => {
    const card = makeCard({ mode: 'formula_to_type', prompt: "f'(x)", answer: 'Derivative' })
    const result = normalizeCard(card)
    expect(result.term).toBe("f'(x)")
    expect(result.definition).toBe('Derivative')
  })

  it('keeps prompt as term for event_to_date', () => {
    const card = makeCard({ mode: 'event_to_date', prompt: 'French Revolution', answer: '1789' })
    const result = normalizeCard(card)
    expect(result.term).toBe('French Revolution')
    expect(result.definition).toBe('1789')
  })

  it('keeps prompt as term for concept_to_example', () => {
    const card = makeCard({ mode: 'concept_to_example', prompt: 'Classical conditioning', answer: 'Pavlov\'s dogs salivating at a bell' })
    const result = normalizeCard(card)
    expect(result.term).toBe('Classical conditioning')
    expect(result.definition).toBe("Pavlov's dogs salivating at a bell")
  })

  it('preserves id and katex_required', () => {
    const card = makeCard({ id: 'abc-123', mode: 'term_to_definition', katex_required: true })
    const result = normalizeCard(card)
    expect(result.id).toBe('abc-123')
    expect(result.katex_required).toBe(true)
  })
})
```

- [ ] **Step 2.2: Run tests — expect FAIL**

```bash
npm test -- __tests__/utils/drillSession.test.ts
```

Expected: `normalizeCard is not exported from '@/utils/drillSession'`

- [ ] **Step 2.3: Add `NormalizedCard`, `normalizeCard`, and `'browse'` to `utils/drillSession.ts`**

Change line 32:
```ts
// Before
export type DrillView = 'unit-select' | 'session' | 'results'
```
```ts
// After
export type DrillView = 'unit-select' | 'session' | 'results' | 'browse'
```

Add these after the existing exports (after line 41, before `handleSessionComplete`):

```ts
export interface NormalizedCard {
  id: string
  term: string
  definition: string
  mode: DrillMode
  katex_required?: boolean
}

/**
 * Normalises a DrillCard so that `term` always holds the vocabulary word/name
 * and `definition` always holds the explanation, regardless of card mode.
 *
 * definition_to_term cards store the word in `answer` and the definition in `prompt` —
 * all other modes store the word/name in `prompt` and the explanation in `answer`.
 */
export function normalizeCard(card: DrillCard): NormalizedCard {
  if (card.mode === 'definition_to_term') {
    return {
      id: card.id,
      term: card.answer,
      definition: card.prompt,
      mode: card.mode,
      katex_required: card.katex_required,
    }
  }
  return {
    id: card.id,
    term: card.prompt,
    definition: card.answer,
    mode: card.mode,
    katex_required: card.katex_required,
  }
}
```

- [ ] **Step 2.4: Run tests — expect PASS**

```bash
npm test -- __tests__/utils/drillSession.test.ts
```

Expected: 7 tests pass

- [ ] **Step 2.5: Commit**

```bash
git add utils/drillSession.ts __tests__/utils/drillSession.test.ts
git commit -m "feat: add normalizeCard utility and browse view type"
```

---

## Task 3: Create `BrowseView` component

**Files:**
- Create: `components/drill/BrowseView.tsx`

- [ ] **Step 3.1: Create `components/drill/BrowseView.tsx`**

```tsx
'use client'

import React, { useState, useMemo } from 'react'
import { ChevronLeft, Search, X } from 'lucide-react'
import { DrillCard, NormalizedCard, normalizeCard } from '@/utils/drillSession'
import { parseInlineMath } from '@/utils/parseInlineMath'
import { getSubject } from '@/utils/subjects'

interface BrowseViewProps {
  cards: DrillCard[]
  unitSlug: string   // 'unit-1', 'unit-2', … or 'all'
  subject: string    // URL slug — passed to getSubject() to derive the unit label
  onBack: () => void
}

type FilterMode = 'all' | 'terms' | 'people'

const FILTER_CHIPS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'terms', label: 'Terms' },
  { key: 'people', label: 'People' },
]

export default function BrowseView({ cards, unitSlug, subject, onBack }: BrowseViewProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')

  // Derive unit label from subject + unitSlug
  const subjectData = getSubject(subject)
  let unitLabel: string
  if (unitSlug === 'all') {
    unitLabel = 'All Units'
  } else {
    const unitNumber = parseInt(unitSlug.replace('unit-', ''), 10)
    const unitData = subjectData?.units.find(u => u.number === unitNumber)
    unitLabel = unitData ? `Unit ${unitNumber} · ${unitData.name}` : `Unit ${unitNumber}`
  }

  // Normalize once — term/definition direction is now consistent
  const normalized = useMemo(() => cards.map(normalizeCard), [cards])

  // Apply filter chip then search
  const visible = useMemo(() => {
    let result = normalized
    if (filter === 'people') {
      result = result.filter(c => c.mode === 'person_to_significance')
    } else if (filter === 'terms') {
      result = result.filter(c => c.mode !== 'person_to_significance')
    }
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        c =>
          c.term.toLowerCase().includes(q) ||
          c.definition.toLowerCase().includes(q)
      )
    }
    return result
  }, [normalized, filter, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {unitLabel}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
            }}
          >
            {visible.length} {visible.length === 1 ? 'term' : 'terms'}
          </div>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
          >
            <ChevronLeft size={16} />
            Units
          </button>
        </div>
      </div>

      {/* Search input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
        }}
      >
        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms or definitions..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {FILTER_CHIPS.map(chip => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            style={{
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border:
                filter === chip.key
                  ? '1px solid color-mix(in srgb, var(--accent) 50%, transparent)'
                  : '1px solid var(--bg-border)',
              background:
                filter === chip.key
                  ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
                  : 'var(--bg-card)',
              color: filter === chip.key ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 150ms ease',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {visible.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: 'var(--text-muted)',
            fontSize: '0.9375rem',
          }}
        >
          No terms match your search.
        </div>
      ) : (
        /* Table */
        <div
          style={{
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Column headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              padding: '10px 20px',
              background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
              borderBottom: '1px solid var(--bg-border)',
            }}
          >
            {['Term', 'Definition'].map(label => (
              <span
                key={label}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Rows */}
          {visible.map((card, i) => (
            <div
              key={card.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                padding: '14px 20px',
                gap: '16px',
                alignItems: 'start',
                borderBottom: i < visible.length - 1 ? '1px solid var(--bg-border)' : 'none',
                background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
              }}
            >
              {/* Term cell */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {card.term}
                </span>
                {card.mode === 'person_to_significance' && (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em',
                      color: 'var(--accent-success)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'color-mix(in srgb, var(--accent-success) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--accent-success) 25%, transparent)',
                      flexShrink: 0,
                    }}
                  >
                    person
                  </span>
                )}
              </div>

              {/* Definition cell */}
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                {card.katex_required ? parseInlineMath(card.definition) : card.definition}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3.2: Commit**

```bash
git add components/drill/BrowseView.tsx
git commit -m "feat: add BrowseView component with search and filter chips"
```

---

## Task 4: Update `UnitSelector` with toggle and `onBrowse` prop

**Files:**
- Modify: `components/drill/UnitSelector.tsx`

- [ ] **Step 4.1: Update the `UnitSelectorProps` interface**

Replace the existing interface (lines 10–13):

```tsx
// Before
interface UnitSelectorProps {
  subject: string
  onStart: (session: SessionState) => void
}
```

```tsx
// After
interface UnitSelectorProps {
  subject: string
  onStart: (session: SessionState) => void
  browseMode: boolean
  onBrowseToggle: (value: boolean) => void
  onBrowse: (cards: DrillCard[], unitSlug: string) => void
}
```

Update the function signature on line 33:

```tsx
// Before
export default function UnitSelector({ subject, onStart }: UnitSelectorProps) {
```

```tsx
// After
export default function UnitSelector({ subject, onStart, browseMode, onBrowseToggle, onBrowse }: UnitSelectorProps) {
```

- [ ] **Step 4.2: Update `handleStudyAll` to branch on `browseMode`**

Replace the existing `handleStudyAll` (lines 82–91):

```tsx
// Before
const handleStudyAll = () => {
  if (studyAllDisabled) return
  onStart({
    cards: scramble(allLoadedCards),
    index: 0,
    answers: {},
    isRetry: false,
    unitSlug: 'all',
  })
}
```

```tsx
// After
const handleStudyAll = () => {
  if (studyAllDisabled) return
  if (browseMode) {
    onBrowse(allLoadedCards, 'all')
  } else {
    onStart({
      cards: scramble(allLoadedCards),
      index: 0,
      answers: {},
      isRetry: false,
      unitSlug: 'all',
    })
  }
}
```

- [ ] **Step 4.3: Update `handleUnitClick` to branch on `browseMode`**

Replace the existing `handleUnitClick` (lines 93–101):

```tsx
// Before
const handleUnitClick = (unitNumber: number, cards: DrillCard[]) => {
  onStart({
    cards: scramble(cards),
    index: 0,
    answers: {},
    isRetry: false,
    unitSlug: `unit-${unitNumber}`,
  })
}
```

```tsx
// After
const handleUnitClick = (unitNumber: number, cards: DrillCard[]) => {
  if (browseMode) {
    onBrowse(cards, `unit-${unitNumber}`)
  } else {
    onStart({
      cards: scramble(cards),
      index: 0,
      answers: {},
      isRetry: false,
      unitSlug: `unit-${unitNumber}`,
    })
  }
}
```

- [ ] **Step 4.4: Add the Quiz/Browse toggle to the JSX**

In the return statement, locate the page header block (the `<div>` containing the `<h1>` and `<p>`). Insert the toggle immediately **after** the closing `</div>` of the page header and **before** the unit grid `<div>`:

```tsx
{/* Quiz / Browse toggle */}
<div
  style={{
    display: 'flex',
    background: 'var(--bg-card)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-md)',
    padding: '3px',
    width: 'fit-content',
  }}
>
  {([
    { value: false, icon: '⚡', label: 'Quiz' },
    { value: true, icon: '📖', label: 'Browse' },
  ] as const).map(({ value, icon, label }) => (
    <button
      key={label}
      onClick={() => onBrowseToggle(value)}
      style={{
        padding: '7px 18px',
        borderRadius: '6px',
        border: 'none',
        background: browseMode === value ? 'var(--accent)' : 'transparent',
        color: browseMode === value ? 'white' : 'var(--text-muted)',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 150ms ease, color 150ms ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  ))}
</div>
```

- [ ] **Step 4.5: Commit**

```bash
git add components/drill/UnitSelector.tsx
git commit -m "feat: add Quiz/Browse toggle and onBrowse handler to UnitSelector"
```

---

## Task 5: Wire `page.tsx` — browse state, handlers, and `BrowseView` render

**Files:**
- Modify: `app/[subject]/drills/page.tsx`

- [ ] **Step 5.1: Add new imports**

At the top of `app/[subject]/drills/page.tsx`, add:

```tsx
// Add to existing import from '@/utils/drillSession':
import type { DrillView, SessionState, DrillCard } from '@/utils/drillSession'

// Add new component import:
import BrowseView from '@/components/drill/BrowseView'
```

The existing `import type { DrillView, SessionState } from '@/utils/drillSession'` on line 8 becomes:

```tsx
import type { DrillView, SessionState, DrillCard } from '@/utils/drillSession'
```

- [ ] **Step 5.2: Add browse state variables**

After the existing `const [session, setSession] = useState<SessionState | null>(null)` line, add:

```tsx
const [browseMode, setBrowseMode] = useState(false)
const [browseCards, setBrowseCards] = useState<DrillCard[] | null>(null)
const [browseUnitSlug, setBrowseUnitSlug] = useState<string | null>(null)
```

- [ ] **Step 5.3: Add `handleBrowse` and `handleBrowseBack` handlers**

After the existing `handleUnitSelect` handler, add:

```tsx
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

- [ ] **Step 5.4: Pass new props to `UnitSelector`**

Update the `<UnitSelector>` render from:

```tsx
<UnitSelector subject={subject} onStart={handleStart} />
```

to:

```tsx
<UnitSelector
  subject={subject}
  onStart={handleStart}
  browseMode={browseMode}
  onBrowseToggle={setBrowseMode}
  onBrowse={handleBrowse}
/>
```

- [ ] **Step 5.5: Add `BrowseView` to the render**

After the `{isSession && ...}` block and before the `{view === 'results' && ...}` block, add:

```tsx
{view === 'browse' && browseCards && browseUnitSlug && (
  <BrowseView
    cards={browseCards}
    unitSlug={browseUnitSlug}
    subject={subject}
    onBack={handleBrowseBack}
  />
)}
```

- [ ] **Step 5.6: Run full test suite**

```bash
npm test
```

Expected: All tests pass (parseInlineMath × 5, normalizeCard × 7)

- [ ] **Step 5.7: Run build to verify no TypeScript errors**

```bash
npm run build
```

Expected: Build completes with no errors or type warnings.

- [ ] **Step 5.8: Commit**

```bash
git add app/[subject]/drills/page.tsx
git commit -m "feat: wire browse mode into drills page"
```

---

## Manual Verification Checklist

After completing all tasks, verify these in the browser against `npm run dev`:

- [ ] Quiz/Browse toggle appears on the drills unit selector
- [ ] Clicking Browse → clicking a unit → browse table loads with correct terms
- [ ] Clicking "← Units" returns to unit selector with Browse tab still active
- [ ] "Study All" in Browse mode shows all units' terms in one table
- [ ] Typing in the search box filters both Term and Definition columns in real time
- [ ] Clearing search (✕ button) resets the list
- [ ] Filter chips — Terms hides people rows; People shows only person rows; All resets
- [ ] Roger Sperry (and similar) shows the green `person` badge in the Term cell
- [ ] Toggling back to Quiz mode and clicking a unit starts a quiz session normally
- [ ] Toggle position is preserved when navigating into browse and back out

---

## Self-Review Notes

**Spec coverage:**
- ✅ Browse view type added to DrillView
- ✅ browseMode in page.tsx (not UnitSelector) — toggle preserved on back navigation
- ✅ handleBrowse / handleBrowseBack handlers
- ✅ Study All in browse mode → onBrowse(allLoadedCards, 'all')
- ✅ normalizeCard covers all 6 DrillMode values
- ✅ Search filters both term and definition columns
- ✅ Filter chips: All / Terms / People
- ✅ person_to_significance → green `person` badge
- ✅ katex_required → parseInlineMath in definition cell
- ✅ Empty state message
- ✅ parseInlineMath extracted to shared util
- ✅ DrillCard updated to import from shared util

**Type consistency check:**
- `NormalizedCard` defined in Task 2, consumed in Task 3 (BrowseView) — ✅
- `normalizeCard` exported in Task 2, imported in BrowseView — ✅
- `parseInlineMath` exported in Task 1, imported in DrillCard (Task 1) and BrowseView (Task 3) — ✅
- `browseMode`/`onBrowseToggle`/`onBrowse` props defined in Task 4 UnitSelectorProps, passed in Task 5 — ✅
- `BrowseViewProps` `unitSlug` / `subject` match what page.tsx passes in Task 5 — ✅
