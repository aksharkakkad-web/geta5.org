'use client'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  tip: string
}

export default function ExamTipSection({ tip }: Props) {
  return (
    <>
      {/* Sub-header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
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
            whiteSpace: 'nowrap',
          }}
        >
          Exam Tip
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
      </div>

      {/* Tip card */}
      <div
        style={{
          background: 'color-mix(in srgb, var(--accent-warning) 7%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent-warning) 18%, transparent)',
          borderRadius: '8px',
          padding: '16px 18px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: '2px' }}
        >
          <path d="M8 2L14 13H2L8 2z" />
          <path d="M8 7v3" />
          <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
        </svg>
        <div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent-warning)',
              marginBottom: '6px',
            }}
          >
            Exam Tip
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-primary)',
              lineHeight: '1.7',
              opacity: 0.9,
            }}
          >
            <InlineKatex text={tip} />
          </div>
        </div>
      </div>
    </>
  )
}
