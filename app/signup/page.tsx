'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-browser'

// ── Shared styles ────────────────────────────────────────────────────────────

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

const googleButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 20px',
  borderRadius: 10,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  background: 'rgba(255, 255, 255, 0.04)',
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
}

// ── Google SVG logo ───────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="g-grad-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#4285F4" />
        </linearGradient>
      </defs>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #a0a0b0)', letterSpacing: '0.05em' }}>or</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

// ── Main form (uses useSearchParams — must be inside Suspense) ────────────────

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const urlError = searchParams.get('error')

  const { isAuthenticated, isLoading } = useAuth()

  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(urlError === 'auth_failed' ? 'Authentication failed. Please try again.' : null)
  const [success, setSuccess] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirect)
    }
  }, [isAuthenticated, isLoading, redirect, router])

  async function handleGoogle() {
    setError(null)
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (oauthError) setError(oauthError.message)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const supabase = createClient()

    try {
      if (mode === 'signup') {
        const emailRedirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        })
        if (signUpError) {
          setError(signUpError.message)
        } else {
          setSuccess('Check your email for a confirmation link to complete signup.')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          setError(signInError.message)
        } else {
          router.replace(redirect)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return null

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
        {/* Heading */}
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 4,
          lineHeight: 1.2,
        }}>
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #a0a0b0)', marginBottom: 28 }}>
          {mode === 'signup'
            ? 'Save your progress and access it from any device.'
            : 'Sign in to continue your AP prep.'}
        </p>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          style={googleButtonStyle}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        >
          <GoogleLogo />
          Continue with Google
        </button>

        <OrDivider />

        {/* Error / Success messages */}
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
        {success && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            color: '#4ade80',
            fontSize: '0.85rem',
            marginBottom: 16,
          }}>
            {success}
          </div>
        )}

        {/* Email / password form */}
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

          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
            />
          </div>

          {/* Forgot password (login mode only) */}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <a
                href="/auth/reset-password"
                style={{ fontSize: '0.82rem', color: '#a78bfa', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                Forgot password?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{ ...primaryButtonStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting
              ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
              : (mode === 'signup' ? 'Create account' : 'Sign in')}
          </button>
        </form>

        {/* Mode toggle */}
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary, #a0a0b0)' }}>
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null); setSuccess(null) }}
            style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: 0 }}
          >
            {mode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: 'calc(100dvh - 56px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary, #050508)',
      }} />
    }>
      <SignupForm />
    </Suspense>
  )
}
