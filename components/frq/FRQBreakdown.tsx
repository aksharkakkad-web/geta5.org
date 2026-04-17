'use client'

import React from 'react'
import { AdiIcon } from '@/components/adi/AdiMascot'
import FRQBreakdownEssay from '@/components/frq/FRQBreakdownEssay'
import FRQBreakdownParts from '@/components/frq/FRQBreakdownParts'
import type {
  FRQ,
  FRQGradingResult,
  GradingStrictness,
  FRQPart,
} from '@/utils/frqSession'
import { isEssayType } from '@/utils/frqSession'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FRQBreakdownProps {
  question: FRQ
  result: FRQGradingResult
  responses: Record<string, string>
  strictness: GradingStrictness
  submissionId?: string
  drawingParts?: FRQPart[]
  onAskAdi: () => void
  onNextQuestion: () => void
  onRetry: () => void
}

// ─── Score ring helpers ───────────────────────────────────────────────────────

// r=54, circumference = 2π×54 ≈ 339.29
const CIRCUMFERENCE = 2 * Math.PI * 54

function getScoreColor(pct: number): string {
  if (pct >= 70) return 'var(--accent)'
  if (pct >= 40) return 'var(--accent-warning)'
  return 'var(--accent-danger)'
}

function getScoreGlow(pct: number): string {
  if (pct >= 70) return 'drop-shadow(0 0 12px rgba(99,102,241,0.45))'
  if (pct >= 40) return 'drop-shadow(0 0 12px rgba(245,158,11,0.45))'
  return 'drop-shadow(0 0 12px rgba(239,68,68,0.45))'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FRQBreakdown({
  question,
  result,
  responses,
  strictness,
  submissionId,
  drawingParts = [],
  onAskAdi,
  onNextQuestion,
  onRetry,
}: FRQBreakdownProps) {
  const pct = result.max_score > 0 ? (result.total_score / result.max_score) * 100 : 0
  const scoreColor = getScoreColor(pct)
  const scoreGlow = getScoreGlow(pct)
  const strokeDashoffset = CIRCUMFERENCE * (1 - pct / 100)

  const essayMode = isEssayType(question.frq_type)

  // For essay types, collect all responses into one essay text
  const essayText: string = (() => {
    if (essayMode) {
      // Essay types: single response keyed by the first/only part letter, or 'essay'
      const firstPartLetter = question.parts[0]?.letter ?? 'essay'
      return responses[firstPartLetter] ?? responses['essay'] ?? Object.values(responses)[0] ?? ''
    }
    return ''
  })()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        // Allow full-width layout for essay split-panel
        maxWidth: essayMode ? '100%' : undefined,
      }}
    >
      {/* ── Main breakdown layout ── */}
      {essayMode ? (
        <FRQBreakdownEssay
          question={question}
          result={result}
          essayText={essayText}
          strictness={strictness}
          submissionId={submissionId}
          scoreColor={scoreColor}
          scoreGlow={scoreGlow}
          strokeDashoffset={strokeDashoffset}
          circumference={CIRCUMFERENCE}
        />
      ) : (
        <FRQBreakdownParts
          question={question}
          result={result}
          responses={responses}
          strictness={strictness}
          submissionId={submissionId}
          scoreColor={scoreColor}
          scoreGlow={scoreGlow}
          strokeDashoffset={strokeDashoffset}
          circumference={CIRCUMFERENCE}
        />
      )}

      {/* ── Self-assessed drawing parts ── */}
      {drawingParts.length > 0 && (
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {drawingParts.map(dp => (
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
                    fontFamily: 'var(--font-outfit)',
                  }}
                >
                  {dp.letter.toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    flex: 1,
                  }}
                >
                  Part {dp.letter.toUpperCase()}
                </span>
                <span
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    color: 'var(--accent-hover)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    fontStyle: 'italic',
                  }}
                >
                  Self-assessed
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  paddingLeft: '38px',
                  margin: '8px 0 0',
                  fontStyle: 'italic',
                }}
              >
                This part requires sketching — compare your drawing with the reference answer shown
                during practice.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Adi Takeaway ── */}
      <div
        style={{
          maxWidth: essayMode ? '720px' : undefined,
          margin: essayMode ? '0 auto' : undefined,
          width: essayMode ? '100%' : undefined,
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            boxShadow: '0 0 20px rgba(99,102,241,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient gradient */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 80% 100% at 0% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
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
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: 'var(--accent-hover)',
              }}
            >
              Adi&apos;s Takeaway
            </span>
          </div>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {result.takeaway}
          </p>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div
        style={{
          maxWidth: essayMode ? '720px' : undefined,
          margin: essayMode ? '0 auto' : undefined,
          width: essayMode ? '100%' : undefined,
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          paddingBottom: '32px',
        }}
      >
        {/* Ask Adi */}
        <button
          onClick={onAskAdi}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            fontFamily: 'var(--font-outfit)',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'rgba(99,102,241,0.4)'
            btn.style.color = 'var(--text-primary)'
            btn.style.background = 'rgba(99,102,241,0.06)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'rgba(255,255,255,0.08)'
            btn.style.color = 'var(--text-secondary)'
            btn.style.background = 'transparent'
          }}
        >
          Ask Adi to Explain
        </button>

        {/* Try Again */}
        <button
          onClick={onRetry}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            fontFamily: 'var(--font-outfit)',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'rgba(99,102,241,0.4)'
            btn.style.color = 'var(--text-primary)'
            btn.style.background = 'rgba(99,102,241,0.06)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'rgba(255,255,255,0.08)'
            btn.style.color = 'var(--text-secondary)'
            btn.style.background = 'transparent'
          }}
        >
          Try Again
        </button>

        {/* Next Question — primary */}
        <button
          onClick={onNextQuestion}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
            fontFamily: 'var(--font-outfit)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'var(--accent-hover)'
            btn.style.transform = 'translateY(-1px)'
            btn.style.boxShadow = '0 6px 20px rgba(99,102,241,0.35)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'var(--accent)'
            btn.style.transform = 'translateY(0)'
            btn.style.boxShadow = '0 4px 16px rgba(99,102,241,0.25)'
          }}
        >
          Next Question
        </button>
      </div>
    </div>
  )
}
