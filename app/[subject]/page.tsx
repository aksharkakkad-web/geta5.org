export default function SubjectPage({ params }: { params: { subject: string } }) {
  return <div style={{ color: 'var(--text-primary)', padding: '40px' }}>Subject: {params.subject}</div>
}
