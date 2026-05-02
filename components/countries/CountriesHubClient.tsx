'use client'

import { useState, useMemo } from 'react'
import type { CountryItem, RegimeCategory } from '@/utils/countries'
import { regimeCategoryLabel } from '@/utils/countries'
import { CountryCard } from './CountryCard'

interface CountriesHubClientProps {
  items: CountryItem[]
  subject: string
}

const TAB_ORDER: RegimeCategory[] = ['democratic', 'hybrid', 'authoritarian']

export function CountriesHubClient({ items, subject }: CountriesHubClientProps) {
  const [tab, setTab] = useState<RegimeCategory>('democratic')

  const byCategory = useMemo(() => {
    const map = new Map<RegimeCategory, CountryItem[]>()
    for (const cat of TAB_ORDER) {
      map.set(cat, items.filter(i => i.regime_category === cat))
    }
    return map
  }, [items])

  const visible = byCategory.get(tab) ?? []

  return (
    <>
      <div
        role="tablist"
        aria-label="Regime category"
        style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: '999px',
          width: 'fit-content',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        {TAB_ORDER.map(cat => (
          <TabButton
            key={cat}
            active={tab === cat}
            onClick={() => setTab(cat)}
            count={byCategory.get(cat)?.length ?? 0}
            label={regimeCategoryLabel(cat)}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          No countries in this category yet.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {visible.map(item => (
            <CountryCard key={item.id} item={item} subject={subject} />
          ))}
        </div>
      )}
    </>
  )
}

function TabButton({
  active,
  onClick,
  count,
  label,
}: {
  active: boolean
  onClick: () => void
  count: number
  label: string
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: '8px 18px',
        borderRadius: '999px',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: active ? 'white' : 'var(--text-secondary)',
        background: active ? 'var(--accent)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        boxShadow: active ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      {label}
      <span style={{ opacity: 0.7, marginLeft: '6px', fontWeight: 400 }}>{count}</span>
    </button>
  )
}
