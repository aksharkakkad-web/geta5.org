# Phase 2 — Drill Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full drill interface at `/[subject]/drills` — unit selector, type-your-answer session, and results screen — wired to localStorage and Supabase.

**Architecture:** Single `'use client'` page at `app/[subject]/drills/page.tsx` manages three views (unit-select → session → results) via React state. Pure drill logic lives in `utils/drill.ts` (TDD'd). Four focused components handle rendering: `UnitSelector`, `DrillSession`, `DrillCard`, `DrillResults`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4, CSS custom properties, Lucide React icons, KaTeX via existing `KatexRenderer` component, Jest (node env) for utility tests, existing `utils/fuzzyMatch.ts`, `utils/scramble.ts`, `utils/localStorage.ts`, `utils/analytics.ts`.

**Spec:** `docs/superpowers/specs/2026-03-23-phase2-drill-interface-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `utils/drill.ts` | Pure drill logic: types, mode label map, gradeAnswer, calculateScore, getMissedCards |
| Create | `utils/__tests__/drill.test.ts` | Unit tests for all pure drill functions |
| Create | `components/drill/UnitSelector.tsx` | Unit grid with gradient art, mastery bars, Study All card, loading/error states |
| Create | `components/drill/DrillCard.tsx` | Single card UI state machine: idle → typing → correct/wrong feedback |
| Create | `components/drill/DrillSession.tsx` | Card queue, progress bar, score badges, card navigation |
| Create | `components/drill/DrillResults.tsx` | Score ring, missed cards list, retry/back/study-another CTAs |
| Rewrite | `app/[subject]/drills/page.tsx` | 'use client' orchestrator: view state, data loading, localStorage writes, analytics |
| Modify | `app/globals.css` | `.drill-score-ring` conic gradient utility |

---

## Task 1: Drill Utilities (TDD)

**Files:**
- Create: `utils/drill.ts`
- Create: `utils/__tests__/drill.test.ts`

- [ ] **Step 1: Write failing tests for `getModeLabel`**

Create `utils/__tests__/drill.test.ts`:

```ts
import { getModeLabel, gradeAnswer, calculateScore, getMissedCards } from '../drill'
import type { DrillCard } from '../drill'

// ── getModeLabel ──────────────────────────────────────────
describe('getModeLabel', () => {
  it('returns correct label for definition_to_term', () => {
    expect(getModeLabel('definition_to_term')).toBe('Definition → Term')
  })
  it('returns correct label for formula_to_type', () => {
    expect(getModeLabel('formula_to_type')).toBe('Formula → Type')
  })
  it('returns correct label for person_to_significance', () => {
    expect(getModeLabel('person_to_significance')).toBe('Person → Significance')
  })
  it('returns correct label for event_to_date', () => {
    expect(getModeLabel('event_to_date')).toBe('Event → Date')
  })
  it('returns correct label for concept_to_example', () => {
    expect(getModeLabel('concept_to_example')).toBe('Concept → Example')
  })
  it('returns correct label for term_to_definition', () => {
    expect(getModeLabel('term_to_definition')).toBe('Term → Definition')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd C:/Ascendly && npm test -- --testPathPattern=drill.test --no-coverage
```

Expected: FAIL — "Cannot find module '../drill'"

- [ ] **Step 3: Write failing tests for `gradeAnswer`, `calculateScore`, `getMissedCards`**

Append to `utils/__tests__/drill.test.ts`:

```ts
const makeCard = (overrides: Partial<DrillCard> = {}): DrillCard => ({
  id: 'test-001',
  unit: 'unit-1',
  subject: 'ap-psychology',
  mode: 'definition_to_term',
  prompt: 'The junction between two neurons',
  answer: 'Synapse',
  difficulty: 'medium',
  ...overrides,
})

// ── gradeAnswer ───────────────────────────────────────────
describe('gradeAnswer', () => {
  it('returns correct for exact match', () => {
    expect(gradeAnswer('Synapse', makeCard())).toBe('correct')
  })
  it('returns correct for case-insensitive match', () => {
    expect(gradeAnswer('synapse', makeCard())).toBe('correct')
  })
  it('returns correct for fuzzy match within tolerance', () => {
    expect(gradeAnswer('synapss', makeCard())).toBe('correct')
  })
  it('returns correct for alternate answer match', () => {
    const card = makeCard({ alternate_answers: ['nerve junction'] })
    expect(gradeAnswer('nerve junction', card)).toBe('correct')
  })
  it('returns wrong for clearly incorrect input', () => {
    expect(gradeAnswer('axon terminal', makeCard())).toBe('wrong')
  })
  it('returns wrong for empty string', () => {
    expect(gradeAnswer('', makeCard())).toBe('wrong')
  })
})

// ── calculateScore ────────────────────────────────────────
describe('calculateScore', () => {
  it('returns 1.0 for all correct', () => {
    const answers = {
      'a': { verdict: 'correct' as const, userInput: 'Synapse' },
      'b': { verdict: 'correct' as const, userInput: 'Neuron' },
    }
    expect(calculateScore(answers)).toBe(1.0)
  })
  it('returns 0.5 for half correct', () => {
    const answers = {
      'a': { verdict: 'correct' as const, userInput: 'Synapse' },
      'b': { verdict: 'wrong' as const, userInput: 'axon' },
    }
    expect(calculateScore(answers)).toBe(0.5)
  })
  it('returns 0 for empty answers', () => {
    expect(calculateScore({})).toBe(0)
  })
})

// ── getMissedCards ────────────────────────────────────────
describe('getMissedCards', () => {
  it('returns only cards with wrong verdict', () => {
    const cards = [makeCard({ id: 'a' }), makeCard({ id: 'b' }), makeCard({ id: 'c' })]
    const answers = {
      'a': { verdict: 'correct' as const, userInput: 'Synapse' },
      'b': { verdict: 'wrong' as const, userInput: 'axon' },
      'c': { verdict: 'wrong' as const, userInput: '' },
    }
    const missed = getMissedCards(cards, answers)
    expect(missed.map(c => c.id)).toEqual(['b', 'c'])
  })
  it('returns empty array when all correct', () => {
    const cards = [makeCard({ id: 'a' })]
    const answers = { 'a': { verdict: 'correct' as const, userInput: 'Synapse' } }
    expect(getMissedCards(cards, answers)).toEqual([])
  })
})
```

- [ ] **Step 4: Run all tests to confirm they fail**

```bash
npm test -- --testPathPattern=drill.test --no-coverage
```

Expected: FAIL — module not found

- [ ] **Step 5: Implement `utils/drill.ts`**

Create `utils/drill.ts`:

```ts
import { fuzzyMatch } from './fuzzyMatch'

// ── Types ─────────────────────────────────────────────────

export type DrillMode =
  | 'definition_to_term'
  | 'formula_to_type'
  | 'person_to_significance'
  | 'event_to_date'
  | 'concept_to_example'
  | 'term_to_definition'

export interface DrillCard {
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

export interface DrillFileData {
  subject: string
  unit: string
  unit_name: string
  cards: DrillCard[]
}

export type AnswerVerdict = 'correct' | 'wrong'

export interface AnswerRecord {
  verdict: AnswerVerdict
  userInput: string
}

// ── Mode label map ────────────────────────────────────────

const MODE_LABELS: Record<DrillMode, string> = {
  definition_to_term:    'Definition → Term',
  formula_to_type:       'Formula → Type',
  person_to_significance:'Person → Significance',
  event_to_date:         'Event → Date',
  concept_to_example:    'Concept → Example',
  term_to_definition:    'Term → Definition',
}

export function getModeLabel(mode: DrillMode): string {
  return MODE_LABELS[mode]
}

// ── Grading ───────────────────────────────────────────────

export function gradeAnswer(userInput: string, card: DrillCard): AnswerVerdict {
  if (!userInput.trim()) return 'wrong'
  return fuzzyMatch(userInput, card.answer, card.alternate_answers ?? [])
    ? 'correct'
    : 'wrong'
}

// ── Score calculation ─────────────────────────────────────

export function calculateScore(answers: Record<string, AnswerRecord>): number {
  const total = Object.keys(answers).length
  if (total === 0) return 0
  const correct = Object.values(answers).filter(a => a.verdict === 'correct').length
  return correct / total
}

// ── Missed cards ──────────────────────────────────────────

export function getMissedCards(
  cards: DrillCard[],
  answers: Record<string, AnswerRecord>
): DrillCard[] {
  return cards.filter(c => answers[c.id]?.verdict === 'wrong')
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=drill.test --no-coverage
```

Expected: PASS — all 15 tests green

- [ ] **Step 7: Commit**

```bash
git add utils/drill.ts utils/__tests__/drill.test.ts
git commit -m "feat: add drill utilities with TDD — types, gradeAnswer, calculateScore, getMissedCards"
```

---

## Task 2: UnitSelector Component

**Files:**
- Create: `components/drill/UnitSelector.tsx`

- [ ] **Step 1: Create the component**

Create `components/drill/UnitSelector.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { SubjectUnit } from '@/utils/subjects'
import { lsGet, LS_KEYS } from '@/utils/localStorage'
import type { DrillFileData } from '@/utils/drill'

// Gradient map keyed by unit number (1-based). Falls back to DEFAULT for units > defined count.
const UNIT_GRADIENTS: Record<number, { bg: string; glow: string; emoji: string }> = {
  1:  { bg: 'linear-gradient(135deg,#1a1035 0%,#2d1b69 100%)', glow: 'rgba(99,102,241,0.6)',  emoji: '🧠' },
  2:  { bg: 'linear-gradient(135deg,#0c2340 0%,#1a4a7a 100%)', glow: 'rgba(59,130,246,0.6)',  emoji: '👁️' },
  3:  { bg: 'linear-gradient(135deg,#0d2818 0%,#166534 100%)', glow: 'rgba(34,197,94,0.6)',   emoji: '🔁' },
  4:  { bg: 'linear-gradient(135deg,#2a1400 0%,#7c3206 100%)', glow: 'rgba(249,115,22,0.6)',  emoji: '💡' },
  5:  { bg: 'linear-gradient(135deg,#1a0a2e 0%,#5b21b6 100%)', glow: 'rgba(139,92,246,0.6)',  emoji: '🌱' },
  6:  { bg: 'linear-gradient(135deg,#2a1520 0%,#9d174d 100%)', glow: 'rgba(236,72,153,0.6)',  emoji: '❤️' },
  7:  { bg: 'linear-gradient(135deg,#1a2a1a 0%,#3d6b3d 100%)', glow: 'rgba(74,222,128,0.5)',  emoji: '🏥' },
  8:  { bg: 'linear-gradient(135deg,#0a1f2a 0%,#075985 100%)', glow: 'rgba(14,165,233,0.6)',  emoji: '👥' },
  9:  { bg: 'linear-gradient(135deg,#1a1a0a 0%,#713f12 100%)', glow: 'rgba(234,179,8,0.6)',   emoji: '🌍' },
}
const DEFAULT_GRADIENT = { bg: 'linear-gradient(135deg,#1a1a1a 0%,#333 100%)', glow: 'rgba(161,161,161,0.4)', emoji: '📚' }

interface UnitCardMeta {
  unit: SubjectUnit
  cardCount: number | null   // null = loading, -1 = unavailable
  masteryPct: number         // 0–100
}

interface UnitSelectorProps {
  subject: string            // slug, e.g. "ap-psychology"
  units: SubjectUnit[]
  onSelectUnit: (unitNumber: number) => void
  onStudyAll: () => void
}

export function UnitSelector({ subject, units, onSelectUnit, onStudyAll }: UnitSelectorProps) {
  const [unitMeta, setUnitMeta] = useState<UnitCardMeta[]>(() =>
    units.map(u => ({
      unit: u,
      cardCount: null,
      masteryPct: Math.round(
        (lsGet(LS_KEYS.mastery(subject, `unit-${u.number}`), { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 }).drillAccuracy) * 100
      ),
    }))
  )

  // Fetch card counts for all units on mount
  useEffect(() => {
    units.forEach((u, i) => {
      fetch(`/data/${subject}/drills/unit-${u.number}.json`)
        .then(r => {
          if (!r.ok) throw new Error('not found')
          return r.json() as Promise<DrillFileData>
        })
        .then(data => {
          setUnitMeta(prev =>
            prev.map((m, idx) => idx === i ? { ...m, cardCount: data.cards.length } : m)
          )
        })
        .catch(() => {
          setUnitMeta(prev =>
            prev.map((m, idx) => idx === i ? { ...m, cardCount: -1 } : m)
          )
        })
    })
  }, [subject, units])

  const availableUnits = unitMeta.filter(m => m.cardCount !== null && m.cardCount > 0)
  const totalCards = availableUnits.reduce((sum, m) => sum + (m.cardCount ?? 0), 0)
  const studyAllDisabled = availableUnits.length === 0

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '40px', paddingBottom: '64px' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Drills</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Pick a unit to start drilling terms, concepts, and key people.
      </p>

      {/* Study All card */}
      <button
        onClick={studyAllDisabled ? undefined : onStudyAll}
        disabled={studyAllDisabled}
        style={{
          width: '100%', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px',
          background: studyAllDisabled ? 'var(--bg-secondary)' : 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
          border: `1px solid ${studyAllDisabled ? 'var(--bg-border)' : 'var(--accent)'}`,
          borderRadius: '14px', padding: '20px', cursor: studyAllDisabled ? 'not-allowed' : 'pointer',
          textAlign: 'left', opacity: studyAllDisabled ? 0.5 : 1,
        }}
      >
        <BookOpen size={28} color={studyAllDisabled ? 'var(--text-muted)' : 'var(--accent)'} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {studyAllDisabled ? 'No content yet' : 'Study All Units'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {studyAllDisabled ? 'Drill content coming soon' : 'Shuffle cards from every unit'}
          </div>
        </div>
        {!studyAllDisabled && (
          <div style={{ background: 'var(--accent)', color: 'white', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
            {totalCards} cards
          </div>
        )}
      </button>

      {/* Unit grid */}
      <div className="drill-unit-grid">
        {unitMeta.map((meta) => {
          const grad = UNIT_GRADIENTS[meta.unit.number] ?? DEFAULT_GRADIENT
          const unavailable = meta.cardCount === -1
          const loading = meta.cardCount === null

          return (
            <button
              key={meta.unit.number}
              onClick={unavailable || loading ? undefined : () => onSelectUnit(meta.unit.number)}
              disabled={unavailable || loading}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '14px',
                overflow: 'hidden', cursor: (unavailable || loading) ? 'not-allowed' : 'pointer',
                textAlign: 'left', padding: 0, opacity: unavailable ? 0.5 : 1,
                transition: 'border-color 0.15s, transform 0.15s',
              }}
              className="drill-unit-card"
            >
              {/* Art area */}
              <div style={{ height: '96px', background: grad.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                <span style={{ filter: `drop-shadow(0 2px 8px ${grad.glow})` }}>{grad.emoji}</span>
              </div>
              {/* Body */}
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Unit {meta.unit.number}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '10px' }}>
                  {meta.unit.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {loading ? '…' : unavailable ? 'Coming soon' : `${meta.cardCount} cards`}
                  </span>
                  {/* Mastery bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '48px', height: '4px', background: 'var(--mastery-empty)', borderRadius: '2px' }}>
                      <div style={{ width: `${meta.masteryPct}%`, height: '100%', background: 'var(--mastery-fill)', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{meta.masteryPct}%</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add drill CSS to `app/globals.css`**

Append to `app/globals.css`:

```css
/* ── Drill interface ──────────────────────────────────────── */

.drill-unit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.drill-unit-card:not(:disabled):hover {
  border-color: var(--accent) !important;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .drill-unit-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 375px) {
  .drill-unit-grid { grid-template-columns: 1fr; }
}

/* Conic gradient score ring */
.drill-score-ring {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 3: Commit**

```bash
git add components/drill/UnitSelector.tsx app/globals.css
git commit -m "feat: add UnitSelector component with gradient unit cards and mastery bars"
```

---

## Task 3: DrillCard Component

**Files:**
- Create: `components/drill/DrillCard.tsx`

- [ ] **Step 1: Create the component**

Create `components/drill/DrillCard.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { getModeLabel, gradeAnswer, type DrillCard as DrillCardType, type AnswerRecord } from '@/utils/drill'

// Inline KaTeX helper — renders $...$ math in a string as HTML
// Uses the KatexRenderer component pattern already in the codebase
function renderWithKatex(text: string, katexRequired: boolean): React.ReactNode {
  if (!katexRequired && !text.includes('$')) return text
  // Split on $...$ delimiters and render math spans
  const parts = text.split(/(\$[^$]+\$)/g)
  return parts.map((part, i) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const math = part.slice(1, -1)
      return <span key={i} dangerouslySetInnerHTML={{ __html: renderKatexString(math) }} />
    }
    return <span key={i}>{part}</span>
  })
}

// Lazy katex import — only runs client-side
function renderKatexString(math: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const katex = require('katex') as typeof import('katex')
    return katex.renderToString(math, { throwOnError: false, displayMode: false })
  } catch {
    return math
  }
}

type CardState = 'idle' | 'typing' | 'correct' | 'wrong'

interface DrillCardProps {
  card: DrillCardType
  cardIndex: number      // 1-based display index
  totalCards: number
  onAnswer: (record: AnswerRecord) => void   // called when user moves to next card
}

export function DrillCard({ card, onAnswer }: DrillCardProps) {
  const [input, setInput] = useState('')
  const [cardState, setCardState] = useState<CardState>('idle')
  const [answerRecord, setAnswerRecord] = useState<AnswerRecord | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when card mounts
  useEffect(() => {
    inputRef.current?.focus()
    setInput('')
    setCardState('idle')
    setAnswerRecord(null)
  }, [card.id])

  function handleCheck() {
    if (!input.trim()) return
    const verdict = gradeAnswer(input, card)
    const record: AnswerRecord = { verdict, userInput: input }
    setAnswerRecord(record)
    setCardState(verdict)
  }

  function handleNext() {
    if (answerRecord) onAnswer(answerRecord)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (cardState === 'idle' || cardState === 'typing') {
        if (input.trim()) handleCheck()
      } else {
        handleNext()
      }
    }
  }

  const isChecked = cardState === 'correct' || cardState === 'wrong'

  // Input border color by state
  const inputBorderColor = cardState === 'correct'
    ? 'var(--accent-success)'
    : cardState === 'wrong'
    ? 'var(--accent-danger)'
    : input.length > 0
    ? 'var(--accent)'
    : 'var(--bg-border)'

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', width: '100%' }}>
      {/* Mode tag */}
      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
        {getModeLabel(card.mode)}
      </div>

      {/* Prompt */}
      <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.55, marginBottom: '20px' }}>
        {renderWithKatex(card.prompt, card.katex_required ?? false)}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={input}
        onChange={e => { setInput(e.target.value); if (cardState === 'idle') setCardState('typing') }}
        onKeyDown={handleKeyDown}
        disabled={isChecked}
        placeholder="Type your answer…"
        style={{
          width: '100%', background: 'var(--bg-primary)', border: `1px solid ${inputBorderColor}`,
          borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.95rem',
          boxSizing: 'border-box', marginBottom: '12px', outline: 'none',
          transition: 'border-color 0.15s',
        }}
      />

      {/* Feedback panel */}
      {cardState === 'correct' && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>✓ Correct</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {card.katex_required
              ? <span dangerouslySetInnerHTML={{ __html: renderKatexString(card.answer) }} />
              : card.answer}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {renderWithKatex(card.prompt, card.katex_required ?? false)}
          </div>
        </div>
      )}

      {cardState === 'wrong' && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-danger)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>✗ Not quite</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            You wrote: {input || '—'}
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Correct: {card.katex_required
              ? <span dangerouslySetInnerHTML={{ __html: renderKatexString(card.answer) }} />
              : card.answer}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {renderWithKatex(card.prompt, card.katex_required ?? false)}
          </div>
        </div>
      )}

      {/* Check / Next button */}
      {!isChecked ? (
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
            background: input.trim() ? 'var(--accent)' : 'var(--bg-border)',
            color: input.trim() ? 'white' : 'var(--text-muted)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Check Answer
        </button>
      ) : (
        <button
          onClick={handleNext}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
            background: cardState === 'correct' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${cardState === 'correct' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: cardState === 'correct' ? 'var(--accent-success)' : 'var(--accent-danger)',
            cursor: 'pointer',
          }}
        >
          Next card →
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify katex is available**

```bash
npm list katex 2>/dev/null | head -3
```

If katex is not installed: `npm install katex @types/katex`

- [ ] **Step 3: Commit**

```bash
git add components/drill/DrillCard.tsx
git commit -m "feat: add DrillCard component with type-answer, fuzzy grading, KaTeX support"
```

---

## Task 4: DrillSession Component

**Files:**
- Create: `components/drill/DrillSession.tsx`

- [ ] **Step 1: Create the component**

Create `components/drill/DrillSession.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { DrillCard } from './DrillCard'
import type { DrillCard as DrillCardType, AnswerRecord } from '@/utils/drill'

interface DrillSessionProps {
  cards: DrillCard[]
  unitLabel: string           // e.g. "Unit 1 · Biological Bases"
  onSessionComplete: (answers: Record<string, AnswerRecord>) => void
}

// DrillCard type reused from drill.ts — aliased here to avoid confusion with the component
type CardData = DrillCardType

export function DrillSession({ cards, unitLabel, onSessionComplete }: DrillSessionProps) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({})

  const currentCard: CardData = cards[index]
  const correctCount = Object.values(answers).filter(a => a.verdict === 'correct').length
  const wrongCount = Object.values(answers).filter(a => a.verdict === 'wrong').length
  const progressPct = Math.round((index / cards.length) * 100)

  function handleAnswer(record: AnswerRecord) {
    const newAnswers = { ...answers, [currentCard.id]: record }
    setAnswers(newAnswers)

    if (index + 1 >= cards.length) {
      onSessionComplete(newAnswers)
    } else {
      setIndex(i => i + 1)
    }
  }

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '32px', paddingBottom: '64px' }}>

      {/* Session header */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '12px',
        padding: '12px 16px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unitLabel}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Progress bar */}
          <div style={{ width: '80px', height: '4px', background: 'var(--mastery-empty)', borderRadius: '2px' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{index + 1} / {cards.length}</span>
          {/* Score badges */}
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-success)', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
            ✓ {correctCount}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-danger)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
            ✗ {wrongCount}
          </span>
        </div>
      </div>

      {/* Active card */}
      <DrillCard
        card={currentCard}
        cardIndex={index + 1}
        totalCards={cards.length}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/drill/DrillSession.tsx
git commit -m "feat: add DrillSession component with progress bar and live score badges"
```

---

## Task 5: DrillResults Component

**Files:**
- Create: `components/drill/DrillResults.tsx`

- [ ] **Step 1: Create the component**

Create `components/drill/DrillResults.tsx`:

```tsx
'use client'

import { RotateCcw } from 'lucide-react'
import { calculateScore, getMissedCards, type DrillCard, type AnswerRecord } from '@/utils/drill'

interface DrillResultsProps {
  cards: DrillCard[]
  answers: Record<string, AnswerRecord>
  unitLabel: string           // e.g. "Unit 1 · Biological Bases" or "All Units"
  subjectName: string         // display name, e.g. "AP Psychology"
  onRetry: (missedCards: DrillCard[]) => void
  onBackToSubject: () => void
  onStudyAnother: () => void
}

function getHeading(accuracy: number): string {
  if (accuracy >= 0.9) return 'Excellent work!'
  if (accuracy >= 0.7) return 'Good progress!'
  if (accuracy >= 0.5) return 'Keep at it!'
  return 'Room to grow!'
}

export function DrillResults({ cards, answers, unitLabel, subjectName, onRetry, onBackToSubject, onStudyAnother }: DrillResultsProps) {
  const accuracy = calculateScore(answers)
  const pct = Math.round(accuracy * 100)
  const missedCards = getMissedCards(cards, answers)
  const totalCards = cards.length
  const isPerfect = missedCards.length === 0

  // Conic gradient: accent color for correct portion, empty for rest
  const conicGradient = `conic-gradient(var(--accent) 0% ${pct}%, var(--mastery-empty) ${pct}% 100%)`

  const SHOWN_MISSED = 5

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '40px', paddingBottom: '64px' }}>

      {/* Card shell */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', borderRadius: '16px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--bg-border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Session Complete</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unitLabel}</span>
        </div>

        <div style={{ padding: '24px 20px' }}>

          {/* Score ring + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            {/* Conic ring */}
            <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '50%', background: conicGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>score</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {isPerfect ? 'Perfect score! 🎉' : getHeading(accuracy)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {totalCards} cards · {unitLabel}
              </div>
            </div>
          </div>

          {/* Missed cards list — hidden if perfect */}
          {!isPerfect && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  Missed Cards
                </span>
                <span style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                  {missedCards.length}
                </span>
              </div>

              {missedCards.slice(0, SHOWN_MISSED).map(card => {
                const record = answers[card.id]
                return (
                  <div key={card.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: '8px', padding: '10px 14px', marginBottom: '6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{card.answer}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.prompt}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-danger)', whiteSpace: 'nowrap', marginTop: '2px', flexShrink: 0 }}>
                      you: {record?.userInput || '—'}
                    </div>
                  </div>
                )
              })}

              {missedCards.length > SHOWN_MISSED && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
                  + {missedCards.length - SHOWN_MISSED} more missed cards
                </div>
              )}
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Retry — only shown when there are missed cards */}
            {!isPerfect && (
              <button
                onClick={() => onRetry(missedCards)}
                style={{
                  padding: '12px', background: 'var(--accent)', color: 'white', borderRadius: '10px',
                  fontSize: '0.9rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <RotateCcw size={16} /> Retry missed cards ({missedCards.length})
              </button>
            )}
            {/* Back to subject */}
            <button
              onClick={onBackToSubject}
              style={{
                padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--bg-border)',
                color: 'var(--text-secondary)', borderRadius: '10px', fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              ← Back to {subjectName}
            </button>
            {/* Study another unit */}
            <button
              onClick={onStudyAnother}
              style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}
            >
              Study another unit
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/drill/DrillResults.tsx
git commit -m "feat: add DrillResults component with score ring, missed cards list, and CTAs"
```

---

## Task 6: DrillPage Orchestrator

**Files:**
- Rewrite: `app/[subject]/drills/page.tsx`

- [ ] **Step 1: Rewrite the page**

Replace the contents of `app/[subject]/drills/page.tsx`:

```tsx
'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { getSubject } from '@/utils/subjects'
import { scramble } from '@/utils/scramble'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'
import { calculateScore, type DrillCard, type AnswerRecord } from '@/utils/drill'
import type { DrillFileData } from '@/utils/drill'
import { UnitSelector } from '@/components/drill/UnitSelector'
import { DrillSession } from '@/components/drill/DrillSession'
import { DrillResults } from '@/components/drill/DrillResults'

type DrillView = 'unit-select' | 'session' | 'results'

interface SessionMeta {
  cards: DrillCard[]
  unitLabel: string
  unitSlug: string | 'all'
  isRetry: boolean
}

interface PageProps {
  params: Promise<{ subject: string }>
}

export default function DrillsPage({ params }: PageProps) {
  const { subject: slug } = use(params)
  const subjectData = getSubject(slug)
  if (!subjectData) notFound()
  const subject = subjectData!

  const router = useRouter()
  const [view, setView] = useState<DrillView>('unit-select')
  const [session, setSession] = useState<SessionMeta | null>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({})

  async function loadUnit(unitNumber: number): Promise<DrillCard[]> {
    const res = await fetch(`/data/${slug}/drills/unit-${unitNumber}.json`)
    if (!res.ok) throw new Error(`Failed to load unit ${unitNumber}`)
    const data: DrillFileData = await res.json()
    return data.cards
  }

  async function handleSelectUnit(unitNumber: number) {
    try {
      const unitData = subject.units.find(u => u.number === unitNumber)!
      const cards = await loadUnit(unitNumber)
      setSession({
        cards: scramble(cards),
        unitLabel: `Unit ${unitNumber} · ${unitData.name}`,
        unitSlug: `unit-${unitNumber}`,
        isRetry: false,
      })
      setAnswers({})
      setView('session')
    } catch {
      // Failed to load — stay on unit-select (unit card already shows error state)
    }
  }

  async function handleStudyAll() {
    const results = await Promise.allSettled(
      subject.units.map(u => loadUnit(u.number))
    )
    const allCards = results
      .filter((r): r is PromiseFulfilledResult<DrillCard[]> => r.status === 'fulfilled')
      .flatMap(r => r.value)

    if (allCards.length === 0) return

    setSession({
      cards: scramble(allCards),
      unitLabel: 'All Units',
      unitSlug: 'all',
      isRetry: false,
    })
    setAnswers({})
    setView('session')
  }

  function handleSessionComplete(finalAnswers: Record<string, AnswerRecord>) {
    setAnswers(finalAnswers)

    if (!session) return
    const totalCards = session.cards.length
    const drillAccuracy = calculateScore(finalAnswers)

    // Always increment total questions answered
    const prevTotal = lsGet<number>(LS_KEYS.totalQuestions, 0)
    lsSet(LS_KEYS.totalQuestions, prevTotal + totalCards)

    // Write mastery only for non-retry, non-Study-All sessions
    if (!session.isRetry && session.unitSlug !== 'all') {
      const existing = lsGet(LS_KEYS.mastery(slug, session.unitSlug), {
        drillAccuracy: 0,
        mcqAccuracy: 0,
        totalAttempts: 0,
      })
      lsSet(LS_KEYS.mastery(slug, session.unitSlug), {
        ...existing,
        drillAccuracy,
        totalAttempts: existing.totalAttempts + totalCards,
      })
    }

    // Fire analytics
    logEvent({
      event_type: 'drill_completed',
      subject: slug,
      unit: session.unitSlug,
      metadata: {
        accuracy: drillAccuracy,
        cards_count: totalCards,
        is_retry: session.isRetry,
      },
    })

    setView('results')
  }

  function handleRetry(missedCards: DrillCard[]) {
    if (!session) return
    setSession({
      ...session,
      cards: scramble(missedCards),
      isRetry: true,
    })
    setAnswers({})
    setView('session')
  }

  function handleStudyAnother() {
    setSession(null)
    setAnswers({})
    setView('unit-select')
  }

  if (view === 'session' && session) {
    return (
      <DrillSession
        cards={session.cards}
        unitLabel={session.unitLabel}
        onSessionComplete={handleSessionComplete}
      />
    )
  }

  if (view === 'results' && session) {
    return (
      <DrillResults
        cards={session.cards}
        answers={answers}
        unitLabel={session.unitLabel}
        subjectName={subject.name}
        onRetry={handleRetry}
        onBackToSubject={() => router.push(`/${slug}`)}
        onStudyAnother={handleStudyAnother}
      />
    )
  }

  return (
    <UnitSelector
      subject={slug}
      units={subject.units}
      onSelectUnit={handleSelectUnit}
      onStudyAll={handleStudyAll}
    />
  )
}
```

- [ ] **Step 2: Verify `scramble` export signature**

Open `utils/scramble.ts` and confirm it exports `scramble(arr: T[]): T[]`. If the export name or signature differs, adjust the import in the page above.

- [ ] **Step 3: Run the dev server and manually verify the unit selector loads**

```bash
npm run dev
```

Navigate to `http://localhost:3000/ap-psychology/drills`. Expected: unit selector renders with 8 unit cards and "No content yet" on the Study All card (no drill JSON exists yet). Cards show "…" loading state then "Coming soon".

- [ ] **Step 4: Run all tests to confirm nothing is broken**

```bash
npm test -- --no-coverage
```

Expected: all existing tests pass (subjects, fuzzyMatch, scramble, scoring, drill)

- [ ] **Step 5: Commit**

```bash
git add app/[subject]/drills/page.tsx
git commit -m "feat: build DrillPage orchestrator — view switching, data loading, localStorage writes, analytics"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
npm test -- --no-coverage
```

Expected: all tests pass

- [ ] **Step 2: Manually verify drill session flow with a test JSON file**

Create a minimal test data file at `public/data/ap-psychology/drills/unit-1.json`:

```json
{
  "subject": "ap-psychology",
  "unit": "1",
  "unit_name": "Biological Bases of Behavior",
  "cards": [
    {
      "id": "psych-u1-d001",
      "unit": "unit-1",
      "subject": "ap-psychology",
      "mode": "definition_to_term",
      "prompt": "The junction between two neurons where neurotransmitters are released",
      "answer": "Synapse",
      "alternate_answers": ["synaptic cleft"],
      "difficulty": "easy"
    },
    {
      "id": "psych-u1-d002",
      "unit": "unit-1",
      "subject": "ap-psychology",
      "mode": "definition_to_term",
      "prompt": "A neuron that carries signals away from the brain or spinal cord to muscles and glands",
      "answer": "Motor neuron",
      "difficulty": "medium"
    },
    {
      "id": "psych-u1-d003",
      "unit": "unit-1",
      "subject": "ap-psychology",
      "mode": "definition_to_term",
      "prompt": "The fatty insulating sheath surrounding the axon that speeds up signal transmission",
      "answer": "Myelin sheath",
      "difficulty": "medium"
    }
  ]
}
```

- [ ] **Step 3: Walk through the full session flow manually**

Verify each acceptance criterion from the spec:
- Unit 1 card now shows "3 cards" (not "Coming soon")
- Clicking Unit 1 enters session view
- Typing "synapse" and hitting Enter marks correct (fuzzy match)
- Typing wrong answer shows red feedback with "you: [input]" and correct answer
- After all 3 cards → results screen appears
- Score ring shows correct %
- Missed cards list shows what you typed
- "Retry missed" re-enters session with only missed cards
- "Back to AP Psychology" navigates to `/ap-psychology`
- "Study another unit" returns to unit selector
- localStorage `ascendly_mastery_ap-psychology_unit-1` updated
- localStorage `ascendly_total_questions` incremented

- [ ] **Step 4: Delete test data file** (real content comes in Phase 6–12)

```bash
rm public/data/ap-psychology/drills/unit-1.json
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Phase 2 drill interface complete — unit selector, session, results"
```

---

## Screenshot Loop

Per CLAUDE.md Critical Rule #2, before marking Phase 2 complete you MUST say:

> "UI work is done. Please paste a screenshot so I can verify it looks correct before marking this complete."

Do not mark Phase 2 done or update the phase tracker until the user confirms the UI visually.
