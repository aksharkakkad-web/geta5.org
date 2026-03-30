'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useScrollDirection } from '@/hooks/useScrollDirection'

export function Header() {
  const { direction, isAtTop } = useScrollDirection(50)
  const [hovered, setHovered] = useState(false)
  const visible = isAtTop || direction === 'up' || hovered

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setHovered(e.clientY < 20)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '24px',
      paddingRight: '24px',
      zIndex: 50,
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.3s ease',
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline' }}>
        <span style={{
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#d4d4d4',
          letterSpacing: '-0.02em',
        }}>
          geta
        </span>
        <span style={{
          fontWeight: 800,
          fontSize: '1.35rem',
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          5
        </span>
        <span style={{
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#d4d4d4',
          letterSpacing: '-0.02em',
        }}>
          .app
        </span>
      </Link>
    </header>
  )
}
