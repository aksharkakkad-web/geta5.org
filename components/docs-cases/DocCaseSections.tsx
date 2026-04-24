'use client'

import { useAdi } from '@/components/adi/AdiProvider'
import type { DocCaseSection } from '@/utils/docsCases'

interface DocCaseSectionsProps {
  heading: string
  sections: DocCaseSection[]
}

export function DocCaseSections({ heading, sections }: DocCaseSectionsProps) {
  const adi = useAdi()

  const askAdi = (text: string) => {
    adi.open()
    setTimeout(() => adi.sendMessage(text), 60)
  }

  return (
    <section style={{ marginBottom: '28px' }}>
      <h4 style={{
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        fontWeight: 600,
        margin: '0 0 12px 0',
      }}>
        {heading}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map((s) => (
          <details
            key={s.label}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <summary
              style={{
                listStyle: 'none',
                cursor: 'pointer',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '14px',
                userSelect: 'none',
              }}
            >
              <span style={{
                fontSize: '0.6875rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontWeight: 700,
                flexShrink: 0,
                minWidth: '6.5rem',
              }}>
                {s.label}
              </span>
              <span style={{
                fontSize: '0.9375rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                lineHeight: 1.35,
              }}>
                {s.title}
              </span>
              <span
                aria-hidden
                className="doc-case-section-chevron"
                style={{
                  marginLeft: 'auto',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  transition: 'transform 160ms ease',
                }}
              >
                ▾
              </span>
            </summary>
            <div style={{
              padding: '0 18px 18px 18px',
              borderTop: '1px solid var(--bg-border)',
              paddingTop: '14px',
            }}>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                {s.blurb}
              </p>
              {s.adi_prompt && (
                <button
                  onClick={() => askAdi(s.adi_prompt!)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    whiteSpace: 'nowrap',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Ask Adi about {s.label} →
                </button>
              )}
            </div>
          </details>
        ))}
      </div>
      <style>{`
        details[open] .doc-case-section-chevron {
          transform: rotate(180deg);
        }
      `}</style>
    </section>
  )
}
