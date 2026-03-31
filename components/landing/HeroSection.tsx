'use client'
import { AmbientBlobs } from '@/components/ui/AmbientBlobs'

const SPARK_COLORS = ['#6366f1', '#a78bfa', '#818cf8', '#22c55e']

function randomBetween(min: number, max: number) {
  return min + (max - min) * Math.random()
}

export function HeroSection() {
  // Pre-compute particle positions deterministically by index for SSR safety
  const particles = Array.from({ length: 10 }, (_, i) => ({
    size: 2 + (i % 3),
    color: SPARK_COLORS[i % SPARK_COLORS.length],
    top: `${35 + (i * 7) % 25}%`,
    left: `${5 + (i * 11) % 35}%`,
    driftX: ((i % 2 === 0 ? -1 : 1) * (30 + (i * 13) % 50)),
    driftY: -(30 + (i * 7) % 40),
    duration: 1.3 + (i % 4) * 0.1,
    delay: 1.55 + i * 0.03,
  }))

  return (
    <div style={{ paddingTop: '80px', paddingBottom: '16px', position: 'relative', overflow: 'hidden' }}>
      <AmbientBlobs />

      {/* Hero text — staggered word reveal */}
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1.2,
        position: 'relative',
        zIndex: 2,
        overflow: 'hidden',
      }}>
        {/* "AP exam prep." — deblur and rise first */}
        {['AP', 'exam', 'prep.'].map((word, i) => (
          <span
            key={word}
            style={{
              display: 'inline-block',
              marginRight: '0.35em',
              opacity: 0,
              animation: `revealUp 0.7s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.15}s forwards`,
              color: 'var(--text-primary)',
            }}
          >
            {word}
          </span>
        ))}
        {/* "100% free." — lands with punch after pause */}
        {['100%', 'free.'].map((word, i) => (
          <span
            key={word}
            style={{
              display: 'inline-block',
              marginRight: i === 0 ? '0.35em' : undefined,
              opacity: 0,
              animation: `revealPunch 0.65s cubic-bezier(0.16,1,0.3,1) ${1.1 + i * 0.15}s forwards`,
              background: 'linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {word}
          </span>
        ))}
      </h1>

      {/* Celebratory particles — gentle upward drift */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '200px', pointerEvents: 'none', zIndex: 3 }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: p.color,
              top: p.top,
              left: p.left,
              opacity: 0,
              '--drift-x': `${p.driftX}px`,
              '--drift-y': `${p.driftY}px`,
              animation: `sparkDrift ${p.duration}s ease-out ${p.delay}s forwards`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Light beam sweep */}
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.06), transparent)',
        top: 0,
        left: '-150px',
        zIndex: 3,
        pointerEvents: 'none',
        animation: 'beamSweep 1.5s ease-in-out 1.8s forwards',
      }} />

      {/* Gradient underline */}
      <span style={{
        display: 'block',
        width: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #6366f1, #a78bfa, #6366f1)',
        marginTop: '12px',
        borderRadius: '2px',
        boxShadow: '0 0 8px rgba(99,102,241,0.25)',
        animation: 'underlineGrow 0.5s cubic-bezier(0.16,1,0.3,1) 1.6s forwards',
        position: 'relative',
        zIndex: 2,
      }} />
    </div>
  )
}
