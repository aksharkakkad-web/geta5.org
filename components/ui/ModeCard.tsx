'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

const colorMap = {
  indigo: {
    hex: '#6366f1',
    rgb: '99, 102, 241',
    grad: 'linear-gradient(145deg, #1a1a2e 0%, #16161f 100%)',
    iconColor: 'var(--accent)',
  },
  cyan: {
    hex: '#06b6d4',
    rgb: '6, 182, 212',
    grad: 'linear-gradient(145deg, #0e1e2b 0%, #121820 100%)',
    iconColor: '#06b6d4',
  },
  green: {
    hex: '#10b981',
    rgb: '16, 185, 129',
    grad: 'linear-gradient(145deg, #0e1e18 0%, #121a16 100%)',
    iconColor: '#10b981',
  },
  amber: {
    hex: '#f59e0b',
    rgb: '245, 158, 11',
    grad: 'linear-gradient(145deg, #1e1a0e 0%, #1a1612 100%)',
    iconColor: 'var(--accent-warning)',
  },
} as const

type ColorKey = keyof typeof colorMap

interface ModeCardProps {
  title: string
  description: string
  Icon: LucideIcon
  href: string
  colorKey: ColorKey
}

export function ModeCard({ title, description, Icon, href, colorKey }: ModeCardProps) {
  const [hovered, setHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const c = colorMap[colorKey]

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: c.grad,
          border: hovered
            ? `1px solid rgba(${c.rgb}, 0.50)`
            : `1px solid rgba(${c.rgb}, 0.20)`,
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          cursor: 'pointer',
          height: '100%',
          boxShadow: hovered ? `0 4px 20px rgba(${c.rgb}, 0.12)` : 'none',
          transform: hovered && !reducedMotion ? 'translateY(-2px)' : 'none',
          transition: reducedMotion ? 'none' : 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
        }}
      >
        <Icon
          size={28}
          color={c.iconColor}
          style={{ marginBottom: '12px' }}
        />
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
    </Link>
  )
}
