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

// Build a normalized version of a string + a mapping back to original positions.
// Strips markdown emphasis and quote characters and lowercases — the same
// transforms verifyEvidence applies on the server, so what the server treats
// as a match also gets a visible highlight here.
function normalizeWithPositions(s: string): { normalized: string; positions: number[] } {
  let normalized = ''
  const positions: number[] = []
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    // Skip markdown emphasis chars: * _ `
    if (ch === '*' || ch === '_' || ch === '`') continue
    // Skip ASCII and curly quote chars (single + double)
    const code = ch.charCodeAt(0)
    if (
      code === 0x27 || code === 0x22 ||                         // ' "
      (code >= 0x2018 && code <= 0x201F) ||                     // ‘ ’ ‚ ‛ “ ” „ ‟
      code === 0x2032 || code === 0x2033                        // ′ ″
    ) continue
    normalized += ch.toLowerCase()
    positions.push(i)
  }
  return { normalized, positions }
}

// Locate `quote` inside `text` allowing markdown/quote-char drift between them.
// Returns positions in the ORIGINAL text. Returns null if no fuzzy match exists.
function findFuzzyQuotePosition(text: string, quote: string): { start: number; end: number } | null {
  if (!quote) return null
  const exactIdx = text.indexOf(quote)
  if (exactIdx !== -1) return { start: exactIdx, end: exactIdx + quote.length }

  const { normalized: nText, positions: pText } = normalizeWithPositions(text)
  const { normalized: nQuote } = normalizeWithPositions(quote)
  if (!nQuote) return null

  const idx = nText.indexOf(nQuote)
  if (idx === -1) return null

  const lastIdx = idx + nQuote.length - 1
  return { start: pText[idx], end: pText[lastIdx] + 1 }
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

  // Resolve each evidence quote to a fuzzy-matched position in the original
  // text. Quotes that don't fuzzy-match are dropped (as before).
  const located = evidence
    .map(ev => {
      if (!ev.quote) return null
      const pos = findFuzzyQuotePosition(text, ev.quote)
      if (!pos) return null
      return { start: pos.start, end: pos.end, ev }
    })
    .filter((x): x is { start: number; end: number; ev: EvidenceSpan } => x !== null)

  if (located.length === 0) {
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
  const hits = located.slice()
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
