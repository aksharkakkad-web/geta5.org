import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100dvh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '24px',
    }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        404 — Page not found
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          color: 'var(--accent)',
          fontSize: '0.875rem',
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        ← Back to home
      </Link>
    </div>
  )
}
