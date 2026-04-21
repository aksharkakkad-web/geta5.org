'use client'

import React from 'react'

interface FRQSourceLinksProps {
  pdfHref?: string | null
  scoringGuidelineHref?: string | null
  showScoringGuideline?: boolean
  align?: 'flex-start' | 'center' | 'flex-end'
}

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  textDecoration: 'none',
  padding: '4px 8px',
  borderRadius: 'var(--radius-sm, 6px)',
  transition: 'color 150ms ease, background 150ms ease',
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M4.5 2H10v5.5M10 2L5 7M2 4v6h6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PdfLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={linkStyle}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.color = 'var(--text-secondary)'
        el.style.background = 'color-mix(in srgb, var(--accent) 8%, transparent)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.color = 'var(--text-muted)'
        el.style.background = 'transparent'
      }}
    >
      {label}
      <ExternalIcon />
    </a>
  )
}

export default function FRQSourceLinks({
  pdfHref,
  scoringGuidelineHref,
  showScoringGuideline = false,
  align = 'flex-start',
}: FRQSourceLinksProps) {
  if (!pdfHref && !(showScoringGuideline && scoringGuidelineHref)) return null

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        alignItems: 'center',
        justifyContent: align,
      }}
    >
      {pdfHref && <PdfLink href={pdfHref} label="View original PDF" />}
      {showScoringGuideline && scoringGuidelineHref && (
        <PdfLink href={scoringGuidelineHref} label="View scoring guidelines" />
      )}
    </div>
  )
}
