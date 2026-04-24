'use client'

import { useAdi } from '@/components/adi/AdiProvider'

interface AdiQuizBlockProps {
  itemTitle: string
  quizPrompt: string
  explainPrompt: string
}

export function AdiQuizBlock({ itemTitle, quizPrompt, explainPrompt }: AdiQuizBlockProps) {
  const adi = useAdi()

  const askAdi = (text: string) => {
    adi.open()
    // Small delay so the panel is mounted before the message fires
    setTimeout(() => adi.sendMessage(text), 60)
  }

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(99,102,241,0.14) 0%, var(--bg-card) 70%)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    }}>
      <div
        aria-hidden
        style={{
          width: '48px',
          height: '48px',
          flexShrink: 0,
          transform: 'rotate(45deg)',
          background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
          borderRadius: '8px',
          boxShadow: '0 0 24px rgba(99,102,241,0.4), inset 0 0 12px rgba(255,255,255,0.15)',
        }}
      />
      <div style={{ flex: '1 1 280px', minWidth: 0 }}>
        <div style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: '4px',
        }}>
          Ready to test yourself?
        </div>
        <h3 style={{
          margin: '0 0 4px 0',
          fontSize: '1rem',
          color: 'var(--text-primary)',
          fontWeight: 600,
        }}>
          Adi can quiz you on {itemTitle}
        </h3>
        <p style={{
          margin: 0,
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}>
          Practice questions tailored to this — instantly, in chat.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => askAdi(quizPrompt)}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            background: 'var(--accent)',
            color: 'white',
            border: '1px solid var(--accent)',
            whiteSpace: 'nowrap',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
        >
          Ask Adi to quiz me →
        </button>
        <button
          onClick={() => askAdi(explainPrompt)}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--bg-border)',
            whiteSpace: 'nowrap',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
        >
          Explain this further
        </button>
      </div>
    </div>
  )
}
