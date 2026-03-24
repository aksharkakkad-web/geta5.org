'use client'
import InlineKatex from '@/components/study-guide/InlineKatex'

interface Props {
  theme: string
}

export default function ThemeSection({ theme }: Props) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), color-mix(in srgb, var(--accent) 4%, transparent))',
        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        fontSize: '15px',
        lineHeight: '1.6',
        color: 'var(--text-primary)',
      }}
    >
      <InlineKatex text={theme} />
    </div>
  )
}
