'use client'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  terms: { term: string; definition: string }[]
}

export default function KeyTermsSection({ terms }: Props) {
  return (
    <>
      <style>{`
        .sg-term-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        @media (max-width: 639px) {
          .sg-term-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="sg-term-grid">
        {terms.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-border)',
              borderRadius: '8px',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
                boxShadow: 'inset 0 -2px 0 rgba(99,102,241,0.3)',
                display: 'inline',
              }}
            >
              <InlineKatex text={item.term} />
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}
            >
              <InlineKatex text={item.definition} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
