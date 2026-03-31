'use client'
import { SubjectCard } from './SubjectCard'

interface SubjectGridProps {
  subjects: { name: string; slug: string }[]
}

export function SubjectGrid({ subjects }: SubjectGridProps) {
  return (
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
  )
}
