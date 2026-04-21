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
  gap: '7px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--accent)',
  textDecoration: 'none',
  padding: '6px 12px',
  borderRadius: '999px',
  background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
  border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
  transition: 'background 150ms ease, border-color 150ms ease, transform 150ms ease',
  fontFamily: 'var(--font-outfit)',
}

function PdfDocIcon() {
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M8.5 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5L8.5 1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 1v3.5H12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      style={{ flexShrink: 0, opacity: 0.75 }}
    >
      <path
        d="M4.5 2H10v5.5M10 2L5 7M2 4v6h6"
        stroke="currentColor"
        strokeWidth="1.5"
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
        el.style.background = 'color-mix(in srgb, var(--accent) 22%, transparent)'
        el.style.borderColor = 'color-mix(in srgb, var(--accent) 55%, transparent)'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'color-mix(in srgb, var(--accent) 12%, transparent)'
        el.style.borderColor = 'color-mix(in srgb, var(--accent) 30%, transparent)'
        el.style.transform = 'translateY(0)'
      }}
    >
      <PdfDocIcon />
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
