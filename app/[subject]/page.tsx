import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSubject, getVocabLabel } from '@/utils/subjects'
import { ModeCard } from '@/components/ui/ModeCard'
import { ProjectedScoreBadge } from '@/components/ui/ProjectedScoreBadge'
import { SubjectAnalytics } from '@/components/ui/SubjectAnalytics'
import { SubjectHubClient } from '@/components/ui/SubjectHubClient'
import { hasFRQs } from '@/utils/frqSession'
import { hasDocsCases } from '@/utils/docsCases'

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
    title: `${subject.name} Prep — Free Practice | geta5.app`,
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

  const vocabLabel = getVocabLabel(subject.slug)
  const vocabDescription = vocabLabel === 'Formulas'
    ? 'Browse key formulas by unit'
    : 'Browse key terms by unit'

  const modes = [
    {
      title: 'Drills',
      description: 'Flashcards and term recall',
      iconName: 'drills' as const,
      href: `/${subject.slug}/drills`,
      colorKey: 'indigo' as const,
    },
    {
      title: vocabLabel,
      description: vocabDescription,
      iconName: 'vocab' as const,
      href: `/${subject.slug}/vocab`,
      colorKey: 'violet' as const,
    },
    {
      title: 'Practice Questions',
      description: 'MCQs with stimulus',
      iconName: 'practice' as const,
      href: `/${subject.slug}/practice`,
      colorKey: 'cyan' as const,
    },
    {
      title: 'Study Guide',
      description: 'Concepts, terms, formulas',
      iconName: 'study-guide' as const,
      href: `/${subject.slug}/study-guide`,
      colorKey: 'green' as const,
    },
    {
      title: 'Docs & Cases',
      description: 'Required documents & Supreme Court cases',
      iconName: 'docs-cases' as const,
      href: `/${subject.slug}/docs-cases`,
      colorKey: 'indigo' as const,
    },
    {
      title: 'FRQ Practice',
      description: 'Free response with AI grading',
      iconName: 'frq' as const,
      href: `/${subject.slug}/frq`,
      colorKey: 'rose' as const,
    },
    {
      title: 'Practice Test',
      description: 'Full-length timed test',
      iconName: 'test' as const,
      href: `/${subject.slug}/practice-test`,
      colorKey: 'amber' as const,
    },
  ]

  const filteredModes = modes.filter(m => {
    if (m.title === 'FRQ Practice') return hasFRQs(subject.slug)
    if (m.title === 'Docs & Cases') return hasDocsCases(subject.slug)
    return true
  })

  return (
    <SubjectHubClient>
      <div style={{
        maxWidth: '90rem',
        margin: '0 auto',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingTop: '40px',
        paddingBottom: '64px',
        position: 'relative',
      }}>
        {/* Analytics — client island */}
        <SubjectAnalytics subject={subject.slug} />

        {/* Subject header */}
        <div style={{ marginBottom: '8px', position: 'relative', zIndex: 2 }}>
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

        {/* Projected score badge */}
        <div style={{ marginTop: '12px', marginBottom: '32px', position: 'relative', zIndex: 2 }}>
          <ProjectedScoreBadge subject={subject.slug} />
        </div>

        {/* Mode cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '48px',
          position: 'relative',
          zIndex: 2,
        }}>
          {filteredModes.map(mode => (
            <ModeCard
              key={mode.title}
              title={mode.title}
              description={mode.description}
              iconName={mode.iconName}
              href={mode.href}
              colorKey={mode.colorKey}
            />
          ))}
        </div>
      </div>
    </SubjectHubClient>
  )
}
