'use client'
import React from 'react'
import KatexRenderer from '@/components/KatexRenderer'

interface Props {
  text: string
}

export default function InlineKatex({ text }: Props) {
  // Fast path: no $ and no LaTeX commands means plain text
  if (!text.includes('$')) {
    // Raw LaTeX without delimiters (e.g. drill card answers like \lim_{x \to c} f(x) = L)
    if (/\\[a-zA-Z]/.test(text)) {
      return <KatexRenderer formula={text} displayMode={false} />
    }
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
