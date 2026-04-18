'use client'

import React, { useState, useMemo } from 'react'
import type { FRQ, FRQType } from '@/utils/frqSession'
import InlineMath from '@/components/InlineMath'

interface FRQQuestionSelectProps {
  questions: FRQ[]
  subject: string
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
  aaq: 'AAQ',
  ebq: 'EBQ',
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

// ─── Component ────────────────────────────────────────────────────────────────

const MATH_SUBJECTS = new Set(['ap-calculus-ab', 'ap-precalculus', 'ap-chemistry'])

export default function FRQQuestionSelect({
  questions,
  subject,
  onSelect,
}: FRQQuestionSelectProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const isMathSubject = MATH_SUBJECTS.has(subject)

  const chips = useMemo(
    () => getFilterChips(subject, questions),
    [subject, questions]
  )

  const filtered = useMemo(
    () => questions.filter(q => matchesFilter(q, activeFilter)),
    [questions, activeFilter]
  )

  const releasedCount = questions.filter(q => q.source === 'released').length
  const generatedCount = questions.length - releasedCount

  return (
    <div>
      {/* Filter chips */}
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

      {/* Question cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

        {filtered.map(q => {
          const typeColors = getTypeChipColors(q.frq_type)
          const isHovered = hoveredId === q.id
          const unitList = q.related_units.length > 0
            ? `Units ${q.related_units.join(', ')}`
            : 'All Units'
          const partCount = q.parts.length

          return (
            <div
              key={q.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(q)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(q)
                }
              }}
              onMouseEnter={() => setHoveredId(q.id)}
              onMouseLeave={() => setHoveredId(null)}
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
              {/* Title row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '8px',
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

                {/* Right side: type chip + year */}
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
        })}
      </div>

      {/* Footer count */}
      {questions.length > 0 && (
        <p
          style={{
            marginTop: '16px',
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
