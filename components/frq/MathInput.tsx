'use client'

import 'katex/dist/katex.min.css'
import React, { useId } from 'react'
import katex from 'katex'
import { convertToKaTeX } from '@/utils/mathShortcuts'

export interface MathInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onShowShortcuts?: () => void
}

function renderLines(value: string): Array<{ html: string; fallback: boolean }> {
  const converted = convertToKaTeX(value)
  return converted.split('\n').map((line) => {
    if (line.trim() === '') {
      return { html: '', fallback: false }
    }
    try {
      const html = katex.renderToString(line, {
        displayMode: false,
        throwOnError: true,
        output: 'htmlAndMathml',
      })
      return { html, fallback: false }
    } catch {
      // If KaTeX fails, show raw text in muted colour
      return { html: line, fallback: true }
    }
  })
}

export default function MathInput({
  value,
  onChange,
  placeholder = 'Type your work here...',
  onShowShortcuts,
}: MathInputProps) {
  const previewId = useId()
  const rendered = renderLines(value)
  const isEmpty = value.trim() === ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Textarea wrapper — relative so the fx button can be positioned inside */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Math input"
          aria-controls={previewId}
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: '140px',
            resize: 'vertical',
            padding: '14px',
            paddingRight: '46px', // make room for fx button
            fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--bg-border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />

        {/* fx shortcut button */}
        <button
          type="button"
          aria-label="Show math shortcuts"
          onClick={() => onShowShortcuts?.()}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRadius: '6px',
            color: 'var(--accent-hover)',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'border-color 150ms ease, color 150ms ease, background 150ms ease',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'var(--accent)'
            btn.style.background = 'color-mix(in srgb, var(--accent) 12%, transparent)'
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'var(--bg-border)'
            btn.style.background = 'var(--bg-card)'
          }}
        >
          fx
        </button>
      </div>

      {/* Live preview */}
      <div
        id={previewId}
        role="region"
        aria-label="Math preview"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderLeft: '3px solid var(--accent)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          minHeight: '52px',
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: '10px',
          }}
        >
          Preview
        </div>

        {/* Content */}
        {isEmpty ? (
          <div
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            Your work will preview here...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {rendered.map((line, i) => {
              if (line.html === '') {
                // Blank line — render a spacer
                return (
                  <div
                    key={i}
                    style={{ height: '1em' }}
                    aria-hidden="true"
                  />
                )
              }
              if (line.fallback) {
                return (
                  <div
                    key={i}
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
                      wordBreak: 'break-all',
                    }}
                  >
                    {line.html}
                  </div>
                )
              }
              return (
                <div
                  key={i}
                  style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)' }}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: line.html }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
