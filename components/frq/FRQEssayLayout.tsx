'use client'

// components/frq/FRQEssayLayout.tsx
// Single essay layout for LEQ, Psych FRQs, Gov argument essays.
// Shows stimulus (if any), a question prompt card with all parts listed, and a single essay textarea.

import React, { useState } from 'react'
import type { FRQ } from '@/utils/frqSession'
import FRQStimulusBlock from '@/components/frq/FRQStimulusBlock'
import InlineMath from '@/components/InlineMath'

interface FRQEssayLayoutProps {
  question: FRQ
  responses: Record<string, string>
  onResponseChange: (partLetter: string, value: string) => void
  onSubmit: () => void
  onSaveDraft: () => void
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── Shared textarea ──────────────────────────────────────────────────────────

interface EssayTextareaProps {
  value: string
  onChange: (v: string) => void
  minHeight: number
  placeholder?: string
}

function EssayTextarea({ value, onChange, minHeight, placeholder = 'Write your essay here...' }: EssayTextareaProps) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck
      style={{
        background: 'var(--bg-primary)',
        border: focused ? '1px solid var(--accent)' : '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        fontSize: '14px',
        color: 'var(--text-primary)',
        width: '100%',
        minHeight: `${minHeight}px`,
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.8,
        outline: 'none',
        boxSizing: 'border-box',
        boxShadow: focused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

// ─── Shared button components ─────────────────────────────────────────────────

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        padding: '10px 20px',
        borderRadius: 'var(--radius-md)',
        fontSize: '14px',
        border: hovered ? '1px solid var(--accent)' : '1px solid var(--bg-border)',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, color 150ms ease',
        fontWeight: 500,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer',
        transition: 'opacity 150ms ease, transform 150ms ease',
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
      {children}
    </button>
  )
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function FRQEssayLayout({
  question,
  responses,
  onResponseChange,
  onSubmit,
  onSaveDraft,
}: FRQEssayLayoutProps) {
  const essayValue = responses.essay ?? ''
  const wc = wordCount(essayValue)
  const isMultiPart = question.parts.length > 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stimulus */}
      {(question.stimulus || question.stimulus_image) && (
        <FRQStimulusBlock stimulus={question.stimulus} stimulusImage={question.stimulus_image} />
      )}

      {/* Question prompt card */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderLeft: '3px solid var(--accent)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
        }}
      >
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
          Question
        </div>

        {isMultiPart ? (
          /* Multi-part: list all part prompts */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {question.parts.map((part) => (
              <div key={part.letter} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: 'var(--accent-hover)',
                    fontSize: '14px',
                    flexShrink: 0,
                    minWidth: '18px',
                  }}
                >
                  {part.letter}.
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7 }}>
                  <InlineMath text={part.prompt} />
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Single-part: show the prompt directly */
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7 }}>
            <InlineMath text={question.parts[0]?.prompt ?? question.title} />
          </p>
        )}
      </div>

      {/* Essay textarea */}
      <EssayTextarea
        value={essayValue}
        onChange={(v) => onResponseChange('essay', v)}
        minHeight={300}
      />

      {/* Footer: word count + actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {wc} {wc === 1 ? 'word' : 'words'}
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <GhostButton onClick={onSaveDraft}>Save Draft</GhostButton>
          <PrimaryButton onClick={onSubmit}>Submit for Grading</PrimaryButton>
        </div>
      </div>
    </div>
  )
}
