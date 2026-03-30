'use client'
import { useInView } from '@/hooks/useInView'
import type { CSSProperties, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  style?: CSSProperties
  className?: string
}

export function ScrollReveal({ children, delay = 0, style, className }: ScrollRevealProps) {
  const { ref, inView } = useInView()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
