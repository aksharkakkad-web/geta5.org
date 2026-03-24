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
          .sg-term-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="sg-term-grid">
        {terms.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--accent-hover)',
              }}
            >
              {item.term}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                lineHeight: '1.5',
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
