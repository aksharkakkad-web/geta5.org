'use client'

import { useEffect, useRef, useState } from 'react'

interface FRQTimerBarProps {
  totalSeconds: number
  startedAt: number
  onExpire: () => void
}

export default function FRQTimerBar({ totalSeconds, startedAt, onExpire }: FRQTimerBarProps) {
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(0, totalSeconds - Math.floor((Date.now() - startedAt) / 1000))
  )
  const expiredRef = useRef(false)

  useEffect(() => {
    expiredRef.current = false

    const tick = () => {
      const r = Math.max(0, totalSeconds - Math.floor((Date.now() - startedAt) / 1000))
      setRemaining(r)
      if (r === 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpire()
      }
    }

    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [totalSeconds, startedAt, onExpire])

  const pct = totalSeconds > 0 ? remaining / totalSeconds : 0
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`

  const isWarning = remaining <= 5 * 60 && remaining > 60
  const isDanger = remaining <= 60

  const barColor = isDanger
    ? 'var(--accent-danger, #ef4444)'
    : isWarning
      ? 'var(--accent-warning, #f59e0b)'
      : 'var(--accent)'

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        borderBottom: '1px solid var(--bg-border)',
        padding: '8px 16px',
        marginBottom: '16px',
        marginLeft: '-24px',
        marginRight: '-24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Time text */}
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: isDanger ? 'var(--accent-danger, #ef4444)' : isWarning ? 'var(--accent-warning, #f59e0b)' : 'var(--text-secondary)',
            fontVariantNumeric: 'tabular-nums',
            minWidth: '42px',
            animation: isDanger ? 'pulse 1s ease-in-out infinite' : 'none',
          }}
        >
          {timeStr}
        </span>

        {/* Progress track */}
        <div
          style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            background: 'var(--bg-border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct * 100}%`,
              background: barColor,
              borderRadius: '2px',
              transition: 'width 0.5s linear, background 0.5s ease',
            }}
          />
        </div>
      </div>
    </div>
  )
}
