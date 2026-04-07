'use client'

interface ModeIconProps {
  iconName: 'drills' | 'practice' | 'study-guide' | 'test' | 'frq'
  color: string
  size?: number
}

export function ModeIcon({ iconName, color, size = 36 }: ModeIconProps) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: `${size * 0.28}px`,
      background: `linear-gradient(135deg, ${color}88, ${color})`,
      boxShadow: `0 3px 10px ${color}44, inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.1)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'float3d 3s ease-in-out infinite',
      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}
      >
        {iconName === 'drills' && (
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        )}
        {iconName === 'practice' && (
          <>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8" />
            <path d="M8 17h8" />
          </>
        )}
        {iconName === 'study-guide' && (
          <>
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </>
        )}
        {iconName === 'test' && (
          <>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </>
        )}
        {iconName === 'frq' && (
          <>
            <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </>
        )}
      </svg>
    </div>
  )
}
