'use client'
import { Suspense, lazy, Component, ReactNode } from 'react'

const SubjectScene = lazy(() => import('./SubjectScene'))

interface SubjectIconProps {
  subject: string
  size?: number
}

const FALLBACK_EMOJI: Record<string, string> = {
  'ap-psychology': '\u{1F9E0}',
  'ap-world-history': '\u{1F30D}',
  'ap-government': '\u{1F3DB}\u{FE0F}',
  'ap-calculus-ab': '\u{222B}',
  'ap-precalculus': '\u{1F4D0}',
  'ap-csp': '\u{1F4BB}',
  'ap-chemistry': '\u{2697}\u{FE0F}',
}

function FallbackIcon({ subject, size = 56 }: { subject: string; size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.5,
      borderRadius: '50%',
      background: 'rgba(99,102,241,0.08)',
    }}>
      {FALLBACK_EMOJI[subject] || '\u{1F4DA}'}
    </div>
  )
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

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

export function SubjectIcon({ subject, size = 56 }: SubjectIconProps) {
  return (
    <WebGLErrorBoundary fallback={<FallbackIcon subject={subject} size={size} />}>
      <Suspense fallback={<IconSkeleton size={size} />}>
        <SubjectScene subject={subject} size={size} />
      </Suspense>
    </WebGLErrorBoundary>
  )
}
