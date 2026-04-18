'use client'
import Link from 'next/link'
import { useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'
import { SubjectIcon } from '@/components/3d/SubjectIcon'

interface SubjectCardProps {
  name: string
  slug: string
  index?: number
}

const SUBJECT_THEMES: Record<string, {
  dark: string
  light: string
  emoji: string
}> = {
  'ap-psychology': {
    dark: 'linear-gradient(135deg, #1e1035 0%, #2d1b69 50%, #1a0f3d 100%)',
    light: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)',
    emoji: '🧠',
  },
  'ap-world-history': {
    dark: 'linear-gradient(135deg, #1a1200 0%, #3d2800 50%, #1a0e00 100%)',
    light: 'linear-gradient(135deg, #fef9e7 0%, #fef3c7 50%, #fde68a 100%)',
    emoji: '🌍',
  },
  'ap-government': {
    dark: 'linear-gradient(135deg, #001a35 0%, #002d5c 50%, #001028 100%)',
    light: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
    emoji: '🏛️',
  },
  'ap-calculus-ab': {
    dark: 'linear-gradient(135deg, #001a1a 0%, #003333 50%, #001212 100%)',
    light: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 50%, #5eead4 100%)',
    emoji: '∫',
  },
  'ap-precalculus': {
    dark: 'linear-gradient(135deg, #0d1a2d 0%, #162844 50%, #080f1a 100%)',
    light: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
    emoji: '📐',
  },
  'ap-csp': {
    dark: 'linear-gradient(135deg, #001a0d 0%, #003320 50%, #000f08 100%)',
    light: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
    emoji: '💻',
  },
  'ap-chemistry': {
    dark: 'linear-gradient(135deg, #1a0a00 0%, #3d1500 50%, #120600 100%)',
    light: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)',
    emoji: '⚗️',
  },
  'ap-calculus-bc': {
    dark: 'linear-gradient(135deg, #0a001a 0%, #1a0035 50%, #06000f 100%)',
    light: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)',
    emoji: '∮',
  },
}

const DEFAULT_THEME = {
  dark: 'linear-gradient(135deg, #111 0%, #222 100%)',
  light: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  emoji: '📚',
}

export function SubjectCard({ name, slug, index = 0 }: SubjectCardProps) {
  const subjectTheme = SUBJECT_THEMES[slug] ?? DEFAULT_THEME
  const { resolvedTheme } = useTheme()
  const gradient = resolvedTheme === 'dark' ? subjectTheme.dark : subjectTheme.light
  const glowRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    glowRef.current.style.top = `${e.clientY - rect.top}px`
    glowRef.current.style.left = `${e.clientX - rect.left}px`
    glowRef.current.style.opacity = '1'
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = '0'
  }, [])

  return (
    <Link href={`/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="subject-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.3s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
          opacity: 0,
          animation: `fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) ${2.0 + index * 0.1}s forwards`,
          position: 'relative',
        }}
      >
        {/* Cursor glow */}
        <div
          ref={glowRef}
          aria-hidden
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            opacity: 0,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.3s',
            zIndex: 5,
          }}
        />

        {/* Art header */}
        <div
          style={{
            height: '100px',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            position: 'relative',
          }}
        >
          <SubjectIcon subject={slug} size={80} />
        </div>

        {/* Card body */}
        <div style={{ padding: '16px 20px 18px' }}>
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '6px',
            lineHeight: 1.3,
          }}>
            {name}
          </h3>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--accent)',
          }}>
            Start Practicing →
          </span>
        </div>
      </div>
    </Link>
  )
}
