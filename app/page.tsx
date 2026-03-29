import type { Metadata } from 'next'
import { getAllSubjects } from '@/utils/subjects'
import { SubjectCard } from '@/components/ui/SubjectCard'
import { StreakStrip } from '@/components/ui/StreakStrip'

export const metadata: Metadata = {
  title: 'Get a 5 — 100% Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides for 7 AP subjects. No signup, no paywall, completely free.',
}

export default function HomePage() {
  const subjects = getAllSubjects()

  return (
    <div style={{
      maxWidth: '90rem',
      margin: '0 auto',
      paddingLeft: '24px',
      paddingRight: '24px',
    }}>
      {/* Hero — compact */}
      <div style={{ paddingTop: '48px', paddingBottom: '16px' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: '8px',
        }}>
          100% free AP exam prep.
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          No signup. No paywall. No ads. Just practice.
        </p>
      </div>

      {/* Subject Grid */}
      <div
        className="subject-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginTop: '24px',
        }}
      >
        {subjects.map(subject => (
          <SubjectCard key={subject.slug} name={subject.name} slug={subject.slug} />
        ))}
      </div>

      {/* Streak strip — client-only, renders after mount */}
      <div style={{ marginTop: '32px', paddingBottom: '48px' }}>
        <StreakStrip />
      </div>
    </div>
  )
}
