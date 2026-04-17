'use client'

import React, { useState } from 'react'
import FRQRubricRow from '@/components/frq/FRQRubricRow'
import FRQEvidenceHighlight from '@/components/frq/FRQEvidenceHighlight'
import type { EvidenceSpan } from '@/components/frq/FRQEvidenceHighlight'
import type { FRQGradingResult, FRQGradingPart, GradingStrictness, FRQ } from '@/utils/frqSession'

interface FRQBreakdownPartsProps {
  question: FRQ
  result: FRQGradingResult
  responses: Record<string, string>
  strictness: GradingStrictness
  submissionId?: string
  scoreColor: string
  scoreGlow: string
  strokeDashoffset: number
  circumference: number
}

const STRICTNESS_LABEL: Record<GradingStrictness, string> = {
  light: 'Light Grading',
  moderate: 'Moderate Grading',
  strict: 'Strict Grading',
}

function getPartBorderColor(earned: number, max: number): string {
  if (earned === max) return 'rgba(99,102,241,0.28)'
  if (earned === 0) return 'rgba(245,158,11,0.28)'
  return 'rgba(245,158,11,0.2)'
}

function getPartBg(earned: number, max: number): string {
  if (earned === max) return 'rgba(99,102,241,0.04)'
  if (earned === 0) return 'rgba(245,158,11,0.04)'
  return 'rgba(245,158,11,0.03)'
}

function getPartAccentBar(earned: number, max: number): string {
  if (earned === max) return 'rgba(99,102,241,1)'
  return 'rgba(245,158,11,1)'
}

function PartCard({
  part,
  response,
  strictness,
  submissionId,
  isMathPart,
}: {
  part: FRQGradingPart
  response: string
  strictness: GradingStrictness
  submissionId?: string
  isMathPart?: boolean
}) {
  const fullCredit = part.earned === part.max
  // Auto-expand missed parts; in strict mode expand everything
  const defaultOpen = !fullCredit || strictness === 'strict'
  const [open, setOpen] = useState(defaultOpen)

  const hasPointResults = (part.point_results?.length ?? 0) > 0

  // Build evidence spans from point results
  const evidenceSpans: EvidenceSpan[] = (part.point_results ?? []).flatMap(pr =>
    (pr.sub_results ?? [])
      .filter(s => s.student_evidence_quote)
      .map(s => ({
        quote: s.student_evidence_quote,
        earned: pr.earned > 0,
        pointId: pr.point_id,
      }))
  )

  const headerBg = getPartBg(part.earned, part.max)
  const borderColor = getPartBorderColor(part.earned, part.max)
  const accentBarColor = getPartAccentBar(part.earned, part.max)
  const scoreColor = fullCredit ? '#818cf8' : '#fbbf24'
  const scoreBg = fullCredit ? 'rgba(99,102,241,0.10)' : 'rgba(245,158,11,0.08)'

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${accentBarColor}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Card header — always visible */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: headerBg,
          cursor: 'pointer',
          transition: 'background 150ms ease',
        }}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.background = fullCredit
            ? 'rgba(99,102,241,0.08)'
            : 'rgba(245,158,11,0.08)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.background = headerBg
        }}
      >
        {/* Part letter circle */}
        <div
          aria-hidden="true"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: scoreBg,
            color: scoreColor,
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: 'var(--font-outfit)',
          }}
        >
          {part.letter.toUpperCase()}
        </div>

        <span
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            flex: 1,
            fontFamily: 'var(--font-outfit)',
          }}
        >
          Part {part.letter.toUpperCase()}
        </span>

        {/* Math sub-point pills */}
        {isMathPart && hasPointResults && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {(part.point_results ?? []).slice(0, 3).map((pr, i) => (
              <span
                key={pr.point_id}
                title={pr.description}
                style={{
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  background: pr.earned > 0 ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.10)',
                  color: pr.earned > 0 ? '#818cf8' : '#fbbf24',
                  border: pr.earned > 0 ? '1px solid rgba(99,102,241,0.22)' : '1px solid rgba(245,158,11,0.22)',
                }}
              >
                P{i + 1}
              </span>
            ))}
          </div>
        )}

        {/* Score badge */}
        <span
          style={{
            background: scoreBg,
            color: scoreColor,
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {part.earned}/{part.max}
        </span>

        {/* Chevron */}
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            color: 'var(--text-muted)',
            transition: 'transform 200ms ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Student response with highlights */}
          {response && (
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
              }}
            >
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '10px',
                }}
              >
                Your Response
              </p>
              <div
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.75,
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-outfit), sans-serif',
                }}
              >
                {evidenceSpans.length > 0 ? (
                  <FRQEvidenceHighlight text={response} evidence={evidenceSpans} />
                ) : (
                  <span>{response}</span>
                )}
              </div>
            </div>
          )}

          {/* Rubric point results */}
          {hasPointResults ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  padding: '10px 16px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  margin: 0,
                }}
              >
                Rubric Points
              </p>
              {(part.point_results ?? []).map(pr => (
                <FRQRubricRow
                  key={pr.point_id}
                  pointResult={pr}
                  strictness={strictness}
                  submissionId={submissionId}
                  forceExpanded={!pr.earned && strictness === 'strict'}
                />
              ))}
            </div>
          ) : (
            /* Fallback feedback when no point_results */
            <div>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {part.feedback}
              </p>
              {part.missed && (
                <div
                  style={{
                    marginTop: '8px',
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
          )}
        </div>
      )}
    </div>
  )
}

export default function FRQBreakdownParts({
  question,
  result,
  responses,
  strictness,
  submissionId,
  scoreColor,
  scoreGlow,
  strokeDashoffset,
  circumference,
}: FRQBreakdownPartsProps) {
  const isMath = question.frq_type === 'multi_part_math'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Score summary card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 100% at 0% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Score ring */}
        <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0 }}>
          <svg
            width="96"
            height="96"
            viewBox="0 0 128 128"
            style={{
              transform: 'rotate(-90deg)',
              display: 'block',
              filter: scoreGlow,
            }}
            aria-hidden="true"
          >
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="9"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke={scoreColor}
              strokeWidth="9"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 800ms ease' }}
            />
          </svg>
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
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-outfit)',
              }}
            >
              {result.total_score}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              /{result.max_score}
            </span>
          </div>
        </div>

        {/* Score info */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              margin: 0,
              fontFamily: 'var(--font-outfit)',
            }}
          >
            {result.total_score} / {result.max_score}{' '}
            <span style={{ color: 'var(--accent-hover)' }}>pts</span>
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px', margin: '6px 0 0' }}>
            {question.title}
          </p>
          {/* Mini rubric pills — earned/missed summary */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {result.parts.map(part => {
              const earnedFull = part.earned === part.max
              return (
                <span
                  key={part.letter}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: earnedFull ? 'rgba(99,102,241,0.10)' : 'rgba(245,158,11,0.08)',
                    color: earnedFull ? '#818cf8' : '#fbbf24',
                    border: earnedFull ? '1px solid rgba(99,102,241,0.28)' : '1px solid rgba(245,158,11,0.28)',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'currentColor',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  Part {part.letter.toUpperCase()} · {part.earned}/{part.max}
                </span>
              )
            })}
          </div>
          <div style={{ marginTop: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(99,102,241,0.12)',
                color: 'var(--accent-hover)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {STRICTNESS_LABEL[strictness]}
            </span>
          </div>
        </div>
      </div>

      {/* Per-part expandable cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {result.parts.map(part => (
          <PartCard
            key={part.letter}
            part={part}
            response={responses[part.letter] ?? ''}
            strictness={strictness}
            submissionId={submissionId}
            isMathPart={isMath}
          />
        ))}
      </div>
    </div>
  )
}
