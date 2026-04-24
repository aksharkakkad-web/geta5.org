'use client'

import { useState, useMemo } from 'react'
import type { DocCaseItem } from '@/utils/docsCases'
import { DocCaseCard } from './DocCaseCard'

interface DocsCasesHubClientProps {
  items: DocCaseItem[]
  subject: string
}

type TabKey = 'document' | 'case'

export function DocsCasesHubClient({ items, subject }: DocsCasesHubClientProps) {
  const [tab, setTab] = useState<TabKey>('document')

  const { docs, cases } = useMemo(() => {
    const docs = items.filter(i => i.type === 'document').sort((a, b) => a.year - b.year)
    const cases = items.filter(i => i.type === 'case').sort((a, b) => a.year - b.year)
    return { docs, cases }
  }, [items])

  const visible = tab === 'document' ? docs : cases

  return (
    <>
      <div
        role="tablist"
        aria-label="Document type"
        style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: '999px',
          width: 'fit-content',
          marginBottom: '32px',
        }}
      >
        <TabButton active={tab === 'document'} onClick={() => setTab('document')} count={docs.length} label="Foundational Documents" />
        <TabButton active={tab === 'case'} onClick={() => setTab('case')} count={cases.length} label="Supreme Court Cases" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {visible.map(item => (
          <DocCaseCard key={item.id} item={item} subject={subject} />
        ))}
      </div>
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
