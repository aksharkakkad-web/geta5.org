import Link from 'next/link'

interface SubjectCardProps {
  name: string
  slug: string
}

export function SubjectCard({ name, slug }: SubjectCardProps) {
  return (
    <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
      <div className="subject-card" style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, border-color 150ms ease',
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}>
          {name}
        </h3>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--accent)',
        }}>
          Start Practicing →
        </span>
      </div>
    </Link>
  )
}
