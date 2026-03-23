export default function PracticePage({ params }: { params: { subject: string } }) {
  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 style={{ color: 'var(--text-primary)' }}>Practice Questions — Coming in Phase 3</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{params.subject}</p>
    </div>
  )
}
