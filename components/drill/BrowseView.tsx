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

const UNGROUPED_LABEL = 'Other'

// Sort within a group: terms first, then people, then events/cases — alphabetical within each mode
const MODE_ORDER: Record<string, number> = {
  definition_to_term: 0,
  name_to_formula: 0,
  significance_to_person: 1,
  significance_to_event: 2,
  significance_to_case: 2,
}

function modeBucket(mode: string): number {
  return MODE_ORDER[mode] ?? 3
}

interface GroupSection {
  label: string
  cards: NormalizedCard[]
}

export default function BrowseView({ cards, unitSlug, subject, onBack }: BrowseViewProps) {
  const [search, setSearch] = useState('')

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

  // Build section list: groups appear in the order they first occur in the card array,
  // preserving the PDF's region ordering.
  const sections: GroupSection[] = useMemo(() => {
    const order: string[] = []
    const byGroup = new Map<string, NormalizedCard[]>()

    normalized.forEach(c => {
      const label = c.group?.trim() || UNGROUPED_LABEL
      if (!byGroup.has(label)) {
        byGroup.set(label, [])
        order.push(label)
      }
      byGroup.get(label)!.push(c)
    })

    // Sort within each group
    for (const list of byGroup.values()) {
      list.sort((a, b) => {
        const mb = modeBucket(a.mode) - modeBucket(b.mode)
        if (mb !== 0) return mb
        return a.term.localeCompare(b.term)
      })
    }

    return order.map(label => ({ label, cards: byGroup.get(label)! }))
  }, [normalized])

  // Apply search across all sections — hide sections with no matches
  const visibleSections: GroupSection[] = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sections
    const out: GroupSection[] = []
    for (const s of sections) {
      const filtered = s.cards.filter(
        c => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q)
      )
      if (filtered.length > 0) out.push({ label: s.label, cards: filtered })
    }
    return out
  }, [sections, search])

  const totalVisible = visibleSections.reduce((sum, s) => sum + s.cards.length, 0)

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
            {totalVisible} {totalVisible === 1 ? 'term' : 'terms'}
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

      {/* Empty state */}
      {totalVisible === 0 ? (
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
        /* Grouped sections */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {visibleSections.map(section => (
            <section key={section.label} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Section header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '0 4px',
                }}
              >
                <h2
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  {section.label}
                </h2>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                  }}
                >
                  {section.cards.length}
                </span>
              </div>

              {/* Table for this section */}
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
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {section.cards.map((card, i) => (
                  <div
                    key={card.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr',
                      padding: '14px 20px',
                      gap: '16px',
                      alignItems: 'start',
                      borderBottom: i < section.cards.length - 1 ? '1px solid var(--bg-border)' : 'none',
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
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
