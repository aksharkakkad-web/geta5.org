'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('[app error]', error)
    }
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100dvh - 120px)',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 28px',
        }}
      >
        <h1
          style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '10px',
            fontFamily: 'var(--font-outfit)',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            margin: 0,
            marginBottom: '20px',
            lineHeight: 1.6,
          }}
        >
          This part of the app hit an unexpected error. Your progress is saved locally — try again.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              padding: '11px 22px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent)',
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-outfit)',
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              padding: '11px 22px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              border: '1px solid var(--bg-border)',
              textDecoration: 'none',
              fontFamily: 'var(--font-outfit)',
            }}
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
