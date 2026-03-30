'use client'
import { Suspense, lazy } from 'react'

const SubjectScene = lazy(() => import('./SubjectScene'))

interface SubjectIconProps {
  subject: string
  size?: number
}

function IconSkeleton({ size = 56 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  )
}

export function SubjectIcon({ subject, size = 56 }: SubjectIconProps) {
  return (
    <Suspense fallback={<IconSkeleton size={size} />}>
      <SubjectScene subject={subject} size={size} />
    </Suspense>
  )
}
