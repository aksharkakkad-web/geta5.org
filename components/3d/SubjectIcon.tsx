'use client'
import { useEffect, useRef } from 'react'

interface SubjectIconProps {
  subject: string
  size?: number
}

const ICONS: Record<string, {
  colors: [string, string, string]
  glow: string
  render: (c: [string, string, string], gid: string) => React.JSX.Element
}> = {
  'ap-psychology': {
    colors: ['#f0abfc', '#d946ef', '#7e22ce'],
    glow: '#d946ef',
    render: (c, gid) => (
      <>
        <path d="M28 18c-2-8 8-14 16-13 6 1 10 6 10 12 0 4-1 8-4 11-2 2-4 5-5 8h-8c-1-3-2-5-4-7-3-3-6-6-5-11z" fill={`url(#${gid})`} />
        <path d="M52 18c2-8-8-14-16-13-6 1-10 6-10 12 0 4 1 8 4 11 2 2 4 5 5 8h8c1-3 2-5 4-7 3-3 6-6 5-11z" fill={c[1]} opacity={0.85} />
        <line x1="40" y1="8" x2="40" y2="36" stroke={c[2]} strokeWidth="1.5" opacity={0.6} />
        <path d="M24 22c4-1 8 2 12 1" stroke={c[2]} strokeWidth="1" fill="none" opacity={0.4} />
        <path d="M44 22c4 1 8-2 12-1" stroke={c[2]} strokeWidth="1" fill="none" opacity={0.4} />
        <path d="M26 28c3 0 7 2 10 1" stroke={c[2]} strokeWidth="1" fill="none" opacity={0.4} />
        <path d="M44 28c3-1 7 1 10 0" stroke={c[2]} strokeWidth="1" fill="none" opacity={0.4} />
        <rect x="37" y="36" width="6" height="8" rx="2" fill={c[2]} />
        <ellipse cx="40" cy="42" rx="10" ry="5" fill={c[1]} opacity={0.5} />
      </>
    ),
  },
  'ap-world-history': {
    colors: ['#3b82f6', '#eab308', '#fde68a'],
    glow: '#3b82f6',
    render: (c, gid) => (
      <>
        <circle cx="40" cy="34" r="22" fill={`url(#${gid})`} />
        <path d="M30 18c2 0 4 2 6 1s4-2 7-1c2 1 3 3 2 5s-3 3-5 3-4-1-6 0-4 2-6 1c-1-1-1-3 0-4s1-3 2-5z" fill={c[1]} opacity={0.9} />
        <path d="M44 28c2 1 5 0 6 2s0 4-1 6-3 3-5 3-3-2-3-4 1-4 3-7z" fill={c[1]} opacity={0.85} />
        <path d="M26 32c1 1 3 0 5 1s2 3 1 5-2 3-4 3-3-1-4-3 1-4 2-6z" fill={c[1]} opacity={0.8} />
        <ellipse cx="40" cy="26" rx="20" ry="4" fill="none" stroke={c[2]} strokeWidth="0.5" opacity={0.3} />
        <ellipse cx="40" cy="34" rx="22" ry="2" fill="none" stroke={c[2]} strokeWidth="0.5" opacity={0.3} />
        <ellipse cx="40" cy="42" rx="20" ry="4" fill="none" stroke={c[2]} strokeWidth="0.5" opacity={0.3} />
        <ellipse cx="40" cy="34" rx="24" ry="6" fill="none" stroke={c[2]} strokeWidth="0.8" opacity={0.4} />
      </>
    ),
  },
  'ap-government': {
    colors: ['#93c5fd', '#3b82f6', '#dbeafe'],
    glow: '#60a5fa',
    render: (c, gid) => (
      <>
        <rect x="16" y="44" width="48" height="4" rx="1" fill={`url(#${gid})`} />
        <rect x="20" y="40" width="40" height="4" rx="1" fill={c[0]} opacity={0.7} />
        {[26, 33, 40, 47, 54].map((x, i) => (
          <rect key={i} x={x - 1.5} y="22" width="3" height="18" rx="1" fill={c[2]} />
        ))}
        <rect x="22" y="19" width="36" height="4" rx="1" fill={c[0]} opacity={0.8} />
        <polygon points="40,10 58,19 22,19" fill={`url(#${gid})`} />
        <ellipse cx="40" cy="12" rx="6" ry="4" fill={c[2]} opacity={0.5} />
      </>
    ),
  },
  'ap-calculus-ab': {
    colors: ['#99f6e4', '#14b8a6', '#5eead4'],
    glow: '#14b8a6',
    render: (c, gid) => (
      <>
        <path d="M32 12c0-2 2-4 4-4s3 1 3 3c0 3-2 6-2 12s-1 9-1 12c0 2-1 4-3 5s-4 0-4-2 2-3 2-5c0-3 1-6 1-12s1-9 0-9z" fill={`url(#${gid})`} />
        <line x1="42" y1="22" x2="50" y2="34" stroke={c[2]} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="22" x2="42" y2="34" stroke={c[2]} strokeWidth="2.5" strokeLinecap="round" />
        <text x="51" y="22" fill={c[0]} fontSize="10" fontWeight="700" fontFamily="serif">²</text>
        <text x="42" y="46" fill={c[0]} fontSize="9" fontWeight="600" fontFamily="serif" opacity={0.7}>dx</text>
      </>
    ),
  },
  'ap-precalculus': {
    colors: ['#c7d2fe', '#818cf8', '#a5b4fc'],
    glow: '#818cf8',
    render: (c, gid) => (
      <>
        <rect x="14" y="12" width="52" height="40" rx="2" fill="none" stroke={c[2]} strokeWidth="0.5" opacity={0.15} />
        <line x1="14" y1="32" x2="66" y2="32" stroke={c[2]} strokeWidth="1" opacity={0.4} />
        <line x1="40" y1="12" x2="40" y2="52" stroke={c[2]} strokeWidth="1" opacity={0.4} />
        <path d="M14 32 C20 18, 28 18, 34 32 S48 46, 54 32 S62 18, 66 32" fill="none" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="14" cy="32" r="2" fill={c[0]} />
        <circle cx="34" cy="32" r="2" fill={c[0]} />
        <circle cx="54" cy="32" r="2" fill={c[0]} />
      </>
    ),
  },
  'ap-csp': {
    colors: ['#86efac', '#22c55e', '#4ade80'],
    glow: '#22c55e',
    render: (c, gid) => (
      <>
        <rect x="14" y="10" width="52" height="36" rx="3" fill="#1a1a2e" stroke={c[1]} strokeWidth="1" opacity={0.6} />
        <rect x="17" y="13" width="46" height="30" rx="1" fill="#0a1628" />
        <rect x="21" y="18" width="18" height="2.5" rx="1" fill={c[0]} opacity={0.8} />
        <rect x="21" y="23" width="24" height="2.5" rx="1" fill={c[2]} opacity={0.6} />
        <rect x="25" y="28" width="14" height="2.5" rx="1" fill={c[0]} opacity={0.5} />
        <rect x="25" y="33" width="20" height="2.5" rx="1" fill={c[2]} opacity={0.4} />
        <rect x="21" y="38" width="2" height="3" rx="0.5" fill={c[0]}>
          <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
        <rect x="35" y="46" width="10" height="4" rx="1" fill={c[1]} opacity={0.3} />
        <rect x="30" y="49" width="20" height="2" rx="1" fill={c[1]} opacity={0.4} />
      </>
    ),
  },
  'ap-calculus-bc': {
    colors: ['#f9a8d4', '#ec4899', '#fce7f3'],
    glow: '#ec4899',
    render: (c, gid) => (
      <>
        {/* Large Sigma */}
        <text x="11" y="44" fill={`url(#${gid})`} fontSize="30" fontWeight="700" fontFamily="Georgia, serif">Σ</text>
        {/* n=0 subscript */}
        <text x="13" y="53" fill={c[0]} fontSize="7" fontFamily="Georgia, serif" opacity={0.85}>n=0</text>
        {/* ∞ superscript */}
        <text x="16" y="19" fill={c[0]} fontSize="8" fontFamily="Georgia, serif" opacity={0.85}>∞</text>
        {/* Baseline */}
        <line x1="43" y1="47" x2="72" y2="47" stroke={c[2]} strokeWidth="1" opacity={0.45} />
        {/* Converging arches — each successive term shorter */}
        <path d="M44 47 Q47.5 18 51 47" fill="none" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M52 47 Q55 27 58 47" fill="none" stroke={c[0]} strokeWidth="2" strokeLinecap="round" opacity={0.8} />
        <path d="M59 47 Q61.5 34 64 47" fill="none" stroke={c[0]} strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
        <path d="M65 47 Q66.5 39 68 47" fill="none" stroke={c[0]} strokeWidth="1" strokeLinecap="round" opacity={0.4} />
        {/* Trailing dots */}
        <circle cx="70" cy="47" r="1.2" fill={c[0]} opacity={0.35} />
        <circle cx="73" cy="47" r="0.8" fill={c[0]} opacity={0.2} />
      </>
    ),
  },
  'ap-chemistry': {
    colors: ['#fb923c', '#ea580c', '#fef3c7'],
    glow: '#ea580c',
    render: (c, gid) => (
      <>
        <path d="M34 20 L34 30 L22 46 C20 49 22 52 26 52 L54 52 C58 52 60 49 58 46 L46 30 L46 20" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity={0.5} />
        <rect x="34" y="12" width="12" height="10" rx="1" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity={0.5} />
        <rect x="32" y="11" width="16" height="2" rx="1" fill="#cbd5e1" opacity={0.6} />
        <path d="M28 40 L24 46 C22 49 24 50 28 50 L52 50 C56 50 58 49 56 46 L52 40 Z" fill={`url(#${gid})`} />
        <path d="M30 37 L28 40 L52 40 L50 37 Z" fill={c[0]} opacity={0.7} />
        <circle cx="36" cy="44" r="2" fill={c[2]} opacity={0.7} />
        <circle cx="44" cy="42" r="1.5" fill={c[2]} opacity={0.5} />
        <circle cx="40" cy="46" r="1" fill={c[2]} opacity={0.6} />
        <circle cx="48" cy="45" r="1.5" fill={c[2]} opacity={0.4} />
      </>
    ),
  },
}

const DEFAULT_ICON = {
  colors: ['#818cf8', '#6366f1', '#a5b4fc'] as [string, string, string],
  glow: '#6366f1',
  render: (c: [string, string, string], gid: string) => (
    <rect x="20" y="16" width="40" height="32" rx="8" fill={`url(#${gid})`} />
  ),
}

export function SubjectIcon({ subject, size = 56 }: SubjectIconProps) {
  const icon = ICONS[subject] ?? DEFAULT_ICON
  const ref = useRef<SVGSVGElement>(null)
  const gid = `grad-${subject}`

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    const onScroll = () => {
      el.style.transform = `perspective(400px) rotateY(${window.scrollY * 0.08}deg)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 80 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="subject-icon"
      style={{
        filter: `drop-shadow(0 0 8px ${icon.glow}66) drop-shadow(0 0 20px ${icon.glow}33)`,
        willChange: 'transform',
      }}
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={icon.colors[0]} />
          <stop offset="100%" stopColor={icon.colors[1]} />
        </linearGradient>
      </defs>
      {icon.render(icon.colors, gid)}
    </svg>
  )
}
