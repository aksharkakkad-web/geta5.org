'use client'

import React from 'react'
import type { ChangelogEntry as Entry, ChangelogType } from '@/utils/changelog'

const TYPE_LABEL: Record<ChangelogType, string> = {
  fix: 'Fix',
  feature: 'New',
  content: 'Content',
  improvement: 'Improved',
}

const TYPE_COLOR: Record<ChangelogType, string> = {
  fix: 'var(--accent-danger)',
  feature: 'var(--accent)',
  content: 'var(--accent-success)',
  improvement: 'var(--accent-warning)',
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function ChangelogEntry({ entry }: { entry: Entry }) {
  const color = TYPE_COLOR[entry.type]
  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: 999,
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color,
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
          }}
        >
          {TYPE_LABEL[entry.type]}
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(entry.date)}</span>
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
        {entry.title}
      </h3>
      <p style={{ fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-line' }}>
        {entry.body}
      </p>
    </article>
  )
}
