'use client'

import Link from 'next/link'
import { getSubject } from '@/utils/subjects'

interface BackToSubjectProps {
  subject: string
}

export function BackToSubject({ subject }: BackToSubjectProps) {
  const subjectInfo = getSubject(subject)
  const label = subjectInfo?.name ?? 'Subject'

  return (
    <Link
      href={`/${subject}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 0',
        marginBottom: '20px',
        textDecoration: 'none',
        transition: 'color 150ms ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)' }}
    >
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M9 2L4 7L9 12"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back to {label}
    </Link>
  )
}
