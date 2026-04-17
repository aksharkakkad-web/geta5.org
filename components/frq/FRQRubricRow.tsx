'use client'

import React, { useState, useCallback } from 'react'
import { AdiIcon } from '@/components/adi/AdiMascot'
import type { FRQGradingPointResult } from '@/utils/frqSession'
import type { GradingStrictness } from '@/utils/frqSession'

interface FRQRubricRowProps {
  pointResult: FRQGradingPointResult
  strictness: GradingStrictness
  /** If provided, row is clickable and fires this callback */
  onScrollToEvidence?: (pointId: string) => void
  submissionId?: string
  /** Force expanded (e.g., missed points in strict mode) */
  forceExpanded?: boolean
}

type ThumbVote = 'up' | 'down' | null

export default function FRQRubricRow({
  pointResult,
  strictness,
  onScrollToEvidence,
  submissionId,
  forceExpanded = false,
}: FRQRubricRowProps) {
  const earned = pointResult.earned > 0
  const uncertain = !earned && pointResult.confidence < 0.7
  const defaultExpanded = forceExpanded || (!earned && strictness === 'strict')
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [thumbVote, setThumbVote] = useState<ThumbVote>(null)

  // Evidence quote: take first sub_result with a quote, or the first overall
  const evidenceQuote =
    pointResult.sub_results?.find(s => s.student_evidence_quote)?.student_evidence_quote ?? ''

  function handleThumb(vote: 'up' | 'down') {
    const nextVote = thumbVote === vote ? null : vote
    setThumbVote(nextVote)

    if (!submissionId || !nextVote) return
    // Fire-and-forget — never block UI
    fetch('/api/frq/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        pointId: pointResult.point_id,
        vote: nextVote,
      }),
    }).catch(() => {})
  }

  function handleRowClick() {
    if (onScrollToEvidence) {
      onScrollToEvidence(pointResult.point_id)
    }
    setExpanded(e => !e)
  }

  const accentColor = earned
    ? 'rgba(99,102,241,1)'
    : uncertain
    ? 'rgba(139,92,246,1)'
    : 'rgba(245,158,11,1)'

  const iconBg = earned
    ? 'rgba(99,102,241,0.10)'
    : uncertain
    ? 'rgba(139,92,246,0.08)'
    : 'rgba(245,158,11,0.08)'

  const iconBorder = earned
    ? '1px solid rgba(99,102,241,0.28)'
    : uncertain
    ? '1px solid rgba(139,92,246,0.28)'
    : '1px solid rgba(245,158,11,0.28)'

  const iconColor = earned
    ? '#818cf8'
    : uncertain
    ? '#a78bfa'
    : '#fbbf24'

  const badgeBg = earned
    ? 'rgba(99,102,241,0.10)'
    : uncertain
    ? 'rgba(139,92,246,0.08)'
    : 'rgba(245,158,11,0.08)'

  const badgeColor = earned ? '#818cf8' : uncertain ? '#a78bfa' : '#fbbf24'

  // Suggestion text adapts to strictness
  const suggestionText = useCallback(() => {
    if (!pointResult.suggestion) return null
    if (strictness === 'light') {
      return `Keep going! ${pointResult.suggestion}`
    }
    if (strictness === 'strict') {
      return pointResult.suggestion
    }
    return pointResult.suggestion
  }, [pointResult.suggestion, strictness])

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        borderLeft: `2px solid ${accentColor}`,
        transition: 'background 150ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent'
      }}
      onClick={handleRowClick}
    >
      {/* Header row */}
      <div
        style={{
          padding: '14px 20px 14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Status icon circle */}
        <div
          aria-hidden="true"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: iconBg,
            border: iconBorder,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {earned ? '✓' : '×'}
        </div>

        {/* Description + confidence */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.4,
              }}
            >
              {pointResult.description}
            </span>
            {/* Confidence badge — only if uncertain */}
            {uncertain && (
              <span
                title={`Confidence: ${Math.round(pointResult.confidence * 100)}%`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.28)',
                  color: '#a78bfa',
                  cursor: 'help',
                  flexShrink: 0,
                }}
              >
                ?
              </span>
            )}
          </div>
          {/* Evidence quote snippet in collapsed state */}
          {!expanded && evidenceQuote && (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '2px',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '240px',
                fontStyle: 'italic',
              }}
            >
              &ldquo;{evidenceQuote}&rdquo;
            </p>
          )}
        </div>

        {/* Thumbs */}
        <div
          style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={e => { e.stopPropagation(); handleThumb('up') }}
            title="Helpful"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              border: thumbVote === 'up'
                ? '1px solid rgba(99,102,241,0.4)'
                : '1px solid rgba(255,255,255,0.06)',
              background: thumbVote === 'up' ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: thumbVote === 'up' ? '#818cf8' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
              fontSize: '11px',
            }}
            onMouseEnter={e => {
              if (thumbVote !== 'up') {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.borderColor = 'rgba(99,102,241,0.3)'
                btn.style.color = '#818cf8'
              }
            }}
            onMouseLeave={e => {
              if (thumbVote !== 'up') {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.borderColor = 'rgba(255,255,255,0.06)'
                btn.style.color = 'var(--text-muted)'
              }
            }}
          >
            {/* Thumb up SVG */}
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M7 1L4 5H1v5h3l1 1h4.5L11 9V5H8L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleThumb('down') }}
            title="Not helpful"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              border: thumbVote === 'down'
                ? '1px solid rgba(245,158,11,0.4)'
                : '1px solid rgba(255,255,255,0.06)',
              background: thumbVote === 'down' ? 'rgba(245,158,11,0.10)' : 'transparent',
              color: thumbVote === 'down' ? '#fbbf24' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
              fontSize: '11px',
            }}
            onMouseEnter={e => {
              if (thumbVote !== 'down') {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.borderColor = 'rgba(245,158,11,0.3)'
                btn.style.color = '#fbbf24'
              }
            }}
            onMouseLeave={e => {
              if (thumbVote !== 'down') {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.borderColor = 'rgba(255,255,255,0.06)'
                btn.style.color = 'var(--text-muted)'
              }
            }}
          >
            {/* Thumb down SVG */}
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ transform: 'scaleY(-1)' }}>
              <path d="M7 1L4 5H1v5h3l1 1h4.5L11 9V5H8L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
        </div>

        {/* Score badge */}
        <span
          style={{
            background: badgeBg,
            color: badgeColor,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {pointResult.earned}/{pointResult.max}
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
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
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
      {expanded && (
        <div
          style={{
            padding: '0 20px 14px 50px',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Evidence quote */}
          {evidenceQuote && (
            <blockquote
              style={{
                fontSize: '0.8125rem',
                color: earned ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontStyle: 'italic',
                borderLeft: earned
                  ? '2px solid rgba(99,102,241,0.35)'
                  : '2px solid rgba(245,158,11,0.35)',
                paddingLeft: '12px',
                marginBottom: '10px',
                lineHeight: 1.6,
              }}
            >
              &ldquo;{evidenceQuote}&rdquo;
            </blockquote>
          )}

          {/* Reasoning */}
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              marginBottom: pointResult.suggestion && !earned ? '10px' : 0,
            }}
          >
            {pointResult.reasoning}
          </p>

          {/* Adi suggestion — only for missed points */}
          {!earned && pointResult.suggestion && (
            <div
              style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <AdiIcon size={20} />
              <p
                style={{
                  fontSize: strictness === 'strict' ? '0.875rem' : '0.8125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {suggestionText()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
