'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
      } else {
        router.replace('/')
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
          Set a new password
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #a0a0b0)', marginBottom: 28 }}>
          Choose a strong password for your account.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="password" style={labelStyle}>New Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
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
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
