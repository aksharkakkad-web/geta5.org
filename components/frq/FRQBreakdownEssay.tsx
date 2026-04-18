'use client'

import React, { useCallback, useRef } from 'react'
import FRQRubricRow from '@/components/frq/FRQRubricRow'
import FRQEvidenceHighlight from '@/components/frq/FRQEvidenceHighlight'
import type { EvidenceSpan } from '@/components/frq/FRQEvidenceHighlight'
import type { FRQGradingResult, FRQGradingPart, FRQGradingPointResult, GradingStrictness, FRQ } from '@/utils/frqSession'

interface FRQBreakdownEssayProps {
  question: FRQ
  result: FRQGradingResult
  essayText: string
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

export default function FRQBreakdownEssay({
  question,
  result,
  essayText,
  strictness,
  submissionId,
  scoreColor,
  scoreGlow,
  strokeDashoffset,
  circumference,
}: FRQBreakdownEssayProps) {
  const essayRef = useRef<HTMLDivElement>(null)

  // Collect all point_results across all parts into a flat list
  const allPointResults: FRQGradingPointResult[] = result.parts.flatMap(
    part => part.point_results ?? []
  )

  // Build evidence spans for the essay highlighting
  const evidenceSpans: EvidenceSpan[] = allPointResults.flatMap(pr =>
    (pr.sub_results ?? [])
      .filter(s => s.student_evidence_quote)
      .map(s => ({
        quote: s.student_evidence_quote,
        earned: pr.earned > 0,
        pointId: pr.point_id,
      }))
  )

  // Scroll essay to the matched evidence when a rubric row is clicked
  const handleScrollToEvidence = useCallback((pointId: string) => {
    const pr = allPointResults.find(p => p.point_id === pointId)
    if (!pr) return
    const quote = pr.sub_results?.find(s => s.student_evidence_quote)?.student_evidence_quote
    if (!quote || !essayRef.current) return
    // Find highlighted span by data attribute
    const spans = essayRef.current.querySelectorAll<HTMLSpanElement>(`[data-point-id="${pointId}"]`)
    if (spans.length > 0) {
      spans[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
      spans[0].style.transition = 'background 150ms ease'
      const origBg = pr.earned > 0 ? 'rgba(99,102,241,0.08)' : 'rgba(245,158,11,0.08)'
      const flashBg = pr.earned > 0 ? 'rgba(99,102,241,0.28)' : 'rgba(245,158,11,0.22)'
      spans[0].style.background = flashBg
      setTimeout(() => {
        if (spans[0]) spans[0].style.background = origBg
      }, 700)
    }
  }, [allPointResults])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      {/* ── Essay panel (left) ── */}
      <div
        ref={essayRef}
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maxHeight: 'calc(100dvh - 200px)',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--bg-border) transparent',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            marginBottom: '20px',
          }}
        >
          Student Response · {question.title}
        </p>
        <div
          style={{
            fontSize: '0.9375rem',
            lineHeight: 1.85,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-outfit), sans-serif',
          }}
        >
          {essayText.split('\n\n').map((para, i) => (
            <p key={i} style={{ marginBottom: '18px' }}>
              <FRQEvidenceHighlight
                text={para}
                evidence={evidenceSpans}
                onSpanClick={handleScrollToEvidence}
              />
            </p>
          ))}
        </div>
      </div>

      {/* ── Sidebar panel (right, sticky) ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 'var(--radius-xl)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflow: 'hidden',
          maxHeight: 'calc(100dvh - 200px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: '80px',
        }}
      >
        {/* Score header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexShrink: 0,
            background: 'rgba(99,102,241,0.04)',
          }}
        >
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
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                margin: 0,
                fontFamily: 'var(--font-outfit)',
              }}
            >
              {question.frq_type === 'dbq' ? 'DBQ' :
               question.frq_type === 'leq' ? 'LEQ' :
               question.frq_type === 'essay' ? 'Essay' : 'Argument Essay'} Score
            </p>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                margin: '4px 0 0',
              }}
            >
              {question.year ? `${question.year}` : 'Practice'}
            </p>
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
                marginTop: '8px',
              }}
            >
              {STRICTNESS_LABEL[strictness]}
            </span>
          </div>
        </div>

        {/* Rubric list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--bg-border) transparent',
          }}
        >
          {allPointResults.length > 0 ? (
            result.parts.map(part => {
              const partPointResults = part.point_results ?? []
              // Single-row part: render FRQRubricRow directly (unchanged behavior)
              if (partPointResults.length === 1) {
                const pr = partPointResults[0]
                return (
                  <FRQRubricRow
                    key={part.letter}
                    pointResult={pr}
                    strictness={strictness}
                    onScrollToEvidence={handleScrollToEvidence}
                    submissionId={submissionId}
                    forceExpanded={!pr.earned && strictness === 'strict'}
                  />
                )
              }
              // No point_results for this part (rare — shouldn't happen after sanitizer)
              if (partPointResults.length === 0) return null
              // Multi-tier part: render Part header + nested sub-rows
              return (
                <TieredPartGroup
                  key={part.letter}
                  part={part}
                  strictness={strictness}
                  onScrollToEvidence={handleScrollToEvidence}
                  submissionId={submissionId}
                />
              )
            })
          ) : (
            // Fallback: show per-part summary rows when no point_results
            result.parts.map(part => {
              const partEarned = part.earned === part.max
              const iconColor = partEarned ? '#818cf8' : '#fbbf24'
              const iconBg = partEarned ? 'rgba(99,102,241,0.10)' : 'rgba(245,158,11,0.08)'
              const iconBorder = partEarned ? '1px solid rgba(99,102,241,0.28)' : '1px solid rgba(245,158,11,0.28)'
              return (
                <div
                  key={part.letter}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: `2px solid ${partEarned ? 'rgba(99,102,241,1)' : 'rgba(245,158,11,1)'}`,
                    padding: '14px 20px 14px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: iconBg, border: iconBorder, color: iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
                    }}
                  >
                    {partEarned ? '✓' : '×'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                      Part {part.letter.toUpperCase()} — {part.feedback}
                    </p>
                    {part.missed && (
                      <p style={{ fontSize: '0.8125rem', color: '#fbbf24', marginTop: '4px', lineHeight: 1.5 }}>
                        {part.missed}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      background: iconBg, color: iconColor,
                      padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
                    }}
                  >
                    {part.earned}/{part.max}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tiered Part Group ───────────────────────────────────────────────────────
// Used for rubric parts with multiple scoring_points (e.g., Arg Essay Row B
// with b1/b2/b3, SCOTUS Comparison Part B, AP Psych EBQ B(ii)/C(ii), AAQ F).
// Renders a Part header + indented sub-rows showing each tier's scoring.

interface TieredPartGroupProps {
  part: FRQGradingPart
  strictness: GradingStrictness
  onScrollToEvidence: (pointId: string) => void
  submissionId?: string
}

function TieredPartGroup({
  part,
  strictness,
  onScrollToEvidence,
  submissionId,
}: TieredPartGroupProps) {
  const pointResults = part.point_results ?? []
  const fullyEarned = part.earned === part.max
  const noneEarned = part.earned === 0

  // Part-level accent: green if all tiers met, amber if some, red if none
  const accentColor = fullyEarned
    ? 'rgba(99,102,241,1)'
    : noneEarned
    ? 'rgba(245,158,11,1)'
    : 'rgba(139,92,246,1)' // partial = purple

  const badgeBg = fullyEarned
    ? 'rgba(99,102,241,0.12)'
    : noneEarned
    ? 'rgba(245,158,11,0.10)'
    : 'rgba(139,92,246,0.10)'

  const badgeColor = fullyEarned ? '#818cf8' : noneEarned ? '#fbbf24' : '#a78bfa'

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        borderLeft: `2px solid ${accentColor}`,
      }}
    >
      {/* Part header row */}
      <div
        style={{
          padding: '12px 20px 12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
        }}
      >
        {/* Part letter badge */}
        <div
          aria-hidden="true"
          style={{
            width: '22px',
            height: '22px',
            borderRadius: 'var(--radius-sm)',
            background: badgeBg,
            color: badgeColor,
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
            flex: 1,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.01em',
          }}
        >
          Part {part.letter.toUpperCase()} — Tiered Scoring
        </span>

        {/* Aggregate score badge */}
        <span
          style={{
            background: badgeBg,
            color: badgeColor,
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {part.earned}/{part.max}
        </span>
      </div>

      {/* Tier sub-rows — rendered with left indentation to visually nest */}
      <div style={{ paddingLeft: '16px' }}>
        {pointResults.map(pr => (
          <FRQRubricRow
            key={pr.point_id}
            pointResult={pr}
            strictness={strictness}
            onScrollToEvidence={onScrollToEvidence}
            submissionId={submissionId}
            forceExpanded={!pr.earned && strictness === 'strict'}
          />
        ))}
      </div>
    </div>
  )
}
