'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          background: '#050508',
          color: '#f5f5f5',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              background: '#0d0d14',
              border: '1px solid #1a1a2e',
              borderRadius: '12px',
              padding: '32px 28px',
            }}
          >
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, margin: 0, marginBottom: '10px' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '0.9375rem', color: '#a1a1a1', margin: 0, marginBottom: '20px', lineHeight: 1.6 }}>
              The app hit an unexpected error. Your saved progress is safe in this browser.
              {error?.digest ? ` (ref: ${error.digest})` : ''}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '11px 22px',
                borderRadius: '8px',
                background: '#6366f1',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
