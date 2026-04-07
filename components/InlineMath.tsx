'use client'

// components/InlineMath.tsx
// Renders text that may contain $...$ inline KaTeX expressions.
// Segments without $ are rendered as plain text; segments inside $...$ are
// rendered with KaTeX. Safe to pass any string — bad KaTeX falls back to the
// raw LaTeX source in muted colour.

import React from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface InlineMathProps {
  text: string
  className?: string
}

interface Segment {
  type: 'text' | 'math'
  content: string
}

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = []
  const parts = text.split('$')
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '') continue
    if (i % 2 === 0) {
      segments.push({ type: 'text', content: parts[i] })
    } else {
      segments.push({ type: 'math', content: parts[i] })
    }
  }
  return segments
}

function MathSegment({ formula }: { formula: string }) {
  let html: string | null = null
  try {
    html = katex.renderToString(formula, {
      displayMode: false,
      throwOnError: true,
      output: 'htmlAndMathml',
    })
  } catch {
    // Fallback: show raw LaTeX in muted colour
    return (
      <span
        style={{
          color: 'var(--text-muted)',
          fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
          fontSize: '0.9em',
        }}
      >
        ${formula}$
      </span>
    )
  }
  return (
    <span
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default function InlineMath({ text, className }: InlineMathProps) {
  const segments = parseSegments(text)
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === 'math' ? (
          <MathSegment key={i} formula={seg.content} />
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </span>
  )
}
