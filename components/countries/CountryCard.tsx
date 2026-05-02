'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CountryItem } from '@/utils/countries'
import { regimeCategoryLabel } from '@/utils/countries'

interface CountryCardProps {
  item: CountryItem
  subject: string
}

export function CountryCard({ item, subject }: CountryCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/${subject}/countries/${item.id}`}
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
        {/* Kicker: regime_type · regime_category */}
        <div style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <span>{item.regime_type}</span>
          <span style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px 6px',
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            fontWeight: 700,
          }}>
            {regimeCategoryLabel(item.regime_category)}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 6px 0',
          lineHeight: 1.3,
        }}>
          {item.title}
        </h3>

        {/* Byline */}
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          margin: 0,
          flex: 1,
        }}>
          {item.byline}
        </p>

        {/* Paired-with chips */}
        {item.paired_with.length > 0 && (
          <div style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--bg-border)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            {item.paired_with.map(p => (
              <span
                key={p.id}
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 7px',
                }}
              >
                {p.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
