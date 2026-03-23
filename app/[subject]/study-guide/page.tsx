export default function StudyGuidePage({ params }: { params: { subject: string } }) {
  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 style={{ color: 'var(--text-primary)' }}>Study Guide — Coming in Phase 4</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{params.subject}</p>
    </div>
  )
}
