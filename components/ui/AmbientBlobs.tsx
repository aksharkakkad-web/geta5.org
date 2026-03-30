'use client'

interface AmbientBlobsProps {
  color1?: string
  color2?: string
  size1?: number
  size2?: number
}

export function AmbientBlobs({
  color1 = 'rgba(99,102,241,0.1)',
  color2 = 'rgba(139,92,246,0.07)',
  size1 = 350,
  size2 = 250,
}: AmbientBlobsProps) {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: `${size1}px`,
          height: `${size1}px`,
          background: `radial-gradient(circle, ${color1}, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
          top: '-120px',
          left: '-80px',
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
          background: `radial-gradient(circle, ${color2}, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
          top: '-50px',
          right: '-40px',
          pointerEvents: 'none',
          animation: 'blobFloat2 12s ease-in-out infinite',
        }}
      />
    </>
  )
}
