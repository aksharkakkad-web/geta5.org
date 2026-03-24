'use client'
import { AlertTriangle } from 'lucide-react'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  tip: string
}

export default function ExamTipSection({ tip }: Props) {
  return (
    <div
      style={{
        background: 'color-mix(in srgb, var(--accent-warning) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent-warning) 25%, transparent)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <AlertTriangle
        size={18}
        style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: '2px' }}
      />
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--accent-warning)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '4px',
          }}
        >
          EXAM TIP
        </div>
        <div
          style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            lineHeight: '1.6',
          }}
        >
          <InlineKatex text={tip} />
        </div>
      </div>
    </div>
  )
}
