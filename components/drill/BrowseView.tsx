'use client'

import React, { useState, useMemo } from 'react'
import { ChevronLeft, Search, X } from 'lucide-react'
import { DrillCard, NormalizedCard, normalizeCard } from '@/utils/drillSession'
import { parseInlineMath } from '@/utils/parseInlineMath'
import KatexRenderer from '@/components/KatexRenderer'
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

  // Normalize once — exclude concept_mc (multiple-choice cards don't belong in a term/definition browse)
  const normalized = useMemo(
    () => cards.filter(c => c.mode !== 'concept_mc').map(normalizeCard),
    [cards]
  )

  // Apply filter chip then search
  const visible = useMemo(() => {
    let result = normalized
    if (filter === 'people') {
      result = result.filter(c => c.mode === 'significance_to_person')
    } else if (filter === 'terms') {
      result = result.filter(c => c.mode !== 'significance_to_person')
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
              <div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {parseInlineMath(card.term)}
                </span>
              </div>

              {/* Definition cell */}
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                {card.mode === 'name_to_formula'
                  ? <KatexRenderer formula={card.definition} displayMode={false} />
                  : parseInlineMath(card.definition)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
