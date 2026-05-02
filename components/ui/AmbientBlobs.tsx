'use client'

interface AmbientBlobsProps {
  color1?: string
  color2?: string
  size1?: number
  size2?: number
}

export function AmbientBlobs({
  color1 = 'rgba(99,102,241,0.07)',
  color2 = 'rgba(139,92,246,0.05)',
  size1 = 600,
  size2 = 500,
}: AmbientBlobsProps) {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: `${size1}px`,
          height: `${size1}px`,
          background: `radial-gradient(circle, ${color1} 0%, transparent 100%)`,
          borderRadius: '50%',
          filter: 'blur(120px)',
          top: '-260px',
          left: '-200px',
          pointerEvents: 'none',
          animation: 'blobFloat1 10s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: `${size2}px`,
          height: `${size2}px`,
          background: `radial-gradient(circle, ${color2} 0%, transparent 100%)`,
          borderRadius: '50%',
          filter: 'blur(120px)',
          top: '-200px',
          right: '-180px',
          pointerEvents: 'none',
          animation: 'blobFloat2 12s ease-in-out infinite',
        }}
      />
    </>
  )
}
