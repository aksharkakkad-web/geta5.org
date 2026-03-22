export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column' as const,
      gap: '12px',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Ascendly</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Free AP Exam Prep — coming soon</p>
    </main>
  )
}
