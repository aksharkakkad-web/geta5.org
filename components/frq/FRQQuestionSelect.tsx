'use client'

import React, { useState, useMemo } from 'react'
import { Layers } from 'lucide-react'
import type { FRQ, FRQType } from '@/utils/frqSession'
import InlineMath from '@/components/InlineMath'

interface SubjectUnit {
  unit_number: number
  unit_name: string
}

interface FRQQuestionSelectProps {
  questions: FRQ[]
  subject: string
  units?: SubjectUnit[]
  onSelect: (q: FRQ) => void
}

// ─── Visual constants (match MCQ UnitSelector) ────────────────────────────────

const UNIT_GRADIENTS: Record<number, string> = {
  1: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  2: 'linear-gradient(135deg, #1a2e1a 0%, #162e3e 100%)',
  3: 'linear-gradient(135deg, #2e1a2e 0%, #3e1628 100%)',
  4: 'linear-gradient(135deg, #1a2e2e 0%, #163e2e 100%)',
  5: 'linear-gradient(135deg, #2e2e1a 0%, #3e3616 100%)',
  6: 'linear-gradient(135deg, #2e1a1a 0%, #3e1616 100%)',
  7: 'linear-gradient(135deg, #1a1a2e 0%, #28163e 100%)',
  8: 'linear-gradient(135deg, #1a2e28 0%, #163e28 100%)',
  9: 'linear-gradient(135deg, #2e281a 0%, #3e2816 100%)',
}
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'

const UNIT_EMOJIS: Record<number, string> = {
  1: '🧬', 2: '👁️', 3: '📚', 4: '🧠', 5: '👶',
  6: '💡', 7: '🏥', 8: '👥', 9: '🌍',
}

// ─── Type label + color helpers ───────────────────────────────────────────────

const TYPE_LABELS: Record<FRQType, string> = {
  multi_part_math: 'Math',
  multi_part_text: 'Multi-Part',
  dbq: 'DBQ',
  saq: 'SAQ',
  leq: 'LEQ',
  essay: 'Essay',
  argument_essay: 'Argument',
  concept_application: 'Concept App',
  scotus_comparison: 'SCOTUS',
  quantitative_analysis: 'Quant',
}

function getTypeChipColors(type: FRQType): { bg: string; color: string } {
  switch (type) {
    case 'dbq':
      return { bg: 'rgba(99,102,241,0.12)', color: 'var(--accent-hover)' }
    case 'leq':
    case 'essay':
    case 'argument_essay':
      return { bg: 'rgba(245,158,11,0.12)', color: 'var(--accent-warning)' }
    case 'saq':
    case 'concept_application':
    case 'scotus_comparison':
    case 'quantitative_analysis':
      return { bg: 'rgba(34,197,94,0.12)', color: 'var(--accent-success)' }
    default:
      return { bg: 'rgba(99,102,241,0.10)', color: 'var(--accent-hover)' }
  }
}

// ─── Filter chips (for FRQ list view) ────────────────────────────────────────

interface FilterChip { id: string; label: string }

function getFilterChips(subject: string, questions: FRQ[]): FilterChip[] {
  const chips: FilterChip[] = [{ id: 'all', label: 'All' }]

  const isMath = ['ap-calculus-ab', 'ap-precalculus', 'ap-chemistry'].includes(subject)
  if (isMath) {
    if (questions.some(q => q.calculator_allowed)) chips.push({ id: 'calculator', label: 'Calculator' })
    if (questions.some(q => !q.calculator_allowed)) chips.push({ id: 'no-calculator', label: 'No Calculator' })
    return chips
  }
  if (subject === 'ap-world-history') {
    chips.push({ id: 'saq', label: 'SAQ' }, { id: 'leq', label: 'LEQ' }, { id: 'dbq', label: 'DBQ' })
    return chips
  }
  if (subject === 'ap-government') {
    chips.push(
      { id: 'concept_application', label: 'Concept App' },
      { id: 'scotus_comparison', label: 'SCOTUS' },
      { id: 'quantitative_analysis', label: 'Quant' },
      { id: 'argument_essay', label: 'Argument' },
    )
    return chips
  }
  return chips
}

function matchesFilter(q: FRQ, filter: string): boolean {
  if (filter === 'all') return true
  if (filter === 'calculator') return q.calculator_allowed
  if (filter === 'no-calculator') return !q.calculator_allowed
  return q.frq_type === (filter as FRQType)
}

// ─── Individual FRQ card ──────────────────────────────────────────────────────

const MATH_SUBJECTS = new Set(['ap-calculus-ab', 'ap-precalculus', 'ap-chemistry'])

function FRQCard({
  q,
  subject,
  onSelect,
}: {
  q: FRQ
  subject: string
  onSelect: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isMath = MATH_SUBJECTS.has(subject)
  const typeColors = getTypeChipColors(q.frq_type)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: hovered
          ? '1px solid color-mix(in srgb, var(--accent) 40%, transparent)'
          : '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, background 150ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1, minWidth: 0 }}>
          {isMath ? <InlineMath text={q.title} /> : q.title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600, padding: '3px 8px',
            borderRadius: 'var(--radius-sm)', background: typeColors.bg, color: typeColors.color, whiteSpace: 'nowrap',
          }}>
            {TYPE_LABELS[q.frq_type]}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {q.year != null ? q.year : 'Generated'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FRQQuestionSelect({ questions, subject, units = [], onSelect }: FRQQuestionSelectProps) {
  const [selectedUnit, setSelectedUnit] = useState<number | 'all' | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // Count FRQs per unit (FRQ belongs to a unit if that unit appears in related_units)
  const unitCounts = useMemo(() => {
    const map = new Map<number, number>()
    for (const q of questions) {
      for (const u of q.related_units) {
        map.set(u, (map.get(u) ?? 0) + 1)
      }
    }
    return map
  }, [questions])

  // FRQs for the selected unit (or all)
  const unitQuestions = useMemo(() => {
    if (selectedUnit === null) return []
    if (selectedUnit === 'all') return questions
    return questions.filter(q => q.related_units.includes(selectedUnit))
  }, [questions, selectedUnit])

  const filteredQuestions = useMemo(
    () => unitQuestions.filter(q => matchesFilter(q, activeFilter)),
    [unitQuestions, activeFilter]
  )

  const chips = useMemo(
    () => getFilterChips(subject, unitQuestions),
    [subject, unitQuestions]
  )

  // ── Unit card grid view ────────────────────────────────────────────────────
  if (selectedUnit === null) {
    return (
      <div>
        <div className="frq-unit-grid" style={{ display: 'grid', gap: '16px' }}>
          {/* All FRQs card */}
          <div
            onClick={() => setSelectedUnit('all')}
            style={{
              gridColumn: '1 / -1',
              background: 'var(--bg-card)',
              border: '2px solid var(--accent)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              cursor: 'pointer',
              transition: 'transform 200ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Layers size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>All FRQs</span>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: '999px',
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)',
            }}>
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </div>
          </div>

          {/* Per-unit cards */}
          {units.map(unit => {
            const count = unitCounts.get(unit.unit_number) ?? 0
            const gradient = UNIT_GRADIENTS[unit.unit_number] ?? DEFAULT_GRADIENT
            const emoji = UNIT_EMOJIS[unit.unit_number] ?? '📖'

            return (
              <div
                key={unit.unit_number}
                onClick={() => count > 0 && setSelectedUnit(unit.unit_number)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: count > 0 ? 'pointer' : 'default',
                  opacity: count > 0 ? 1 : 0.5,
                  transition: 'transform 200ms ease, border-color 200ms ease',
                }}
                onMouseEnter={e => {
                  if (count > 0) {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(-2px)'
                    el.style.borderColor = 'var(--accent)'
                  }
                }}
                onMouseLeave={e => {
                  if (count > 0) {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(0)'
                    el.style.borderColor = 'var(--bg-border)'
                  }
                }}
              >
                {/* Art */}
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: gradient }}>
                  <span style={{ fontSize: '1.75rem' }}>{emoji}</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '4px',
                  }}>
                    Unit {unit.unit_number}
                  </span>
                  <h3 style={{
                    fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)',
                    marginBottom: '8px', lineHeight: 1.3,
                  }}>
                    {unit.unit_name}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: count > 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {count > 0 ? `${count} ${count === 1 ? 'question' : 'questions'}` : 'No questions yet'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <style>{`
          .frq-unit-grid { grid-template-columns: 1fr; }
          @media (min-width: 640px) { .frq-unit-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (min-width: 1024px) { .frq-unit-grid { grid-template-columns: repeat(3, 1fr); } }
        `}</style>
      </div>
    )
  }

  // ── FRQ list view (after selecting a unit) ────────────────────────────────

  const unitLabel = selectedUnit === 'all'
    ? 'All FRQs'
    : `Unit ${selectedUnit}${units.find(u => u.unit_number === selectedUnit) ? ` — ${units.find(u => u.unit_number === selectedUnit)!.unit_name}` : ''}`

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => { setSelectedUnit(null); setActiveFilter('all') }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '0.875rem', color: 'var(--text-muted)', background: 'transparent',
          border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: '20px',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All units
      </button>

      {/* Unit heading */}
      <h2 style={{
        fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)',
        marginBottom: chips.length > 1 ? '16px' : '20px', fontFamily: 'var(--font-outfit)',
      }}>
        {unitLabel}
      </h2>

      {/* Filter chips */}
      {chips.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }} role="group" aria-label="Filter questions">
          {chips.map(chip => {
            const isActive = activeFilter === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                style={{
                  fontSize: '0.8125rem', padding: '6px 14px', borderRadius: '999px',
                  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--bg-border)',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: isActive ? 'var(--accent-hover)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease, background 150ms ease, color 150ms ease',
                }}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Question list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredQuestions.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
            No questions match this filter.
          </p>
        ) : (
          filteredQuestions.map(q => (
            <FRQCard key={q.id} q={q} subject={subject} onSelect={() => onSelect(q)} />
          ))
        )}
      </div>

      {/* Footer */}
      {filteredQuestions.length > 0 && (
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'}
          {selectedUnit === 'all' && questions.filter(q => q.source === 'released').length > 0 &&
            ` · ${questions.filter(q => q.source === 'released').length} from released exams`}
        </p>
      )}
    </div>
  )
}
