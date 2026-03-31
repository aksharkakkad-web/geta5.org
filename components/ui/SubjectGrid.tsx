'use client'
import { useRef, useState, useEffect, Component, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { SubjectCard } from './SubjectCard'

interface SubjectGridProps {
  subjects: { name: string; slug: string }[]
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    return this.state.hasError ? null : this.props.children
  }
}

export function SubjectGrid({ subjects }: SubjectGridProps) {
  const containerRef = useRef<HTMLDivElement>(null!)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        className="subject-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginTop: '24px',
        }}
      >
        {subjects.map((subject, i) => (
          <SubjectCard key={subject.slug} name={subject.name} slug={subject.slug} index={i} />
        ))}
      </div>
      {mounted && (
        <CanvasErrorBoundary>
          <Canvas
            eventSource={containerRef}
            eventPrefix="client"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 5,
            }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          >
            <View.Port />
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  )
}
