import type { Metadata } from 'next'
import { getAllSubjects } from '@/utils/subjects'
import { SubjectCard } from '@/components/ui/SubjectCard'
import { StreakStrip } from '@/components/ui/StreakStrip'
import { HeroSection } from '@/components/landing/HeroSection'

export const metadata: Metadata = {
  title: 'geta5.app — 100% Free AP Exam Prep',
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
      <HeroSection />

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
        {subjects.map((subject, i) => (
          <SubjectCard key={subject.slug} name={subject.name} slug={subject.slug} index={i} />
        ))}
      </div>

      {/* Streak strip */}
      <div style={{ marginTop: '32px', paddingBottom: '48px' }}>
        <StreakStrip />
      </div>

      {/* Discrete admin link */}
      <div style={{ textAlign: 'center', paddingBottom: '24px' }}>
        <a
          href="/admin"
          style={{ color: 'var(--bg-border)', fontSize: '0.625rem', textDecoration: 'none' }}
        >
          admin
        </a>
      </div>
    </div>
  )
}
