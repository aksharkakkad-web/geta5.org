import Link from 'next/link'

interface SubjectCardProps {
  name: string
  slug: string
}

const SUBJECT_THEMES: Record<string, {
  gradient: string
  emoji: string
}> = {
  'ap-psychology': {
    gradient: 'linear-gradient(135deg, #1e1035 0%, #2d1b69 50%, #1a0f3d 100%)',
    emoji: '🧠',
  },
  'ap-world-history': {
    gradient: 'linear-gradient(135deg, #1a1200 0%, #3d2800 50%, #1a0e00 100%)',
    emoji: '🌍',
  },
  'ap-government': {
    gradient: 'linear-gradient(135deg, #001a35 0%, #002d5c 50%, #001028 100%)',
    emoji: '🏛️',
  },
  'ap-calculus-ab': {
    gradient: 'linear-gradient(135deg, #001a1a 0%, #003333 50%, #001212 100%)',
    emoji: '∫',
  },
  'ap-precalculus': {
    gradient: 'linear-gradient(135deg, #0d1a2d 0%, #162844 50%, #080f1a 100%)',
    emoji: '📐',
  },
  'ap-computer-science-principles': {
    gradient: 'linear-gradient(135deg, #001a0d 0%, #003320 50%, #000f08 100%)',
    emoji: '💻',
  },
  'ap-chemistry': {
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #3d1500 50%, #120600 100%)',
    emoji: '⚗️',
  },
}

const DEFAULT_THEME = {
  gradient: 'linear-gradient(135deg, #111 0%, #222 100%)',
  emoji: '📚',
}

export function SubjectCard({ name, slug }: SubjectCardProps) {
  const theme = SUBJECT_THEMES[slug] ?? DEFAULT_THEME

  return (
    <Link href={`/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="subject-card"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 180ms ease, transform 180ms ease',
        }}
      >
        {/* Art header */}
        <div
          style={{
            height: '100px',
            background: theme.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'relative',
          }}
        >
          {/* Large background emoji (decorative, faded) */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '-4px',
              bottom: '-8px',
              fontSize: '72px',
              opacity: 0.18,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {theme.emoji}
          </div>

          {/* Foreground emoji pill */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            {theme.emoji}
          </div>

          {/* Subject tag badge */}
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: theme.accentColor,
              background: `color-mix(in srgb, ${theme.accentColor} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${theme.accentColor} 30%, transparent)`,
              borderRadius: '6px',
              padding: '3px 8px',
              zIndex: 1,
            }}
          >
            {theme.tag}
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: '16px 20px 18px' }}>
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '6px',
            lineHeight: 1.3,
          }}>
            {name}
          </h3>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: theme.accentColor,
          }}>
            Start Practicing →
          </span>
        </div>
      </div>
    </Link>
  )
}
