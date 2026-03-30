'use client'
import { useCallback, useRef, type CSSProperties, type ReactNode } from 'react'

interface CursorGlowProps {
  children: ReactNode
  color?: string
  size?: number
  style?: CSSProperties
  className?: string
}

export function CursorGlow({
  children,
  color = 'rgba(99,102,241,0.08)',
  size = 200,
  style,
  className,
}: CursorGlowProps) {
  const glowRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    glowRef.current.style.top = `${e.clientY - rect.top}px`
    glowRef.current.style.left = `${e.clientX - rect.left}px`
    glowRef.current.style.opacity = '1'
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = '0'
  }, [])

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.3s',
        }}
      />
    </div>
  )
}
