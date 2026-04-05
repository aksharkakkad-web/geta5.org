'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { direction, isAtTop } = useScrollDirection(50)
  const [hovered, setHovered] = useState(false)
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const visible = isAtTop || direction === 'up' || hovered

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setHovered(e.clientY < 20)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || ''

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
      justifyContent: 'space-between',
      zIndex: 50,
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.3s ease',
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '1px' }}>
        <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#d4d4d4', letterSpacing: '-0.01em' }}>
          geta
        </span>
        <span style={{
          fontWeight: 800,
          fontSize: '1.35rem',
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em',
        }}>
          5
        </span>
        <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#d4d4d4', letterSpacing: '-0.01em' }}>
          .app
        </span>
      </Link>

      {!isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </span>
              <button
                onClick={signOut}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/signup"
              style={{
                fontSize: '0.8rem',
                color: '#a78bfa',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
