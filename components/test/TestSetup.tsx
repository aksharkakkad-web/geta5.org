'use client'

import React, { useState } from 'react'
import { BookOpen, Clock } from 'lucide-react'

interface TestSetupProps {
  subjectSlug: string
  subjectName: string
  questionCount: number
  durationMinutes: number
  onStart: (timed: boolean, showTimer: boolean) => void
}

export default function TestSetup({
  subjectName,
  questionCount,
  durationMinutes,
  onStart,
}: TestSetupProps) {
  const [timed, setTimed] = useState(true)
  const [showTimer, setShowTimer] = useState(true)

  function handleStart() {
    onStart(timed, showTimer)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', padding: '24px' }}>
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
        }}
      >
        {/* Subject name */}
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          {subjectName}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 400,
            color: 'var(--text-secondary)',
            marginBottom: '20px',
          }}
        >
          Practice Test
        </p>

        {/* Metadata row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginBottom: '20px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} />
            {questionCount} questions
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} />
            {durationMinutes} minutes
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--bg-border)', marginBottom: '20px' }} />

        {/* Timed Mode toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            Timed Mode
          </span>
          <button
            role="switch"
            aria-checked={timed}
            onClick={() => {
              setTimed(!timed)
              if (timed) setShowTimer(false)
            }}
            style={{
              position: 'relative',
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              background: timed ? 'var(--accent)' : 'var(--bg-border)',
              transition: 'background 150ms ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: timed ? '22px' : '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: timed ? 'white' : 'var(--text-muted)',
                transition: 'left 150ms ease, background 150ms ease',
              }}
            />
          </button>
        </div>

        {/* Show Timer toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            opacity: timed ? 1 : 0.4,
          }}
        >
          <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            Show Timer
          </span>
          <button
            role="switch"
            aria-checked={showTimer}
            disabled={!timed}
            onClick={() => {
              if (timed) setShowTimer(!showTimer)
            }}
            style={{
              position: 'relative',
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: timed ? 'pointer' : 'not-allowed',
              padding: 0,
              background: showTimer && timed ? 'var(--accent)' : 'var(--bg-border)',
              transition: 'background 150ms ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: showTimer && timed ? '22px' : '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: showTimer && timed ? 'white' : 'var(--text-muted)',
                transition: 'left 150ms ease, background 150ms ease',
              }}
            />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--bg-border)', marginBottom: '20px' }} />

        {/* Start Test button */}
        <button
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.9375rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          Start Test
        </button>
      </div>
    </div>
  )
}
