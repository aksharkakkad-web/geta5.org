import React from 'react'

/**
 * Parses a string containing $...$ delimited KaTeX expressions
 * and returns an array of React elements (spans and KatexRenderer components).
 * Used in DrillCard, MCQCard, and BrowseView for inline math rendering.
 */
export function parseInlineMath(text: string): React.ReactNode {
  if (!text.includes('$')) {
    return text
  }

  const parts = text.split(/(\$[^$]+\$)/g)

  return parts.map((part, index) => {
    if (/^\$[^$]+\$$/.test(part)) {
      const inner = part.slice(1, -1)
      // Lazy import to avoid circular deps — rendered client-side only
      const KatexRenderer = require('@/components/KatexRenderer').default
      return React.createElement(KatexRenderer, { key: index, formula: inner, displayMode: false })
    }
    return React.createElement('span', { key: index }, part)
  })
}
