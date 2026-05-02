'use client'

import React from 'react'
import type { FRQGradingResult, GradingStrictness, FRQPart } from '@/utils/frqSession'
import { AdiIcon } from '@/components/adi/AdiMascot'

interface FRQResultsProps {
  result: FRQGradingResult
  strictness: GradingStrictness
  drawingParts?: FRQPart[]
  onAskAdi: () => void
  onNextQuestion: () => void
  onRetry: () => void
}

const CIRCUMFERENCE = 2 * Math.PI * 52 // ≈ 326.73

function getScoreColor(pct: number): string {
  if (pct >= 70) return 'var(--accent)'
  if (pct >= 40) return 'var(--accent-warning)'
  return 'var(--accent-danger)'
}

function getScoreGlow(pct: number): string {
  if (pct >= 70) return 'drop-shadow(0 0 8px rgba(99,102,241,0.55))'
  if (pct >= 40) return 'drop-shadow(0 0 8px rgba(245,158,11,0.55))'
  return 'drop-shadow(0 0 8px rgba(239,68,68,0.55))'
}

function getPartColor(earned: number, max: number): string {
  if (earned === max) return 'var(--accent-success)'
  if (earned === 0) return 'var(--accent-danger)'
  return 'var(--accent-warning)'
}

function getPartBorder(earned: number, max: number): string {
  if (earned === max) return '1px solid rgba(34,197,94,0.2)'
  if (earned === 0) return '1px solid rgba(239,68,68,0.2)'
  return '1px solid rgba(245,158,11,0.2)'
}

function getPartShadow(earned: number, max: number): string {
  if (earned === max) return '0 0 20px rgba(34,197,94,0.12)'
  if (earned === 0) return '0 0 20px rgba(239,68,68,0.12)'
  return '0 0 20px rgba(245,158,11,0.12)'
}

function getPartBg(earned: number, max: number): string {
  if (earned === max) return 'rgba(34,197,94,0.15)'
  if (earned === 0) return 'rgba(239,68,68,0.15)'
  return 'rgba(245,158,11,0.15)'
}

function getPartBadgeBg(earned: number, max: number): string {
  if (earned === max) return 'rgba(34,197,94,0.12)'
  if (earned === 0) return 'rgba(239,68,68,0.12)'
  return 'rgba(245,158,11,0.12)'
}

const STRICTNESS_LABEL: Record<GradingStrictness, string> = {
  light: 'Light Grading',
  moderate: 'Moderate Grading',
  strict: 'Strict Grading',
}

export default function FRQResults({
  result: rawResult,
  strictness,
  drawingParts = [],
  onAskAdi,
  onNextQuestion,
  onRetry,
}: FRQResultsProps) {
  // Defensive clamp: pre-fix submissions stored in Supabase can have part.earned
  // exceed part.max (and total_score exceed max_score) when the rubric had
  // tiered scoring_points whose values summed higher than the part. The grading
  // pipeline now clamps server-side, but legacy results need this safety net.
  const result = React.useMemo(() => {
    const clampedParts = rawResult.parts.map(p => ({
      ...p,
      earned: Math.min(p.earned, p.max),
    }))
    const clampedTotal = Math.min(
      rawResult.total_score,
      clampedParts.reduce((s, p) => s + p.earned, 0),
      rawResult.max_score,
    )
    return { ...rawResult, parts: clampedParts, total_score: clampedTotal }
  }, [rawResult])

  const pct = result.max_score > 0 ? result.total_score / result.max_score : 0
  const scoreColor = getScoreColor(pct * 100)
  const scoreGlow = getScoreGlow(pct * 100)
  const strokeDashoffset = CIRCUMFERENCE * (1 - pct)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      {/* Score ring */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ transform: 'rotate(-90deg)', display: 'block' }}
            aria-hidden="true"
          >
            {/* Background track */}
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="var(--bg-border)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress arc */}
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke={scoreColor}
              strokeWidth="8"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ filter: scoreGlow, transition: 'stroke-dashoffset 800ms ease' }}
            />
          </svg>
          {/* Center text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1,
                fontFamily: 'var(--font-outfit)',
              }}
            >
              {result.total_score}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              /{result.max_score}
            </span>
          </div>
        </div>

        {/* Label row */}
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Points Earned
          </span>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.12)',
              color: 'var(--accent-hover)',
              fontSize: '0.6875rem',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
            }}
          >
            {STRICTNESS_LABEL[strictness]}
          </span>
        </div>
      </div>

      {/* Per-part breakdown */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {result.parts.map((part) => {
          const partColor = getPartColor(part.earned, part.max)
          const partBorder = getPartBorder(part.earned, part.max)
          const partShadow = getPartShadow(part.earned, part.max)
          const partBg = getPartBg(part.earned, part.max)
          const partBadgeBg = getPartBadgeBg(part.earned, part.max)

          return (
            <div
              key={part.letter}
              style={{
                background: 'var(--bg-card)',
                border: partBorder,
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: partShadow,
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                {/* Letter circle */}
                <div
                  aria-hidden="true"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: partBg,
                    color: partColor,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {part.letter.toUpperCase()}
                </div>

                {/* Part label */}
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    flex: 1,
                  }}
                >
                  Part {part.letter.toUpperCase()}
                </span>

                {/* Score badge */}
                <span
                  style={{
                    background: partBadgeBg,
                    color: partColor,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {part.earned}/{part.max}
                </span>
              </div>

              {/* Feedback text */}
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  paddingLeft: '38px',
                  margin: 0,
                }}
              >
                {part.feedback}
              </p>

              {/* Missed callout */}
              {part.missed != null && (
                <div
                  style={{
                    marginTop: '8px',
                    marginLeft: '38px',
                    background: 'rgba(245,158,11,0.06)',
                    borderLeft: '2px solid var(--accent-warning)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '0.8125rem',
                    color: 'var(--accent-warning)',
                    lineHeight: 1.5,
                  }}
                >
                  {part.missed}
                </div>
              )}
            </div>
          )
        })}

        {/* Self-assessed drawing parts */}
        {drawingParts.map((dp) => (
          <div
            key={`draw-${dp.letter}`}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                aria-hidden="true"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(99,102,241,0.12)',
                  color: 'var(--accent-hover)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {dp.letter.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                Part {dp.letter.toUpperCase()}
              </span>
              <span style={{
                background: 'rgba(99,102,241,0.1)',
                color: 'var(--accent-hover)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 500,
                fontStyle: 'italic',
              }}>
                Self-assessed
              </span>
            </div>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              paddingLeft: '38px',
              margin: '8px 0 0',
              fontStyle: 'italic',
            }}>
              This part requires sketching — compare your drawing with the reference answer shown during practice.
            </p>
          </div>
        ))}
      </div>

      {/* Adi Takeaway */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: '0 0 20px rgba(99,102,241,0.08)',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <AdiIcon size={32} />
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--accent-hover)',
            }}
          >
            Adi's Takeaway
          </span>
        </div>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {result.takeaway}
        </p>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Ask Adi to Explain — ghost */}
        <button
          onClick={onAskAdi}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'var(--accent)'
            btn.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'var(--bg-border)'
            btn.style.color = 'var(--text-secondary)'
          }}
        >
          Ask Adi to Explain
        </button>

        {/* Try Again — ghost */}
        <button
          onClick={onRetry}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'var(--accent)'
            btn.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'var(--bg-border)'
            btn.style.color = 'var(--text-secondary)'
          }}
        >
          Try Again
        </button>

        {/* Next Question — primary */}
        <button
          onClick={onNextQuestion}
          style={{
            padding: '10px 22px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 150ms ease, transform 150ms ease',
            fontFamily: 'var(--font-outfit)',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'var(--accent-hover)'
            btn.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'var(--accent)'
            btn.style.transform = 'translateY(0)'
          }}
        >
          Next Question
        </button>
      </div>
    </div>
  )
}
