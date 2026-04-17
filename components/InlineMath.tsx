'use client'

// components/InlineMath.tsx
// Renders text that may contain $...$ inline and $$...$$ display KaTeX.
// Scans left-to-right: $$ is checked before $ to avoid double-counting.
// Bad KaTeX falls back to the raw source in muted monospace.

import React from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface InlineMathProps {
  text: string
  className?: string
}

interface Segment {
  type: 'text' | 'math' | 'display'
  content: string
}

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = []
  let pos = 0

  while (pos < text.length) {
    // Display math: $$...$$
    if (text[pos] === '$' && text[pos + 1] === '$') {
      const end = text.indexOf('$$', pos + 2)
      if (end !== -1) {
        segments.push({ type: 'display', content: text.slice(pos + 2, end) })
        pos = end + 2
      } else {
        segments.push({ type: 'text', content: text.slice(pos) })
        break
      }
    }
    // Inline math: $...$
    else if (text[pos] === '$') {
      const end = text.indexOf('$', pos + 1)
      if (end !== -1) {
        segments.push({ type: 'math', content: text.slice(pos + 1, end) })
        pos = end + 1
      } else {
        segments.push({ type: 'text', content: text.slice(pos) })
        break
      }
    }
    // Plain text up to the next $
    else {
      const next = text.indexOf('$', pos)
      if (next !== -1) {
        segments.push({ type: 'text', content: text.slice(pos, next) })
        pos = next
      } else {
        segments.push({ type: 'text', content: text.slice(pos) })
        break
      }
    }
  }

  return segments
}

function MathSegment({ formula, display }: { formula: string; display?: boolean }) {
  let html: string | null = null
  try {
    html = katex.renderToString(formula, {
      displayMode: display ?? false,
      throwOnError: true,
      output: 'htmlAndMathml',
    })
  } catch {
    const delim = display ? '$$' : '$'
    return (
      <span
        style={{
          color: 'var(--text-muted)',
          fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
          fontSize: '0.9em',
        }}
      >
        {delim}{formula}{delim}
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
      {segments.map((seg, i) => {
        if (seg.type === 'display') {
          return (
            <span
              key={i}
              style={{ display: 'block', textAlign: 'center', margin: '8px 0' }}
            >
              <MathSegment formula={seg.content} display />
            </span>
          )
        }
        if (seg.type === 'math') {
          return <MathSegment key={i} formula={seg.content} />
        }
        return <span key={i}>{seg.content}</span>
      })}
    </span>
  )
}
