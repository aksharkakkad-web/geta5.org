'use client'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  theme: string
  conceptCount: number
}

export default function ThemeSection({ theme, conceptCount }: Props) {
  return (
    <div
      style={{
        borderLeft: '2px solid var(--accent)',
        paddingLeft: '20px',
        marginBottom: '32px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-hover)',
          marginBottom: '10px',
        }}
      >
        Central Theme
      </div>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: '1.75',
        }}
      >
        <InlineKatex text={theme} />
      </div>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '14px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{conceptCount}</span>{' '}
          core concepts
        </span>
      </div>
    </div>
  )
}
