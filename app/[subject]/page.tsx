import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookOpen, ClipboardList, BookMarked, Trophy } from 'lucide-react'
import { getSubject } from '@/utils/subjects'
import { ModeCard } from '@/components/ui/ModeCard'
import { UnitProgressGrid } from '@/components/ui/UnitProgressGrid'
import { ProjectedScoreBadge } from '@/components/ui/ProjectedScoreBadge'
import { SubjectAnalytics } from '@/components/ui/SubjectAnalytics'

// Force dynamic rendering so "days to go" is always current, never frozen at build time
export const dynamic = 'force-dynamic'

interface SubjectPageProps {
  params: Promise<{ subject: string }>
}

export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const { subject: slug } = await params
  const subject = getSubject(slug)
  if (!subject) return {}
  return {
    title: `${subject.name} Prep — Free Practice | Ascendly`,
    description: `Free AP ${subject.name} practice questions, drills, and study guides. No signup.`,
  }
}

function getDaysUntilExam(examDate: string): number {
  const exam = new Date(examDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatExamDate(examDate: string): string {
  return new Date(examDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject: slug } = await params
  const subjectData = getSubject(slug)
  if (!subjectData) notFound()
  const subject = subjectData!

  const daysUntil = getDaysUntilExam(subject.examDate)
  const examDateFormatted = formatExamDate(subject.examDate)

  const modes = [
    {
      title: 'Drills',
      description: 'Flashcards and term recall',
      Icon: BookOpen,
      href: `/${subject.slug}/drills`,
    },
    {
      title: 'Practice Questions',
      description: 'MCQs with stimulus',
      Icon: ClipboardList,
      href: `/${subject.slug}/practice`,
    },
    {
      title: 'Study Guide',
      description: 'Concepts, terms, formulas',
      Icon: BookMarked,
      href: `/${subject.slug}/study-guide`,
    },
    {
      title: 'Practice Test',
      description: 'Full-length timed test',
      Icon: Trophy,
      href: `/${subject.slug}/practice-test`,
    },
  ]

  return (
    <div style={{
      maxWidth: '90rem',
      margin: '0 auto',
      paddingLeft: '24px',
      paddingRight: '24px',
      paddingTop: '40px',
      paddingBottom: '64px',
    }}>
      {/* Analytics — client island, renders null, fires page_view on mount */}
      <SubjectAnalytics subject={subject.slug} />

      {/* Subject header */}
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: '6px',
        }}>
          {subject.name}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          AP Exam: {examDateFormatted}
          {daysUntil > 0 && ` · ${daysUntil} days to go`}
          {daysUntil <= 0 && ' · Exam has passed'}
        </p>
      </div>

      {/* Projected score badge — client island */}
      <div style={{ marginTop: '12px', marginBottom: '32px' }}>
        <ProjectedScoreBadge subject={subject.slug} />
      </div>

      {/* Mode cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '48px',
      }}>
        {modes.map(mode => (
          <ModeCard
            key={mode.title}
            title={mode.title}
            description={mode.description}
            Icon={mode.Icon}
            href={mode.href}
          />
        ))}
      </div>

      {/* Unit progress — client island */}
      <UnitProgressGrid subject={subject.slug} units={subject.units} />
    </div>
  )
}
