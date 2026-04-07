'use client'

// components/frq/FRQMultiPartLayout.tsx
// Multi-part text layout for Gov (concept application, SCOTUS, quantitative analysis)
// and generic multi-part FRQs. Each part gets its own textarea.

import React, { useState } from 'react'
import type { FRQ } from '@/utils/frqSession'
import FRQStimulusBlock from '@/components/frq/FRQStimulusBlock'
import InlineMath from '@/components/InlineMath'

interface FRQMultiPartLayoutProps {
  question: FRQ
  responses: Record<string, string>
  onResponseChange: (partLetter: string, value: string) => void
  onSubmit: () => void
  onSaveDraft: () => void
}

// ─── Part textarea ────────────────────────────────────────────────────────────

interface PartTextareaProps {
  value: string
  onChange: (v: string) => void
  partLetter: string
}

function PartTextarea({ value, onChange, partLetter }: PartTextareaProps) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Your answer for part ${partLetter}...`}
      aria-label={`Part ${partLetter} response`}
      spellCheck
      style={{
        background: 'var(--bg-primary)',
        border: focused ? '1px solid var(--accent)' : '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        fontSize: '14px',
        color: 'var(--text-primary)',
        width: '100%',
        minHeight: '120px',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.8,
        outline: 'none',
        boxSizing: 'border-box',
        boxShadow: focused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        marginTop: '10px',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

// ─── Shared buttons ───────────────────────────────────────────────────────────

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

export default function FRQMultiPartLayout({
  question,
  responses,
  onResponseChange,
  onSubmit,
  onSaveDraft,
}: FRQMultiPartLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stimulus */}
      {(question.stimulus || question.stimulus_image) && (
        <FRQStimulusBlock stimulus={question.stimulus} stimulusImage={question.stimulus_image} />
      )}

      {/* Parts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {question.parts.map((part) => (
          <div key={part.letter}>
            {/* Part header: letter circle + prompt + points */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              {/* Letter circle */}
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
                }}
              >
                {part.letter}
              </div>

              {/* Prompt container */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  <InlineMath text={part.prompt} />
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  [{part.point_value} {part.point_value === 1 ? 'point' : 'points'}]
                </span>
              </div>
            </div>

            {/* Part textarea */}
            <PartTextarea
              value={responses[part.letter] ?? ''}
              onChange={(v) => onResponseChange(part.letter, v)}
              partLetter={part.letter}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
        <GhostButton onClick={onSaveDraft}>Save Draft</GhostButton>
        <PrimaryButton onClick={onSubmit}>Submit for Grading</PrimaryButton>
      </div>
    </div>
  )
}
