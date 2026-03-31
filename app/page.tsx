import type { Metadata } from 'next'
import { getAllSubjects } from '@/utils/subjects'
import { SubjectGrid } from '@/components/ui/SubjectGrid'
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

      <SubjectGrid subjects={subjects} />

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
