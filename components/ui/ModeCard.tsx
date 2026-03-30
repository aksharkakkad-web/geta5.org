'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ClipboardList, BookMarked, Trophy } from 'lucide-react'
import { ModeIcon } from '@/components/3d/ModeIcon'

const colorMap = {
  indigo: {
    hex: '#6366f1',
    rgb: '99, 102, 241',
    grad1: '#6366f1',
    grad2: '#a78bfa',
    iconColor: 'var(--accent)',
  },
  cyan: {
    hex: '#06b6d4',
    rgb: '6, 182, 212',
    grad1: '#06b6d4',
    grad2: '#22d3ee',
    iconColor: '#06b6d4',
  },
  green: {
    hex: '#10b981',
    rgb: '16, 185, 129',
    grad1: '#10b981',
    grad2: '#34d399',
    iconColor: '#10b981',
  },
  amber: {
    hex: '#f59e0b',
    rgb: '245, 158, 11',
    grad1: '#f59e0b',
    grad2: '#fbbf24',
    iconColor: 'var(--accent-warning)',
  },
} as const

type ColorKey = keyof typeof colorMap

const iconMap = {
  drills: BookOpen,
  practice: ClipboardList,
  'study-guide': BookMarked,
  test: Trophy,
} as const

type IconName = keyof typeof iconMap

interface ModeCardProps {
  title: string
  description: string
  iconName: IconName
  href: string
  colorKey: ColorKey
}

export function ModeCard({ title, description, iconName, href, colorKey }: ModeCardProps) {
  const Icon = iconMap[iconName]
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const c = colorMap[colorKey]
  const transition = reducedMotion ? 'none' : 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease'

  let transform = 'none'
  if (!reducedMotion) {
    if (pressed) transform = 'translateY(-2px) scale(0.98)'
    else if (hovered) transform = 'translateY(-4px)'
  }

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false) }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          height: '100%',
          transform,
          boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.4)' : 'none',
          transition,
        }}
      >
        {/* Gradient border — visible on hover */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-1px',
            borderRadius: '17px',
            background: `linear-gradient(135deg, ${c.grad1}, ${c.grad2})`,
            backgroundSize: '300% 300%',
            animation: hovered ? 'gradientShift 4s ease infinite' : 'none',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 0,
          }}
        />

        {/* Card inner */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: hovered ? 'none' : '1px solid rgba(255,255,255,0.06)',
            padding: '24px',
            height: '100%',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <ModeIcon iconName={iconName} color={c.hex} size={36} />
          </div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
