'use client'

import React, { useState, useMemo } from 'react'
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

// ─── Filter chip definitions ─────────────────────────────────────────────────

interface FilterChip {
  id: string
  label: string
}

function getFilterChips(subject: string, questions: FRQ[]): FilterChip[] {
  const chips: FilterChip[] = [{ id: 'all', label: 'All' }]

  const isMath = ['ap-calculus-ab', 'ap-precalculus', 'ap-chemistry'].includes(subject)
  if (isMath) {
    const hasCalc = questions.some(q => q.calculator_allowed)
    const hasNoCalc = questions.some(q => !q.calculator_allowed)
    if (hasCalc) chips.push({ id: 'calculator', label: 'Calculator' })
    if (hasNoCalc) chips.push({ id: 'no-calculator', label: 'No Calculator' })
    return chips
  }

  if (subject === 'ap-world-history') {
    chips.push(
      { id: 'saq', label: 'SAQ' },
      { id: 'leq', label: 'LEQ' },
      { id: 'dbq', label: 'DBQ' },
    )
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

// ─── Type label mapping ───────────────────────────────────────────────────────

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
    case 'multi_part_math':
    case 'multi_part_text':
    default:
      return { bg: 'rgba(99,102,241,0.10)', color: 'var(--accent-hover)' }
  }
}

// ─── Question card ────────────────────────────────────────────────────────────

function QuestionCard({
  q,
  isMathSubject,
  isHovered,
  onHover,
  onLeave,
  onSelect,
}: {
  q: FRQ
  isMathSubject: boolean
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}) {
  const typeColors = getTypeChipColors(q.frq_type)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        background: 'var(--bg-card)',
        border: isHovered
          ? '1px solid color-mix(in srgb, var(--accent) 40%, transparent)'
          : '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, background 150ms ease',
        backgroundColor: isHovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <span
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            flex: 1,
            minWidth: 0,
          }}
        >
          {isMathSubject ? <InlineMath text={q.title} /> : q.title}
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              background: typeColors.bg,
              color: typeColors.color,
              whiteSpace: 'nowrap',
            }}
          >
            {TYPE_LABELS[q.frq_type]}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {q.year != null ? q.year : 'Generated'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const MATH_SUBJECTS = new Set(['ap-calculus-ab', 'ap-precalculus', 'ap-chemistry'])

export default function FRQQuestionSelect({
  questions,
  subject,
  units = [],
  onSelect,
}: FRQQuestionSelectProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [collapsedUnits, setCollapsedUnits] = useState<Set<number>>(new Set())
  const isMathSubject = MATH_SUBJECTS.has(subject)

  const chips = useMemo(
    () => getFilterChips(subject, questions),
    [subject, questions]
  )

  const filtered = useMemo(
    () => questions.filter(q => matchesFilter(q, activeFilter)),
    [questions, activeFilter]
  )

  // Group by primary unit (first element of related_units, or 0 for "General")
  const grouped = useMemo(() => {
    const map = new Map<number, FRQ[]>()
    for (const q of filtered) {
      const unit = q.related_units.length > 0 ? q.related_units[0] : 0
      if (!map.has(unit)) map.set(unit, [])
      map.get(unit)!.push(q)
    }
    // Sort by unit number; 0 (general) goes last
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === 0) return 1
      if (b === 0) return -1
      return a - b
    })
  }, [filtered])

  // Build a lookup from unit_number → unit_name
  const unitNameMap = useMemo(() => {
    const m = new Map<number, string>()
    for (const u of units) m.set(u.unit_number, u.unit_name)
    return m
  }, [units])

  function getUnitLabel(unitNum: number): { primary: string; secondary: string | null } {
    if (unitNum === 0) return { primary: 'General', secondary: null }
    const name = unitNameMap.get(unitNum) ?? null
    return { primary: `Unit ${unitNum}`, secondary: name }
  }

  function toggleUnit(unitNum: number) {
    setCollapsedUnits(prev => {
      const next = new Set(prev)
      if (next.has(unitNum)) next.delete(unitNum)
      else next.add(unitNum)
      return next
    })
  }

  const releasedCount = questions.filter(q => q.source === 'released').length
  const generatedCount = questions.length - releasedCount

  return (
    <div>
      {/* Filter chips */}
      {chips.length > 1 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px',
          }}
          role="group"
          aria-label="Filter questions"
        >
          {chips.map(chip => {
            const isActive = activeFilter === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                style={{
                  fontSize: '0.8125rem',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: isActive
                    ? '1px solid rgba(99,102,241,0.3)'
                    : '1px solid var(--bg-border)',
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

      {/* Empty state */}
      {filtered.length === 0 && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '32px 0',
          }}
        >
          No questions match this filter.
        </p>
      )}

      {/* Unit groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {grouped.map(([unitNum, qs]) => {
          const { primary, secondary } = getUnitLabel(unitNum)
          const isCollapsed = collapsedUnits.has(unitNum)

          return (
            <div key={unitNum}>
              {/* Unit header */}
              <button
                onClick={() => toggleUnit(unitNum)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 0 12px',
                  textAlign: 'left',
                }}
              >
                {/* Chevron */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{
                    flexShrink: 0,
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease',
                    color: 'var(--text-muted)',
                  }}
                >
                  <path
                    d="M2 5L7 10L12 5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontFamily: 'var(--font-outfit)',
                  }}
                >
                  {primary}
                </span>

                {secondary && (
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-outfit)',
                    }}
                  >
                    — {secondary}
                  </span>
                )}

                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {qs.length} {qs.length === 1 ? 'question' : 'questions'}
                </span>
              </button>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: 'var(--bg-border)',
                  marginBottom: isCollapsed ? 0 : '12px',
                }}
              />

              {/* Cards */}
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {qs.map(q => (
                    <QuestionCard
                      key={q.id}
                      q={q}
                      isMathSubject={isMathSubject}
                      isHovered={hoveredId === q.id}
                      onHover={() => setHoveredId(q.id)}
                      onLeave={() => setHoveredId(null)}
                      onSelect={() => onSelect(q)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer count */}
      {questions.length > 0 && (
        <p
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          {questions.length} {questions.length === 1 ? 'question' : 'questions'} available
          {releasedCount > 0 && ` · ${releasedCount} from released exams`}
          {generatedCount > 0 && ` · ${generatedCount} generated`}
        </p>
      )}
    </div>
  )
}
