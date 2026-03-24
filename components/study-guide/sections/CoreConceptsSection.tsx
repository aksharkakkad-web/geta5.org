'use client'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  concepts: string[]
}

export default function CoreConceptsSection({ concepts }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {concepts.map((concept, idx) => (
        <div
          key={idx}
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span
            style={{
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: '13px',
              flexShrink: 0,
              minWidth: '20px',
              marginTop: '1px',
            }}
          >
            {idx + 1}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
            <InlineKatex text={concept} />
          </span>
        </div>
      ))}
    </div>
  )
}
