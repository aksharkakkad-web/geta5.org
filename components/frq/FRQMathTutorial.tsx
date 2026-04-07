'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AdiIcon } from '@/components/adi/AdiMascot'

interface FRQMathTutorialProps {
  open: boolean
  onClose: () => void
}

const GOOD_EXAMPLE = `f(x) = 3x^2 + 2x - 5
Using power rule on each term:
d/dx(3x^2) = 6x
d/dx(2x) = 2
d/dx(-5) = 0
f'(x) = 6x + 2`

export default function FRQMathTutorial({ open, onClose }: FRQMathTutorialProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="frq-math-tutorial-heading"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5,5,8,0.85)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90dvh',
          overflowY: 'auto',
          margin: 'auto',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--bg-border)',
          boxShadow:
            '0 0 40px rgba(99,102,241,0.12), 0 24px 60px rgba(0,0,0,0.6)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Adi icon centered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <AdiIcon size={48} />
          <h2
            id="frq-math-tutorial-heading"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              textAlign: 'center',
              fontFamily: 'var(--font-outfit)',
            }}
          >
            How to Answer Math FRQs
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Show your work like you would on the real AP exam — Adi grades your
            process, not just your answer.
          </p>
        </div>

        {/* Sample question */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-border)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Find the derivative of f(x) = 3x&sup2; + 2x &minus; 5
          </p>
        </div>

        {/* Two example boxes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          {/* BAD — just the answer */}
          <div
            style={{
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-danger)',
                marginBottom: '8px',
              }}
            >
              Just the answer
            </div>
            <pre
              style={{
                fontFamily:
                  'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {"f'(x) = 6x + 2"}
            </pre>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                marginTop: '8px',
                marginBottom: 0,
                lineHeight: 1.4,
              }}
            >
              Missing work — loses points
            </p>
          </div>

          {/* GOOD — full credit */}
          <div
            style={{
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-success)',
                marginBottom: '8px',
              }}
            >
              Full credit
            </div>
            <pre
              style={{
                fontFamily:
                  'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
                lineHeight: 1.8,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {GOOD_EXAMPLE}
            </pre>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                marginTop: '8px',
                marginBottom: 0,
                lineHeight: 1.4,
              }}
            >
              Shows reasoning — full marks
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '4px',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 150ms ease, transform 150ms ease',
            fontFamily: 'var(--font-outfit)',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'var(--accent-hover)'
            btn.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'var(--accent)'
            btn.style.transform = 'translateY(0)'
          }}
        >
          Got it, let's go
        </button>
      </div>
    </div>,
    document.body
  )
}
