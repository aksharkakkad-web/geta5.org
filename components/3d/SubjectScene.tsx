'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Mesh } from 'three'

const SUBJECT_COLORS: Record<string, string> = {
  'ap-psychology': '#8b5cf6',
  'ap-world-history': '#f59e0b',
  'ap-government': '#38bdf8',
  'ap-calculus-ab': '#14b8a6',
  'ap-precalculus': '#6366f1',
  'ap-computer-science-principles': '#22c55e',
  'ap-chemistry': '#f97316',
}

const SUBJECT_SHAPES: Record<string, 'sphere' | 'box' | 'torus' | 'octahedron' | 'dodecahedron' | 'cone' | 'cylinder'> = {
  'ap-psychology': 'sphere',
  'ap-world-history': 'sphere',
  'ap-government': 'box',
  'ap-calculus-ab': 'torus',
  'ap-precalculus': 'octahedron',
  'ap-computer-science-principles': 'box',
  'ap-chemistry': 'cone',
}

function ShapeGeometry({ shape }: { shape: string }) {
  switch (shape) {
    case 'sphere': return <sphereGeometry args={[0.7, 32, 32]} />
    case 'box': return <boxGeometry args={[1, 1, 1]} />
    case 'torus': return <torusGeometry args={[0.5, 0.2, 16, 32]} />
    case 'octahedron': return <octahedronGeometry args={[0.7]} />
    case 'dodecahedron': return <dodecahedronGeometry args={[0.7]} />
    case 'cone': return <coneGeometry args={[0.6, 1, 32]} />
    case 'cylinder': return <cylinderGeometry args={[0.3, 0.5, 1, 32]} />
    default: return <icosahedronGeometry args={[0.7, 1]} />
  }
}

function FloatingShape({ color, shape }: { color: string; shape: string }) {
  const ref = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y += hovered ? 0.02 : 0.005
    ref.current.rotation.x += 0.002
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12
  })

  return (
    <mesh
      ref={ref}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.12 : 1}
    >
      <ShapeGeometry shape={shape} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.35 : 0.1}
        roughness={0.25}
        metalness={0.6}
      />
    </mesh>
  )
}

export default function SubjectScene({ subject, size }: { subject: string; size: number }) {
  const color = SUBJECT_COLORS[subject] || '#6366f1'
  const shape = SUBJECT_SHAPES[subject] || 'sphere'

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, -3, 2]} intensity={0.3} color="#a78bfa" />
        <FloatingShape color={color} shape={shape} />
      </Canvas>
    </div>
  )
}
