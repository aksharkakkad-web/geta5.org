'use client'

interface SubjectIconProps {
  subject: string
  size?: number
}

const SUBJECT_CONFIG: Record<string, {
  colors: [string, string, string, string]
  glowColor: string
}> = {
  'ap-psychology': {
    colors: ['#c4b5fd', '#8b5cf6', '#5b21b6', '#3b0764'],
    glowColor: 'rgba(139,92,246,0.3)',
  },
  'ap-world-history': {
    colors: ['#fde68a', '#f59e0b', '#d97706', '#92400e'],
    glowColor: 'rgba(245,158,11,0.3)',
  },
  'ap-government': {
    colors: ['#bae6fd', '#38bdf8', '#0284c7', '#0369a1'],
    glowColor: 'rgba(56,189,248,0.3)',
  },
  'ap-calculus-ab': {
    colors: ['#99f6e4', '#14b8a6', '#0d9488', '#115e59'],
    glowColor: 'rgba(20,184,166,0.3)',
  },
  'ap-precalculus': {
    colors: ['#c7d2fe', '#818cf8', '#6366f1', '#4338ca'],
    glowColor: 'rgba(99,102,241,0.3)',
  },
  'ap-computer-science-principles': {
    colors: ['#bbf7d0', '#22c55e', '#16a34a', '#15803d'],
    glowColor: 'rgba(34,197,94,0.3)',
  },
  'ap-chemistry': {
    colors: ['#fed7aa', '#f97316', '#ea580c', '#c2410c'],
    glowColor: 'rgba(249,115,22,0.3)',
  },
}

const DEFAULT_CONFIG = {
  colors: ['#c7d2fe', '#6366f1', '#4f46e5', '#3730a3'] as [string, string, string, string],
  glowColor: 'rgba(99,102,241,0.3)',
}

export function SubjectIcon({ subject, size = 48 }: SubjectIconProps) {
  const config = SUBJECT_CONFIG[subject] ?? DEFAULT_CONFIG
  const [c1, c2, c3, c4] = config.colors

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${c1}, ${c2} 50%, ${c3} 80%, ${c4})`,
        boxShadow: `0 4px 12px ${config.glowColor}, 0 8px 24px ${config.glowColor.replace('0.3', '0.15')}, inset 0 -6px 12px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.15)`,
        position: 'relative',
        overflow: 'hidden',
        animation: 'float3d 4s ease-in-out infinite',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
      }}
    >
      {/* Specular highlight */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: size * 0.35,
          height: size * 0.15,
          background: 'rgba(255,255,255,0.22)',
          borderRadius: '50%',
          top: size * 0.18,
          left: size * 0.22,
          transform: 'rotate(-20deg)',
          filter: 'blur(2px)',
        }}
      />
      {/* Secondary highlight */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: size * 0.15,
          height: size * 0.08,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          top: size * 0.4,
          left: size * 0.55,
          transform: 'rotate(-10deg)',
          filter: 'blur(1px)',
        }}
      />
      {/* Shadow underneath */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -size * 0.15,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.7,
          height: size * 0.1,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}
