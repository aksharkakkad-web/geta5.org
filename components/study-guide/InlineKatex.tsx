'use client'
import React from 'react'
import KatexRenderer from '@/components/KatexRenderer'

interface Props {
  text: string
}

export default function InlineKatex({ text }: Props) {
  // Fast path: no $ means no KaTeX
  if (!text.includes('$')) {
    return <span>{text}</span>
  }

  // Split on $...$ delimiters
  const parts = text.split(/(\$[^$]+\$)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (/^\$[^$]+\$$/.test(part)) {
          const inner = part.slice(1, -1)
          return <KatexRenderer key={index} formula={inner} displayMode={false} />
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
