'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

// ═══ Global scroll tracking ═══
let globalScrollY = 0
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => { globalScrollY = window.scrollY }, { passive: true })
}

function useFloatAndScroll() {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const prevScroll = useRef(0)

  useFrame(() => {
    if (!ref.current) return
    ref.current.position.y = Math.sin(Date.now() * 0.0008) * 0.06
    const scrollDelta = globalScrollY - prevScroll.current
    ref.current.rotation.y += scrollDelta * 0.003
    prevScroll.current += (globalScrollY - prevScroll.current) * 0.1
    const t = hovered ? 1.12 : 1
    ref.current.scale.lerp(new THREE.Vector3(t, t, t), 0.1)
  })

  return { ref, hovered, setHovered }
}

// ═══ Brain — two hemispheres with central fissure ═══
function BrainModel() {
  const { ref, setHovered } = useFloatAndScroll()

  const makeHemisphere = useMemo(() => (side: number) => {
    const geo = new THREE.SphereGeometry(0.55, 40, 40, 0, Math.PI)
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      // Wrinkle displacement — layered sine for sulci/gyri
      const wrinkle =
        Math.sin(v.x * 10 + v.y * 6) * 0.04 +
        Math.sin(v.y * 14 + v.z * 8) * 0.035 +
        Math.sin(v.z * 9 + v.x * 12) * 0.025 +
        Math.cos(v.x * 18 - v.y * 7) * 0.02
      const r = 0.55 + wrinkle
      v.normalize().multiplyScalar(r)
      // Shift hemisphere to the side
      v.x += side * 0.08
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  const leftGeo = useMemo(() => makeHemisphere(-1), [makeHemisphere])
  const rightGeo = useMemo(() => makeHemisphere(1), [makeHemisphere])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} rotation={[0.2, 0, 0]}>
      {/* Left hemisphere */}
      <mesh geometry={leftGeo} rotation={[0, -Math.PI / 2, 0]}>
        <meshStandardMaterial color="#f0abfc" emissive="#c026d3" emissiveIntensity={0.25} roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Right hemisphere */}
      <mesh geometry={rightGeo} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#e879f9" emissive="#a21caf" emissiveIntensity={0.25} roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Brain stem hint */}
      <mesh position={[0, -0.45, -0.1]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.2, 12]} />
        <meshStandardMaterial color="#d946ef" emissive="#a21caf" emissiveIntensity={0.15} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ═══ Globe ═══
function GlobeModel() {
  const { ref, setHovered } = useFloatAndScroll()

  const globeGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.65, 48, 48)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const v = new THREE.Vector3()
    const ocean = new THREE.Color('#3b82f6')
    const land = new THREE.Color('#eab308')

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const lat = Math.asin(v.y / 0.65)
      const lon = Math.atan2(v.z, v.x)
      const isLand =
        (Math.sin(lon * 2 + 1) * Math.cos(lat * 3) * 0.5 +
        Math.sin(lon * 5 - lat * 2) * 0.3 +
        Math.sin(lat * 6 + lon * 3) * 0.2) > 0.15
      const c = isLand ? land : ocean
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
      if (isLand) { v.normalize().multiplyScalar(0.665); pos.setXYZ(i, v.x, v.y, v.z) }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh geometry={globeGeo}>
        <meshStandardMaterial vertexColors roughness={0.4} metalness={0.15} emissive="#a16207" emissiveIntensity={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.66, 0.008, 8, 64]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.5} />
      </mesh>
      <mesh scale={1.05}>
        <sphereGeometry args={[0.65, 24, 24]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

// ═══ Capitol ═══
function CapitolModel() {
  const { ref, setHovered } = useFloatAndScroll()
  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={0.85}>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.6]} />
        <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.2} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.0, 0.08, 0.5]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={0.15} roughness={0.3} metalness={0.3} />
      </mesh>
      {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.5, 12]} />
          <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.25} roughness={0.2} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.5]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={0.15} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 0.25, 3]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={0.2} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.13, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.3} roughness={0.2} metalness={0.4} />
      </mesh>
    </group>
  )
}

// ═══ Flask — FULL liquid, working bubbles ═══
function FlaskModel() {
  const { ref, hovered, setHovered } = useFloatAndScroll()
  const bubbleRefs = useRef<THREE.Mesh[]>([])
  const bubbleData = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.2,
      y: -0.4 + (i / 8) * 0.5,
      z: (Math.random() - 0.5) * 0.2,
      speed: 0.003 + Math.random() * 0.003,
    }))
  )

  useFrame(() => {
    bubbleData.current.forEach((b, i) => {
      const mesh = bubbleRefs.current[i]
      if (!mesh) return
      b.y += hovered ? b.speed * 4 : b.speed
      if (b.y > 0.25) {
        b.y = -0.4
        b.x = (Math.random() - 0.5) * 0.2
        b.z = (Math.random() - 0.5) * 0.2
      }
      mesh.position.set(b.x, b.y, b.z)
    })
  })

  const flaskGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, -0.5),
      new THREE.Vector2(0.38, -0.5),
      new THREE.Vector2(0.38, -0.44),
      new THREE.Vector2(0.36, -0.28),
      new THREE.Vector2(0.14, 0.22),
      new THREE.Vector2(0.11, 0.38),
      new THREE.Vector2(0.11, 0.5),
      new THREE.Vector2(0.13, 0.52),
    ]
    return new THREE.LatheGeometry(pts, 32)
  }, [])

  // Liquid shape matches flask interior but filled high
  const liquidGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, -0.48),
      new THREE.Vector2(0.35, -0.48),
      new THREE.Vector2(0.35, -0.44),
      new THREE.Vector2(0.33, -0.28),
      new THREE.Vector2(0.12, 0.18),
      new THREE.Vector2(0.09, 0.28),
      new THREE.Vector2(0.09, 0.3),
      new THREE.Vector2(0, 0.3),
    ]
    return new THREE.LatheGeometry(pts, 32)
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Glass body */}
      <mesh geometry={flaskGeo}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Liquid — fills most of flask */}
      <mesh geometry={liquidGeo}>
        <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.5} transparent opacity={0.8} roughness={0.3} />
      </mesh>
      {/* Liquid surface glow */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.09, 24]} />
        <meshBasicMaterial color="#fdba74" transparent opacity={0.6} />
      </mesh>
      {/* Bubbles */}
      {bubbleData.current.map((b, i) => (
        <mesh key={i} ref={(el) => { if (el) bubbleRefs.current[i] = el }} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.015 + (i % 3) * 0.006, 8, 8]} />
          <meshBasicMaterial color="#fef3c7" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ═══ Integral ═══
function IntegralModel() {
  const { ref, setHovered } = useFloatAndScroll()
  const geo = useMemo(() => {
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
      <mesh geometry={geo} position={[-0.06, 0, -0.07]}>
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

// ═══ Terminal — centered on screen, no stand clutter ═══
function TerminalModel() {
  const { ref, hovered, setHovered } = useFloatAndScroll()
  const cursorRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!cursorRef.current) return
    cursorRef.current.visible = Math.sin(state.clock.elapsedTime * 4) > 0
  })

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Rounded bezel */}
      <mesh>
        <boxGeometry args={[1.1, 0.8, 0.08]} />
        <meshStandardMaterial color="#4b5563" emissive="#374151" emissiveIntensity={0.15} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Screen — bright green */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[0.95, 0.65]} />
        <meshStandardMaterial
          color="#052e16"
          emissive={hovered ? '#22c55e' : '#16a34a'}
          emissiveIntensity={hovered ? 1.0 : 0.6}
          roughness={0.9}
        />
      </mesh>
      {/* Code lines */}
      {[0.2, 0.1, 0.0, -0.1, -0.2].map((y, i) => (
        <mesh key={i} position={[-0.18 + (i % 3) * 0.04, y, 0.05]}>
          <boxGeometry args={[0.3 + (i % 2) * 0.18, 0.03, 0.001]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.75 - i * 0.06} />
        </mesh>
      ))}
      {/* Cursor */}
      <mesh ref={cursorRef} position={[-0.05, -0.2, 0.05]}>
        <boxGeometry args={[0.025, 0.04, 0.001]} />
        <meshBasicMaterial color="#86efac" />
      </mesh>
      {/* Screen glow halo */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.2, 0.9]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={hovered ? 0.06 : 0.03} />
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
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onCreated={({ invalidate }) => {
          const tick = () => { invalidate(); requestAnimationFrame(tick) }
          requestAnimationFrame(tick)
        }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[3, 4, 5]} intensity={2.0} />
        <pointLight position={[-4, 2, 3]} intensity={0.8} color="#c4b5fd" />
        <pointLight position={[0, -3, 4]} intensity={0.5} color="#fde68a" />
        <ModelComponent />
      </Canvas>
    </div>
  )
}
