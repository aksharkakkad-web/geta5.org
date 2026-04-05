'use client'

interface AdiMascotProps {
  size?: number
  className?: string
}

export function AdiMascot({ size = 80, className = '' }: AdiMascotProps) {
  const height = size * (180 / 160)

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Adi, your AP study buddy"
    >
      <defs>
        <linearGradient id="adiBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="35%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="adiFaceTL" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="adiFaceTR" x1="100%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="adiFaceBL" x1="0%" y1="50%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="adiFaceBR" x1="100%" y1="50%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="adiGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="adiShine" cx="38%" cy="30%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="170" rx="22" ry="4" fill="#a855f7" opacity="0.1" />
      <circle cx="80" cy="78" r="62" fill="url(#adiGlow)" />

      <circle cx="16" cy="44" r="2.5" fill="#67e8f9" opacity="0.65">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="144" cy="50" r="2" fill="#c084fc" opacity="0.55">
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="26" cy="116" r="1.8" fill="#818cf8" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.9s" repeatCount="indefinite" />
      </circle>
      <circle cx="134" cy="108" r="2.2" fill="#67e8f9" opacity="0.45">
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2.3s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="6" r="2" fill="#fde68a" opacity="0.55">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3.1s" repeatCount="indefinite" />
      </circle>
      <circle cx="44" cy="20" r="1.6" fill="#a78bfa" opacity="0.45">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="24" r="1.4" fill="#22d3ee" opacity="0.45">
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="1.7s" repeatCount="indefinite" />
      </circle>

      <polygon points="80,15 135,78 80,141 25,78" fill="url(#adiBody)" />
      <polygon points="80,15 135,78 80,78" fill="url(#adiFaceTR)" />
      <polygon points="80,15 25,78 80,78" fill="url(#adiFaceTL)" />
      <polygon points="25,78 80,141 80,78" fill="url(#adiFaceBL)" />
      <polygon points="135,78 80,141 80,78" fill="url(#adiFaceBR)" />
      <polygon points="80,15 135,78 80,141 25,78" fill="url(#adiShine)" />
      <polygon
        points="80,15 135,78 80,141 25,78"
        fill="none"
        stroke="#a855f7"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <line x1="80" y1="15" x2="80" y2="141" stroke="white" strokeWidth="0.4" opacity="0.1" />
      <line x1="25" y1="78" x2="135" y2="78" stroke="white" strokeWidth="0.4" opacity="0.08" />

      <ellipse cx="62" cy="72" rx="9.5" ry="10.5" fill="#1a1a2e" />
      <ellipse cx="98" cy="72" rx="9.5" ry="10.5" fill="#1a1a2e" />
      <circle cx="58" cy="67" r="4" fill="white" opacity="0.92" />
      <circle cx="94" cy="67" r="4" fill="white" opacity="0.92" />
      <circle cx="66" cy="76" r="2" fill="white" opacity="0.4" />
      <circle cx="102" cy="76" r="2" fill="white" opacity="0.4" />
      <path d="M66 93 Q80 104 94 93" stroke="#1a1a2e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function AdiIcon({ size = 40, className = '' }: AdiMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Adi"
    >
      <defs>
        <linearGradient id="adiIconBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="35%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <radialGradient id="adiIconGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="adiIconShine" cx="38%" cy="30%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#adiIconGlow)" />
      <polygon points="22,4 40,22 22,40 4,22" fill="url(#adiIconBody)" />
      <polygon points="22,4 40,22 22,40 4,22" fill="url(#adiIconShine)" />
      <polygon points="22,4 40,22 22,40 4,22" fill="none" stroke="#a855f7" strokeWidth="1" strokeLinejoin="round" opacity="0.5" />
      <ellipse cx="16" cy="21" rx="2.8" ry="3" fill="#1a1a2e" />
      <ellipse cx="28" cy="21" rx="2.8" ry="3" fill="#1a1a2e" />
      <circle cx="14.5" cy="19.5" r="1.2" fill="white" opacity="0.9" />
      <circle cx="26.5" cy="19.5" r="1.2" fill="white" opacity="0.9" />
      <path d="M17 27 Q22 30.5 27 27" stroke="#1a1a2e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  )
}
