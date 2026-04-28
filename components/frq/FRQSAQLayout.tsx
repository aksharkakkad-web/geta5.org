'use client'

// components/frq/FRQSAQLayout.tsx
// Short Answer Question layout — three fixed parts (a, b, c) with compact textareas.
// SAQ parts are brief (1–3 sentences each), so textarea height is kept intentionally small.

import React from 'react'
import type { FRQ } from '@/utils/frqSession'
import FRQStimulusBlock from '@/components/frq/FRQStimulusBlock'

interface FRQSAQLayoutProps {
  question: FRQ
  responses: Record<string, string>
  onResponseChange: (partLetter: string, value: string) => void
  onSubmit: () => void
  onSaveDraft: () => void
}

export default function FRQSAQLayout({
  question,
  responses,
  onResponseChange,
  onSubmit,
  onSaveDraft,
}: FRQSAQLayoutProps) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stimulus — SAQs frequently have a passage or image */}
      <FRQStimulusBlock
        stimulus={question.stimulus}
        stimulusImage={question.stimulus_image}
      />

      {/* Parts — typically a, b, c */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {question.parts.map((part) => {
          const key = part.letter
          const value = responses[key] ?? ''
          return (
            <div
              key={key}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
              }}
            >
              {/* Part prompt row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.12)',
                    color: 'var(--accent-hover)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                  aria-hidden="true"
                >
                  {key.toLowerCase()}
                </span>
                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.55,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {part.prompt}
                  {' '}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontWeight: 400,
                    }}
                  >
                    ({part.point_value} {part.point_value === 1 ? 'pt' : 'pts'})
                  </span>
                </p>
              </div>

              {/* Compact textarea — SAQ responses are 1–2 sentences */}
              <textarea
                value={value}
                onChange={(e) => onResponseChange(key, e.target.value)}
                placeholder={`Part ${key.toLowerCase()}...`}
                aria-label={`Part ${key.toUpperCase()} response`}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  maxHeight: '150px',
                  resize: 'vertical',
                  padding: '14px',
                  fontSize: '14px',
                  lineHeight: 1.8,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  fontFamily: 'inherit',
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
              {/* Hint */}
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}
              >
                1-2 sentences is sufficient
              </p>
            </div>
          )
        })}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onSaveDraft}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'var(--accent)'
            btn.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'var(--bg-border)'
            btn.style.color = 'var(--text-secondary)'
          }}
        >
          Save Draft
        </button>

        <button
          type="button"
          onClick={onSubmit}
          style={{
            padding: '10px 22px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 150ms ease, transform 150ms ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Submit for Grading
        </button>
      </div>
    </div>
  )
}
