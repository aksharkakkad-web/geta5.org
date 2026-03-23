import Link from 'next/link'

export function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--bg-border)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '24px',
      paddingRight: '24px',
      zIndex: 50,
    }}>
      <Link
        href="/"
        style={{
          color: 'var(--accent)',
          fontWeight: 700,
          fontSize: '1.125rem',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        Ascendly
      </Link>
    </header>
  )
}
