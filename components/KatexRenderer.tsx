// components/KatexRenderer.tsx
'use client'
import { useEffect, useRef } from 'react'
import React from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface Props {
  formula: string
  displayMode?: boolean // true = block, false = inline
  className?: string
}

export default function KatexRenderer({ formula, displayMode = false, className = '' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    try {
      katex.render(formula, ref.current, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      })
    } catch {
      if (ref.current) ref.current.textContent = formula
    }
  }, [formula, displayMode])

  // displayMode renders a block element — must use div to avoid invalid HTML (div inside span)
  if (displayMode) {
    return <div ref={ref as React.RefObject<HTMLDivElement>} className={className} />
  }
  return <span ref={ref as React.RefObject<HTMLSpanElement>} className={className} />
}
