'use client'

import React, { useState, useEffect, useRef } from 'react'

interface TestTimerProps {
  initialSeconds: number
  timed: boolean
  visible?: boolean
  inline?: boolean
  onExpiry: () => void
}

export default function TestTimer({ initialSeconds, timed, visible = true, inline = false, onExpiry }: TestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onExpiryRef = useRef(onExpiry)

  // Keep onExpiry ref current to avoid stale closure
  useEffect(() => {
    onExpiryRef.current = onExpiry
  }, [onExpiry])

  useEffect(() => {
    if (!timed) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          // Call onExpiry after state update settles
          setTimeout(() => onExpiryRef.current(), 0)
          return 0
        }
        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timed]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!timed) return null

  const isWarning = secondsLeft <= 300
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  if (inline) {
    return (
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.875rem',
          color: isWarning ? 'var(--accent-danger)' : 'var(--text-muted)',
          transition: 'color 300ms ease',
          animation: isWarning ? 'timer-pulse 1200ms ease infinite' : 'none',
          letterSpacing: '0.01em',
        }}
        className={isWarning ? 'timer-warning' : ''}
      >
        <style>{`
          @keyframes timer-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @media (prefers-reduced-motion: reduce) {
            .timer-warning { animation: none !important; }
          }
        `}</style>
        {display}
      </span>
    )
  }

  return (
    <div
      style={{
        visibility: visible ? 'visible' : 'hidden',
        fontSize: '1.5rem',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: isWarning ? 'var(--accent-danger)' : 'var(--text-primary)',
        transition: 'color 300ms ease',
        animation: isWarning ? 'timer-pulse 1200ms ease infinite' : 'none',
      }}
    >
      <style>{`
        @keyframes timer-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @media (prefers-reduced-motion: reduce) {
          .timer-warning { animation: none !important; }
        }
      `}</style>
      <span className={isWarning ? 'timer-warning' : ''}>
        {display}
      </span>
    </div>
  )
}
