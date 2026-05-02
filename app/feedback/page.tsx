'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type FeedbackType = 'Bug' | 'Feature' | 'Content' | 'Other'

const FEEDBACK_TYPES: FeedbackType[] = ['Bug', 'Feature', 'Content', 'Other']

const ACCENT_GRADIENT = 'linear-gradient(135deg, #6366f1, #a78bfa)'

// ── Shared input styles ───────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid var(--border-interactive)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
  fontFamily: 'var(--font-outfit), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 8,
  letterSpacing: '0.01em',
}

// ── Checkmark SVG for success state ──────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="28"
        cy="28"
        r="27"
        stroke="url(#check-gradient)"
        strokeWidth="2"
      />
      <path
        d="M18 28.5l7 7 13-14"
        stroke="url(#check-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="check-gradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 16,
      padding: '48px 0 32px',
    }}>
      <CheckCircleIcon />

      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: 0,
        lineHeight: 1.2,
      }}>
        Thanks — we got it
      </h2>

      <p style={{
        fontSize: '0.9375rem',
        color: 'var(--text-secondary)',
        margin: 0,
        lineHeight: 1.6,
        maxWidth: 380,
      }}>
        We read every piece of feedback. If you left an email, you&apos;ll hear back when there&apos;s something to share.
      </p>

      <button
        type="button"
        onClick={onReset}
        style={{
          marginTop: 8,
          background: 'none',
          border: 'none',
          color: '#a78bfa',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 6,
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Send another
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const { user } = useAuth()

  const [selectedType, setSelectedType] = useState<FeedbackType>('Bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Pre-fill email if signed in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user?.email])

  const canSubmit = message.trim().length >= 10

  const categoryMap: Record<FeedbackType, string> = {
    Bug: 'bug',
    Feature: 'feature',
    Content: 'content',
    Other: 'other',
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categoryMap[selectedType],
          message: message.trim(),
          contact_email: email.trim() || undefined,
          page_url: typeof window !== 'undefined'
            ? (document.referrer || window.location.href)
            : undefined,
        }),
      })

      if (res.status === 429) {
        setSubmitError("You've sent too many — try again in 10 minutes.")
        return
      }

      if (!res.ok) {
        setSubmitError('Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [canSubmit, submitting, selectedType, message, email]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = useCallback(() => {
    setSelectedType('Bug')
    setMessage('')
    setSubmitError(null)
    // Preserve email if the user is signed in; otherwise clear it
    if (!user?.email) {
      setEmail('')
    }
    setSubmitted(false)
  }, [user?.email])

  return (
    <main style={{
      minHeight: 'calc(100dvh - 56px)',
      paddingTop: 80,
      paddingBottom: 64,
      paddingLeft: 20,
      paddingRight: 20,
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 640,
      }}>

        {/* Page heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            Send feedback
          </h1>
          <p style={{
            marginTop: 8,
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            Bug reports, feature requests, or anything else — we read every one.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 16,
          padding: '32px',
        }}>
          {submitted ? (
            <SuccessState onReset={handleReset} />
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Type selector */}
              <div>
                <div style={labelStyle} role="group" aria-label="Feedback type">
                  Type
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  {FEEDBACK_TYPES.map(type => {
                    const isSelected = selectedType === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        aria-pressed={isSelected}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 999,
                          border: isSelected ? 'none' : '1px solid var(--border-interactive)',
                          background: isSelected ? ACCENT_GRADIENT : 'transparent',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                          fontFamily: 'var(--font-outfit), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          lineHeight: 1.5,
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-interactive-hover)'
                            e.currentTarget.style.color = 'var(--text-primary)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-interactive)'
                            e.currentTarget.style.color = 'var(--text-secondary)'
                          }
                        }}
                      >
                        {type}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Message textarea */}
              <div>
                <label htmlFor="feedback-message" style={labelStyle}>
                  What&apos;s on your mind?
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us what happened, what you'd like to see, or just how it's going…"
                  rows={6}
                  style={{
                    ...inputBase,
                    minHeight: 160,
                    resize: 'vertical',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--border-interactive-hover)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border-interactive)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Email field */}
              <div>
                <label htmlFor="feedback-email" style={labelStyle}>
                  Your email (optional)
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputBase}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--border-interactive-hover)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border-interactive)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <p style={{
                  marginTop: 6,
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                }}>
                  Only if you want a reply.
                </p>
              </div>

              {/* Inline error */}
              {submitError && (
                <p style={{
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  marginBottom: 8,
                  marginTop: -8,
                }}>
                  {submitError}
                </p>
              )}

              {/* Submit button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}>
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  style={{
                    width: '100%',
                    maxWidth: 200,
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: ACCENT_GRADIENT,
                    color: '#fff',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                    opacity: canSubmit && !submitting ? 1 : 0.5,
                    transition: 'opacity 150ms ease, transform 150ms ease, box-shadow 150ms ease',
                    fontFamily: 'var(--font-outfit), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => {
                    if (canSubmit && !submitting) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.35)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onMouseDown={e => {
                    if (canSubmit && !submitting) {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  {submitting ? 'Sending…' : 'Send feedback'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </main>
  )
}
