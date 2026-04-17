'use client'

import 'katex/dist/katex.min.css'
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import katex from 'katex'
import { X } from 'lucide-react'
import { MATH_SHORTCUTS } from '@/utils/mathShortcuts'

export interface FRQShortcutsModalProps {
  open: boolean
  onClose: () => void
}

function renderShortcutPreview(latex: string): string {
  try {
    return katex.renderToString(latex, {
      displayMode: false,
      throwOnError: false,
      output: 'htmlAndMathml',
    })
  } catch {
    return latex
  }
}

export default function FRQShortcutsModal({ open, onClose }: FRQShortcutsModalProps) {
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

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-heading"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5, 5, 8, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '480px',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h2
            id="shortcuts-modal-heading"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-outfit)',
              margin: 0,
            }}
          >
            Math Shortcuts
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts grid */}
        <div
          role="table"
          aria-label="Math shortcut reference"
          style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
        >
          {MATH_SHORTCUTS.map(({ shortcut, renders, description }) => {
            const renderedHtml = renderShortcutPreview(renders)
            return (
              <div
                key={shortcut}
                role="row"
                title={description}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                }}
              >
                {/* Left: shortcut code */}
                <div role="cell">
                  <code
                    style={{
                      display: 'inline-block',
                      fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--accent-hover)',
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {shortcut}
                  </code>
                </div>

                {/* Right: rendered KaTeX output */}
                <div
                  role="cell"
                  style={{ fontSize: '14px', color: 'var(--text-primary)' }}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
            margin: 0,
            flexShrink: 0,
          }}
        >
          Type naturally — the preview updates in real time
        </p>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
