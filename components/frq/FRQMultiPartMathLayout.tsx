'use client'

// components/frq/FRQMultiPartMathLayout.tsx
// Multi-part math layout — MathInput per part with KaTeX preview, calculator badge.
// Used for Calc AB, Precalc, and AP Chemistry FRQs.

import React from 'react'
import type { FRQ } from '@/utils/frqSession'
import FRQStimulusBlock from '@/components/frq/FRQStimulusBlock'
import MathInput from '@/components/frq/MathInput'
import FRQSketchCanvas from '@/components/frq/FRQSketchCanvas'
import InlineMath from '@/components/InlineMath'

interface FRQMultiPartMathLayoutProps {
  question: FRQ
  responses: Record<string, string>
  onResponseChange: (partLetter: string, value: string) => void
  onSubmit: () => void
  onSaveDraft: () => void
  onShowShortcuts: () => void
}

export default function FRQMultiPartMathLayout({
  question,
  responses,
  onResponseChange,
  onSubmit,
  onSaveDraft,
  onShowShortcuts,
}: FRQMultiPartMathLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stimulus — displayed before calculator badge per spec */}
      <FRQStimulusBlock
        stimulus={question.stimulus}
        stimulusImage={question.stimulus_image}
      />

      {/* Calculator badge — only shown when calculator is allowed */}
      {question.calculator_allowed && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(34, 197, 94, 0.10)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            fontSize: '12px',
            fontWeight: 500,
            color: '#22c55e',
            alignSelf: 'flex-start',
          }}
        >
          Calculator Active
        </div>
      )}

      {/* Parts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {question.parts.map((part) => {
          const key = part.letter
          const value = responses[key] ?? ''
          return (
            <div key={key}>
              {/* Part header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--accent-hover)',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  {key.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.6,
                      margin: '0 0 4px 0',
                    }}
                  >
                    <InlineMath text={part.prompt} />
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    [{part.point_value} {part.point_value === 1 ? 'point' : 'points'}]
                  </span>
                </div>
              </div>

              {/* Sketch canvas for drawing parts, MathInput for everything else */}
              {part.requires_drawing ? (
                <FRQSketchCanvas
                  prompt={part.prompt}
                  referenceImage={part.reference_image ?? null}
                  stimulusImage={question.stimulus_image}
                />
              ) : (
                <MathInput
                  value={value}
                  onChange={(v) => onResponseChange(key, v)}
                  placeholder={`Show your work for Part ${key.toUpperCase()}...`}
                  onShowShortcuts={onShowShortcuts}
                />
              )}
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

      {/* Floating fx button — fixed position, triggers shortcuts modal */}
      <button
        type="button"
        aria-label="Show math shortcuts"
        onClick={onShowShortcuts}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 40,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--accent-hover)',
          cursor: 'pointer',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.borderColor = 'var(--accent)'
          btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 3px rgba(99, 102, 241, 0.2)'
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.borderColor = 'var(--bg-border)'
          btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}
      >
        fx
      </button>
    </div>
  )
}
