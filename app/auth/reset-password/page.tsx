'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

// ── Shared styles ─────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: 16,
  padding: '40px 36px',
  width: '100%',
  maxWidth: 440,
}

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(255, 255, 255, 0.03)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: 'var(--text-secondary, #a0a0b0)',
  marginBottom: 6,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
}

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 20px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
  color: '#fff',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.01em',
}

// ── Page component ────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/update-password`

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100dvh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--bg-primary, #050508)',
    }}>
      <div style={cardStyle}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 4,
          lineHeight: 1.2,
        }}>
          Reset your password
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #a0a0b0)', marginBottom: 28 }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            color: '#4ade80',
            fontSize: '0.85rem',
            marginBottom: 16,
          }}>
            Check your email for a password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ ...primaryButtonStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary, #a0a0b0)' }}>
          <a
            href="/signup"
            style={{ color: '#a78bfa', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Back to login
          </a>
        </p>
      </div>
    </div>
  )
}
