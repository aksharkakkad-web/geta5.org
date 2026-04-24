'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { DocCaseItem } from '@/utils/docsCases'
import { unitNumberLabel } from '@/utils/docsCases'

interface DocCaseCardProps {
  item: DocCaseItem
  subject: string
}

export function DocCaseCard({ item, subject }: DocCaseCardProps) {
  const [hovered, setHovered] = useState(false)
  const authorLabel = item.type === 'document' ? item.author : item.vote

  return (
    <Link
      href={`/${subject}/docs-cases/${item.id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
          border: `1px solid ${hovered ? 'var(--accent)' : 'var(--bg-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          height: '100%',
          cursor: 'pointer',
          transition: 'background 150ms ease, border-color 150ms ease, transform 150ms ease',
          transform: hovered ? 'translateY(-2px)' : 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: '10px',
        }}>
          {item.year} · {unitNumberLabel(item.unit)}
        </div>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 6px 0',
          lineHeight: 1.3,
        }}>
          {item.title}
        </h3>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          margin: 0,
          flex: 1,
        }}>
          {item.byline}
        </p>
        {authorLabel && (
          <div style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--bg-border)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>
            {authorLabel}
          </div>
        )}
      </div>
    </Link>
  )
}
