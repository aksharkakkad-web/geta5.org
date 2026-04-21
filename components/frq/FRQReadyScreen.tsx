'use client'

import React from 'react'
import type { FRQ } from '@/utils/frqSession'
import { getQuestionSeconds } from '@/utils/frqSession'
import InlineMath from '@/components/InlineMath'
import FRQSourceLinks from '@/components/frq/FRQSourceLinks'

interface FRQReadyScreenProps {
  question: FRQ
  subject: string
  timedMode: boolean
  onTimedModeChange: (timed: boolean) => void
  onStart: () => void
  onBack: () => void
}

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

const MATH_SUBJECTS = new Set(['ap-calculus-ab', 'ap-precalculus', 'ap-chemistry'])

export default function FRQReadyScreen({
  question,
  subject,
  timedMode,
  onTimedModeChange,
  onStart,
  onBack,
}: FRQReadyScreenProps) {
  const isMath = MATH_SUBJECTS.has(subject)
  const totalSeconds = getQuestionSeconds(question)
  const timeLabel = formatSeconds(totalSeconds)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: '24px',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to questions
        </button>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            lineHeight: 1.4,
            fontFamily: 'var(--font-outfit)',
          }}
        >
          {isMath ? <InlineMath text={question.title} /> : question.title}
        </h2>

        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {question.parts.length} {question.parts.length === 1 ? 'part' : 'parts'}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {question.total_points} {question.total_points === 1 ? 'point' : 'points'}
          </span>
          {question.year != null && (
            <>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{question.year}</span>
            </>
          )}
        </div>

        {/* Original PDF link (released FRQs only) */}
        {question.source_pdf && (
          <div style={{ marginTop: '-12px', marginBottom: '28px' }}>
            <FRQSourceLinks pdfHref={question.source_pdf} />
          </div>
        )}

        {/* Timer toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Timed practice
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              {timedMode ? `${timeLabel} — auto-submits when time runs out` : 'No timer'}
            </p>
          </div>

          {/* Toggle pill */}
          <button
            role="switch"
            aria-checked={timedMode}
            onClick={() => onTimedModeChange(!timedMode)}
            style={{
              position: 'relative',
              width: '44px',
              height: '24px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: timedMode
                ? 'var(--accent)'
                : 'var(--bg-border)',
              transition: 'background 200ms ease',
              flexShrink: 0,
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: timedMode ? '23px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'white',
                transition: 'left 200ms ease',
                display: 'block',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-outfit)',
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
          {timedMode ? `Start — ${timeLabel}` : 'Start'}
        </button>
      </div>
    </div>
  )
}
