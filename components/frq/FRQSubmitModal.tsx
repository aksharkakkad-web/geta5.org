'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { GradingStrictness } from '@/utils/frqSession'
import { getLastStrictness, setLastStrictness } from '@/utils/frqSession'

interface FRQSubmitModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (strictness: GradingStrictness) => void
  remainingCalls: number
  dailyLimit: number
}

const STRICTNESS_OPTIONS: Array<{
  value: GradingStrictness
  label: string
  description: string
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Generous — gives credit for partial reasoning, focuses on what you did right',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Standard AP grading — follows the rubric as written',
  },
  {
    value: 'strict',
    label: 'Strict',
    description: 'Rigorous AP reader — requires precise language, penalizes vague reasoning',
  },
]

export default function FRQSubmitModal({ open, onClose, onSubmit, remainingCalls, dailyLimit }: FRQSubmitModalProps) {
  const [selected, setSelected] = useState<GradingStrictness>('moderate')

  useEffect(() => {
    if (open) {
      setSelected(getLastStrictness())
    }
  }, [open])

  // Trap focus / close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit() {
    setLastStrictness(selected)
    onSubmit(selected)
  }

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="frq-submit-heading"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          boxShadow:
            '0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent), 0 0 40px color-mix(in srgb, var(--accent) 12%, transparent), 0 24px 60px rgba(0, 0, 0, 0.6)',
          padding: '32px 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>

        {/* Adi diamond mascot */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            aria-hidden="true"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '10px',
              transform: 'rotate(45deg)',
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px color-mix(in srgb, var(--accent) 35%, transparent)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                transform: 'rotate(-45deg)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'white',
                fontFamily: 'var(--font-outfit)',
              }}
            >
              A
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2
              id="frq-submit-heading"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '4px',
                fontFamily: 'var(--font-outfit)',
              }}
            >
              Ready to grade?
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Choose how strictly Adi should score
            </p>
          </div>
        </div>

        {/* Strictness options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {STRICTNESS_OPTIONS.map(option => {
            const isSelected = selected === option.value
            return (
              <button
                key={option.value}
                onClick={() => setSelected(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--bg-border)'}`,
                  background: isSelected
                    ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                    : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 150ms ease, background 150ms ease',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'color-mix(in srgb, var(--accent) 50%, transparent)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-border)'
                  }
                }}
              >
                {/* Radio circle */}
                <div
                  aria-hidden="true"
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--text-muted)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                    transition: 'border-color 150ms ease',
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                      }}
                    />
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'color 150ms ease',
                      marginBottom: '2px',
                    }}
                  >
                    {option.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: isSelected ? 'var(--text-secondary)' : 'var(--text-muted)',
                      lineHeight: 1.45,
                      transition: 'color 150ms ease',
                    }}
                  >
                    {option.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--bg-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 150ms ease, color 150ms ease',
              fontFamily: 'var(--font-outfit)',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--text-muted)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-border)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '11px 16px',
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
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
            }}
          >
            Grade My Response
          </button>
        </div>

        {/* Footer info */}
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {remainingCalls <= 0 ? (
            <span style={{ color: 'var(--accent-warning)' }}>
              You&apos;ve used all {dailyLimit} of today&apos;s FRQ grades — submitting now will queue this for grading after your daily limit resets.
            </span>
          ) : (
            <>
              {remainingCalls} of {dailyLimit} FRQ grade{dailyLimit === 1 ? '' : 's'} left today
            </>
          )}
        </p>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
