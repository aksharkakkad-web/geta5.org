'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useAuth } from '@/contexts/AuthContext'

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export function Header() {
  const { direction, isAtTop } = useScrollDirection(50)
  const [hovered, setHovered] = useState(false)
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
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
      backgroundColor: 'var(--bg-header-alpha)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '24px',
      paddingRight: '24px',
      justifyContent: 'space-between',
      zIndex: 50,
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '1px' }}>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
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
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            .app
          </span>
        </Link>
        <Link
          href="/founder"
          style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          Founder
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            border: '1px solid var(--border-interactive)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-interactive-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-interactive)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          {resolvedTheme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>

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
                    border: '1px solid var(--border-interactive)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-interactive-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-interactive)')}
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
      </div>
    </header>
  )
}
