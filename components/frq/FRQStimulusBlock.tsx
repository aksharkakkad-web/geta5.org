'use client'

// components/frq/FRQStimulusBlock.tsx
// Reusable stimulus display — handles image, text (with KaTeX), or both.

import React from 'react'
import InlineMath from '@/components/InlineMath'

interface FRQStimulusBlockProps {
  stimulus: string | null
  stimulusImage: string | null
}

export default function FRQStimulusBlock({ stimulus, stimulusImage }: FRQStimulusBlockProps) {
  if (!stimulus && !stimulusImage) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {stimulusImage && (
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--bg-border)',
            background: 'var(--bg-card)',
            maxWidth: '100%',
          }}
        >
          <img
            src={stimulusImage}
            alt="Question stimulus"
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 'var(--radius-md)',
            }}
          />
        </div>
      )}

      {stimulus && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}
        >
          <InlineMath text={stimulus} />
        </div>
      )}
    </div>
  )
}
