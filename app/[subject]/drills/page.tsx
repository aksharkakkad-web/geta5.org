export default function DrillsPage({ params }: { params: { subject: string } }) {
  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 style={{ color: 'var(--text-primary)' }}>Drills — Coming in Phase 2</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{params.subject}</p>
    </div>
  )
}
