'use client'

import React from 'react'

export interface EvidenceSpan {
  quote: string
  earned: boolean
  pointId: string
}

interface FRQEvidenceHighlightProps {
  text: string
  evidence: EvidenceSpan[]
  onSpanClick?: (pointId: string) => void
}

/**
 * Splits the student response text into plain segments and highlighted segments.
 * Earned quotes: indigo underline. Missed quotes: amber dashed underline.
 * Non-overlapping, first-match wins.
 */
export default function FRQEvidenceHighlight({
  text,
  evidence,
  onSpanClick,
}: FRQEvidenceHighlightProps) {
  if (!text) return null

  // Filter to non-empty quotes that actually appear in the text
  const valid = evidence.filter(e => e.quote && text.includes(e.quote))

  if (valid.length === 0) {
    return (
      <span style={{ fontSize: '0.9375rem', lineHeight: 1.85, color: 'var(--text-secondary)' }}>
        {text}
      </span>
    )
  }

  // Build segment list by greedily marking earliest matches first
  type Segment =
    | { type: 'text'; content: string }
    | { type: 'highlight'; content: string; earned: boolean; pointId: string }

  const segments: Segment[] = []

  // Build a list of (start, end, evidence) sorted by position
  const hits: { start: number; end: number; ev: EvidenceSpan }[] = []
  for (const ev of valid) {
    const idx = text.indexOf(ev.quote)
    if (idx !== -1) {
      hits.push({ start: idx, end: idx + ev.quote.length, ev })
    }
  }
  // Sort by start position, resolve overlaps by taking earliest
  hits.sort((a, b) => a.start - b.start)

  // Remove overlapping spans — keep earlier ones
  const resolved: typeof hits = []
  let cursor = 0
  for (const h of hits) {
    if (h.start >= cursor) {
      resolved.push(h)
      cursor = h.end
    }
  }

  // Build segments from original text using resolved hits
  let pos = 0
  for (const h of resolved) {
    if (h.start > pos) {
      segments.push({ type: 'text', content: text.slice(pos, h.start) })
    }
    segments.push({ type: 'highlight', content: text.slice(h.start, h.end), earned: h.ev.earned, pointId: h.ev.pointId })
    pos = h.end
  }
  if (pos < text.length) {
    segments.push({ type: 'text', content: text.slice(pos) })
  }

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return (
            <span
              key={i}
              style={{ fontSize: '0.9375rem', lineHeight: 1.85, color: 'var(--text-secondary)' }}
            >
              {seg.content}
            </span>
          )
        }
        const earnedStyle: React.CSSProperties = {
          background: 'rgba(99,102,241,0.08)',
          borderBottom: '2px solid rgba(99,102,241,0.4)',
          borderRadius: '2px',
          padding: '0 2px',
          color: 'var(--text-primary)',
          cursor: onSpanClick ? 'pointer' : 'default',
          transition: 'background 150ms ease',
          fontSize: '0.9375rem',
          lineHeight: 1.85,
        }
        const missedStyle: React.CSSProperties = {
          background: 'rgba(245,158,11,0.08)',
          borderBottom: '2px dashed rgba(245,158,11,0.4)',
          borderRadius: '2px',
          padding: '0 2px',
          color: 'var(--text-primary)',
          cursor: onSpanClick ? 'pointer' : 'default',
          transition: 'background 150ms ease',
          fontSize: '0.9375rem',
          lineHeight: 1.85,
        }
        return (
          <span
            key={i}
            style={seg.earned ? earnedStyle : missedStyle}
            title={seg.earned ? 'Earned point' : 'Missed point'}
            onClick={() => onSpanClick?.(seg.pointId)}
            onMouseEnter={e => {
              if (!onSpanClick) return
              const el = e.currentTarget as HTMLSpanElement
              el.style.background = seg.earned
                ? 'rgba(99,102,241,0.18)'
                : 'rgba(245,158,11,0.15)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLSpanElement
              el.style.background = seg.earned
                ? 'rgba(99,102,241,0.08)'
                : 'rgba(245,158,11,0.08)'
            }}
          >
            {seg.content}
          </span>
        )
      })}
    </>
  )
}
