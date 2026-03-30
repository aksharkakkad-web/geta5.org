'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useMemo, useEffect } from 'react'
import * as THREE from 'three'

// ═══ Shared scroll tracking — passed from parent via context-free approach ═══

let globalScrollY = 0
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => { globalScrollY = window.scrollY }, { passive: true })
}

// ═══ Shared float + scroll-linked rotation ═══

function useFloatAndScroll() {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const prevScroll = useRef(0)

  useFrame(() => {
    if (!ref.current) return
    // Gentle float
    ref.current.position.y = Math.sin(Date.now() * 0.0008) * 0.08

    // Scroll-linked rotation (not auto-rotate)
    const scrollDelta = globalScrollY - prevScroll.current
    ref.current.rotation.y += scrollDelta * 0.003
    prevScroll.current += (globalScrollY - prevScroll.current) * 0.1

    // Hover scale
    const target = hovered ? 1.15 : 1
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1)
  })

  return { ref, hovered, setHovered }
}

// ═══ Brain ═══

function BrainModel() {
  const { ref, setHovered } = useFloatAndScroll()

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.75, 48, 48)
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const noise =
        Math.sin(v.x * 8 + v.y * 3) * 0.045 +
        Math.sin(v.y * 12 + v.z * 5) * 0.035 +
        Math.sin(v.z * 6 + v.x * 10) * 0.025 +
        Math.sin(v.x * 15 - v.y * 8) * 0.018
      // Center crease
      const crease = Math.exp(-v.x * v.x * 25) * 0.05
      v.normalize().multiplyScalar(0.75 + noise - crease)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#e9d5ff" emissive="#a855f7" emissiveIntensity={0.35} roughness={0.55} metalness={0.05} />
      </mesh>
    </group>
  )
}

// ═══ Globe ═══

function GlobeModel() {
  const { ref, setHovered } = useFloatAndScroll()

  const globeGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.7, 48, 48)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const v = new THREE.Vector3()
    const ocean = new THREE.Color('#2563eb')
    const land = new THREE.Color('#eab308')

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const lat = Math.asin(v.y / 0.7)
      const lon = Math.atan2(v.z, v.x)
      const isLand =
        (Math.sin(lon * 2 + 1) * Math.cos(lat * 3) * 0.5 +
        Math.sin(lon * 5 - lat * 2) * 0.3 +
        Math.sin(lat * 6 + lon * 3) * 0.2) > 0.15
      const c = isLand ? land : ocean
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      if (isLand) {
        v.normalize().multiplyScalar(0.715)
        pos.setXYZ(i, v.x, v.y, v.z)
      }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh geometry={globeGeo}>
        <meshStandardMaterial vertexColors roughness={0.4} metalness={0.15} emissive="#a16207" emissiveIntensity={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.71, 0.008, 8, 64]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.5} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

// ═══ Capitol ═══

function CapitolModel() {
  const { ref, setHovered } = useFloatAndScroll()

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={0.9}>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.6]} />
        <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.2} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[1.0, 0.08, 0.5]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={0.15} roughness={0.3} metalness={0.3} />
      </mesh>
      {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.5, 12]} />
          <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.25} roughness={0.2} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.5]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={0.15} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 0.3, 3]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={0.2} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.3} roughness={0.2} metalness={0.4} />
      </mesh>
    </group>
  )
}

// ═══ Flask with working bubbles ═══

function FlaskModel() {
  const { ref, hovered, setHovered } = useFloatAndScroll()

  const flaskGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0, -0.5),
      new THREE.Vector2(0.4, -0.5),
      new THREE.Vector2(0.4, -0.45),
      new THREE.Vector2(0.38, -0.3),
      new THREE.Vector2(0.15, 0.2),
      new THREE.Vector2(0.12, 0.35),
      new THREE.Vector2(0.12, 0.5),
      new THREE.Vector2(0.14, 0.52),
      new THREE.Vector2(0.14, 0.54),
    ]
    return new THREE.LatheGeometry(points, 32)
  }, [])

  // Bubble positions as refs for direct mutation (no re-render)
  const bubbleRefs = useRef<THREE.Mesh[]>([])
  const bubbleData = useRef(
    Array.from({ length: 8 }, () => ({
      x: (Math.random() - 0.5) * 0.22,
      y: -0.45 + Math.random() * 0.3,
      z: (Math.random() - 0.5) * 0.22,
      speed: 0.003 + Math.random() * 0.004,
    }))
  )

  useFrame(() => {
    bubbleData.current.forEach((b, i) => {
      const mesh = bubbleRefs.current[i]
      if (!mesh) return
      b.y += hovered ? b.speed * 3 : b.speed
      if (b.y > 0.15) {
        b.y = -0.45
        b.x = (Math.random() - 0.5) * 0.22
        b.z = (Math.random() - 0.5) * 0.22
      }
      mesh.position.set(b.x, b.y, b.z)
    })
  })

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh geometry={flaskGeo}>
        <meshPhysicalMaterial color="#fde68a" transparent opacity={0.2} roughness={0.05} metalness={0.05} transmission={0.7} thickness={0.3} />
      </mesh>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.28, 0.38, 0.45, 32]} />
        <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.45} transparent opacity={0.75} roughness={0.3} />
      </mesh>
      {bubbleData.current.map((b, i) => (
        <mesh key={i} ref={(el) => { if (el) bubbleRefs.current[i] = el }} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.018 + Math.random() * 0.01, 8, 8]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ═══ Integral ═══

function IntegralModel() {
  const { ref, setHovered } = useFloatAndScroll()

  const integralGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0.1, 0.5)
    shape.bezierCurveTo(0.1, 0.6, -0.05, 0.6, -0.05, 0.5)
    shape.bezierCurveTo(-0.05, 0.35, 0.08, 0.15, 0.08, 0)
    shape.bezierCurveTo(0.08, -0.15, -0.05, -0.35, -0.05, -0.5)
    shape.bezierCurveTo(-0.05, -0.6, 0.1, -0.6, 0.1, -0.5)
    shape.lineTo(0.18, -0.5)
    shape.bezierCurveTo(0.18, -0.55, 0.0, -0.55, 0.0, -0.5)
    shape.bezierCurveTo(0.0, -0.35, 0.16, -0.15, 0.16, 0)
    shape.bezierCurveTo(0.16, 0.15, 0.0, 0.35, 0.0, 0.5)
    shape.bezierCurveTo(0.0, 0.55, 0.18, 0.55, 0.18, 0.5)
    shape.lineTo(0.1, 0.5)
    return new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 })
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={1.3}>
      <mesh geometry={integralGeo} position={[-0.06, 0, -0.07]}>
        <meshStandardMaterial color="#99f6e4" emissive="#14b8a6" emissiveIntensity={0.4} roughness={0.2} metalness={0.4} />
      </mesh>
    </group>
  )
}

// ═══ Graph ═══

function GraphModel() {
  const { ref, setHovered } = useFloatAndScroll()

  const curveGeo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = -20; i <= 20; i++) {
      const x = i * 0.04
      pts.push(new THREE.Vector3(x, Math.sin(x * 3) * 0.25 + Math.cos(x * 1.5) * 0.1, 0))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.025, 8, false)
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh position={[0, -0.05, -0.05]}>
        <planeGeometry args={[1.6, 1, 8, 5]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.15} />
      </mesh>
      <mesh><boxGeometry args={[1.6, 0.008, 0.008]} /><meshBasicMaterial color="#a5b4fc" transparent opacity={0.5} /></mesh>
      <mesh><boxGeometry args={[0.008, 0.8, 0.008]} /><meshBasicMaterial color="#a5b4fc" transparent opacity={0.5} /></mesh>
      <mesh geometry={curveGeo}>
        <meshStandardMaterial color="#c7d2fe" emissive="#818cf8" emissiveIntensity={0.5} roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  )
}

// ═══ Terminal — fixed: brighter, properly sized ═══

function TerminalModel() {
  const { ref, hovered, setHovered } = useFloatAndScroll()
  const cursorRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!cursorRef.current) return
    cursorRef.current.visible = Math.sin(state.clock.elapsedTime * 4) > 0
  })

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={0.85}>
      {/* Bezel */}
      <mesh>
        <boxGeometry args={[1.0, 0.72, 0.06]} />
        <meshStandardMaterial color="#374151" emissive="#1f2937" emissiveIntensity={0.1} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Screen — bright green glow */}
      <mesh position={[0, 0.02, 0.035]}>
        <planeGeometry args={[0.85, 0.58]} />
        <meshStandardMaterial
          color="#065f46"
          emissive={hovered ? '#22c55e' : '#16a34a'}
          emissiveIntensity={hovered ? 0.8 : 0.5}
          roughness={0.9}
        />
      </mesh>
      {/* Code lines */}
      {[0.18, 0.09, 0.0, -0.09, -0.18].map((y, i) => (
        <mesh key={i} position={[-0.2 + (i % 3) * 0.03, y, 0.04]}>
          <boxGeometry args={[0.25 + (i % 2) * 0.2, 0.025, 0.001]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.7 - i * 0.06} />
        </mesh>
      ))}
      {/* Prompt chevron */}
      <mesh position={[-0.35, -0.18, 0.04]}>
        <boxGeometry args={[0.04, 0.025, 0.001]} />
        <meshBasicMaterial color="#86efac" />
      </mesh>
      {/* Blinking cursor */}
      <mesh ref={cursorRef} position={[-0.08, -0.18, 0.04]}>
        <boxGeometry args={[0.02, 0.035, 0.001]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
      {/* Stand */}
      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#6b7280" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.56, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 16]} />
        <meshStandardMaterial color="#6b7280" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ═══ Scene Router ═══

const MODELS: Record<string, () => JSX.Element> = {
  'ap-psychology': () => <BrainModel />,
  'ap-world-history': () => <GlobeModel />,
  'ap-government': () => <CapitolModel />,
  'ap-calculus-ab': () => <IntegralModel />,
  'ap-precalculus': () => <GraphModel />,
  'ap-computer-science-principles': () => <TerminalModel />,
  'ap-chemistry': () => <FlaskModel />,
}

export default function SubjectScene({ subject, size }: { subject: string; size: number }) {
  const ModelComponent = MODELS[subject] ?? (() => (
    <mesh><icosahedronGeometry args={[0.6, 2]} /><meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={0.3} /></mesh>
  ))

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 2.8], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onCreated={({ gl, invalidate }) => {
          // Re-render on scroll and pointer events, not continuously
          const tick = () => { invalidate(); requestAnimationFrame(tick) }
          requestAnimationFrame(tick)
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 4, 5]} intensity={1.5} />
        <pointLight position={[-3, 2, 3]} intensity={0.6} color="#c4b5fd" />
        <ModelComponent />
      </Canvas>
    </div>
  )
}
