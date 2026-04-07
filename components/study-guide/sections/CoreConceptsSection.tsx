'use client'
import { useState } from 'react'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Concept {
  title: string
  detail: string
}

interface Props {
  concepts: Concept[]
}

export default function CoreConceptsSection({ concepts }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]))

  function toggle(idx: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Core Concepts
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {concepts.length} total
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
        {concepts.map((concept, idx) => {
          const isOpen = expanded.has(idx)
          return (
            <div
              key={idx}
              onClick={() => toggle(idx)}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${isOpen ? 'var(--bg-card-hover)' : 'var(--bg-border)'}`,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Trigger row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderBottom: isOpen ? '1px solid var(--bg-border)' : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isOpen ? 'var(--accent-hover)' : 'var(--text-muted)',
                    flexShrink: 0,
                    width: '18px',
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <InlineKatex text={concept.title} />
                </span>
                {/* Chevron */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{
                    flexShrink: 0,
                    color: isOpen ? 'var(--accent-hover)' : 'var(--text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <path d="M3 5l4 4 4-4" />
                </svg>
              </div>

              {/* Body */}
              {isOpen && (
                <div
                  style={{
                    padding: '10px 16px 13px 46px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                  }}
                >
                  <InlineKatex text={concept.detail} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
