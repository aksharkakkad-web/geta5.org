'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

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

// ═══ Brain — flat top, no concavity, defined stem ═══
function BrainModel() {
  const { ref, setHovered } = useFloatAndScroll()

  const makeHemi = useMemo(() => (side: number) => {
    const geo = new THREE.SphereGeometry(0.5, 40, 40)
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      // Only outward wrinkles — clamp so displacement is always positive
      const wrinkle = Math.abs(
        Math.sin(v.x * 10 + v.y * 6) * 0.04 +
        Math.sin(v.y * 14 + v.z * 8) * 0.03 +
        Math.sin(v.z * 9 + v.x * 12) * 0.02
      )
      v.normalize().multiplyScalar(0.5 + wrinkle)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    // Flatten top: wider than tall, squashed vertically
    geo.scale(0.55, 0.5, 0.6)
    geo.translate(side * 0.22, 0.08, 0)
    return geo
  }, [])

  const leftGeo = useMemo(() => makeHemi(-1), [makeHemi])
  const rightGeo = useMemo(() => makeHemi(1), [makeHemi])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} rotation={[0.2, 0, 0]}>
      <mesh geometry={leftGeo}>
        <meshStandardMaterial color="#f0abfc" emissive="#d946ef" emissiveIntensity={0.3} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh geometry={rightGeo}>
        <meshStandardMaterial color="#e879f9" emissive="#c026d3" emissiveIntensity={0.3} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Brain stem — long, narrow, clearly separate color */}
      <mesh position={[0, -0.32, -0.06]}>
        <cylinderGeometry args={[0.05, 0.09, 0.35, 12]} />
        <meshStandardMaterial color="#7e22ce" emissive="#581c87" emissiveIntensity={0.25} roughness={0.5} />
      </mesh>
      {/* Cerebellum */}
      <mesh position={[0, -0.12, -0.2]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#c084fc" emissive="#7e22ce" emissiveIntensity={0.2} roughness={0.6} />
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
      const isLand = (Math.sin(lon * 2 + 1) * Math.cos(lat * 3) * 0.5 + Math.sin(lon * 5 - lat * 2) * 0.3 + Math.sin(lat * 6 + lon * 3) * 0.2) > 0.15
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
    </group>
  )
}

// ═══ Capitol — no triangle ═══
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
      <mesh position={[0, 0.47, 0]}>
        <boxGeometry args={[0.9, 0.14, 0.45]} />
        <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.2} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.35} roughness={0.2} metalness={0.4} />
      </mesh>
    </group>
  )
}

// ═══ Flask — longer neck, opaque liquid, working bubbles ═══
function FlaskModel() {
  const { ref, hovered, setHovered } = useFloatAndScroll()
  const bubbleRefs = useRef<THREE.Mesh[]>([])
  const bubbleData = useRef(
    Array.from({ length: 10 }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.18,
      y: -0.2 + (i / 10) * 0.4,
      z: (Math.random() - 0.5) * 0.18,
      speed: 0.002 + Math.random() * 0.003,
    }))
  )

  useFrame(() => {
    bubbleData.current.forEach((b, i) => {
      const mesh = bubbleRefs.current[i]
      if (!mesh) return
      b.y += hovered ? b.speed * 4 : b.speed
      if (b.y > 0.45) {
        b.y = -0.2
        b.x = (Math.random() - 0.5) * 0.18
        b.z = (Math.random() - 0.5) * 0.18
      }
      mesh.position.set(b.x, b.y, b.z)
    })
  })

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Flask body — wide bottom */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.18, 0.35, 0.5, 24]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.18} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Flask neck — long and narrow */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.18, 0.4, 16]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.18} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Neck extension — longer narrow part */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.15, 16]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.18} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.09, 0.07, 0.02, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* LIQUID body — opaque orange */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.15, 0.32, 0.44, 24]} />
        <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      {/* Liquid in taper zone */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.15, 0.22, 16]} />
        <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      {/* Liquid surface cap */}
      <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06, 24]} />
        <meshStandardMaterial color="#fdba74" emissive="#f97316" emissiveIntensity={0.4} />
      </mesh>

      {/* Bubbles — inside the liquid zone */}
      {bubbleData.current.map((b, i) => (
        <mesh key={i} ref={(el) => { if (el) bubbleRefs.current[i] = el }} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.01 + (i % 3) * 0.005, 6, 6]} />
          <meshBasicMaterial color="#fef3c7" transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ═══ Integral with equation: ∫ x² dx ═══
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
    return new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 })
  }, [])

  // "x²" as extruded text-like shapes
  // x = two crossed bars, ² = small square
  const xGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.04, 0.28, 0.1)
    return g
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={1.1}>
      {/* ∫ symbol */}
      <mesh geometry={integralGeo} position={[-0.35, 0, -0.06]}>
        <meshStandardMaterial color="#99f6e4" emissive="#14b8a6" emissiveIntensity={0.4} roughness={0.2} metalness={0.4} />
      </mesh>
      {/* x — two crossed bars */}
      <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.04, 0.3, 0.1]} />
        <meshStandardMaterial color="#5eead4" emissive="#0d9488" emissiveIntensity={0.35} roughness={0.25} metalness={0.35} />
      </mesh>
      <mesh position={[0.05, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.04, 0.3, 0.1]} />
        <meshStandardMaterial color="#5eead4" emissive="#0d9488" emissiveIntensity={0.35} roughness={0.25} metalness={0.35} />
      </mesh>
      {/* ² — small raised square */}
      <mesh position={[0.2, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.08]} />
        <meshStandardMaterial color="#5eead4" emissive="#0d9488" emissiveIntensity={0.35} roughness={0.25} metalness={0.35} />
      </mesh>
      {/* dx — small bar */}
      <mesh position={[0.38, -0.05, 0]}>
        <boxGeometry args={[0.04, 0.18, 0.08]} />
        <meshStandardMaterial color="#99f6e4" emissive="#14b8a6" emissiveIntensity={0.3} roughness={0.25} metalness={0.35} />
      </mesh>
      <mesh position={[0.48, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.03, 0.2, 0.08]} />
        <meshStandardMaterial color="#99f6e4" emissive="#14b8a6" emissiveIntensity={0.3} roughness={0.25} metalness={0.35} />
      </mesh>
      <mesh position={[0.48, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.03, 0.2, 0.08]} />
        <meshStandardMaterial color="#99f6e4" emissive="#14b8a6" emissiveIntensity={0.3} roughness={0.25} metalness={0.35} />
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

// ═══ Terminal ═══
function TerminalModel() {
  const { ref, hovered, setHovered } = useFloatAndScroll()
  const cursorRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!cursorRef.current) return
    cursorRef.current.visible = Math.sin(state.clock.elapsedTime * 4) > 0
  })
  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <boxGeometry args={[1.1, 0.85, 0.1]} />
        <meshStandardMaterial color="#6b7280" emissive="#4b5563" emissiveIntensity={0.2} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0.06]}>
        <planeGeometry args={[0.92, 0.68]} />
        <meshStandardMaterial color="#064e3b" emissive="#22c55e" emissiveIntensity={hovered ? 1.2 : 0.8} roughness={0.9} />
      </mesh>
      {[0.22, 0.12, 0.02, -0.08, -0.18].map((y, i) => (
        <mesh key={i} position={[-0.15 + (i % 3) * 0.03, y, 0.065]}>
          <boxGeometry args={[0.28 + (i % 2) * 0.2, 0.032, 0.001]} />
          <meshBasicMaterial color="#86efac" transparent opacity={0.8} />
        </mesh>
      ))}
      <mesh position={[-0.38, -0.22, 0.065]}>
        <boxGeometry args={[0.05, 0.03, 0.001]} />
        <meshBasicMaterial color="#86efac" />
      </mesh>
      <mesh ref={cursorRef} position={[-0.1, -0.22, 0.065]}>
        <boxGeometry args={[0.025, 0.04, 0.001]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
    </group>
  )
}

// ═══ Scene Router — FIXED: ap-csp not ap-computer-science-principles ═══
const MODELS: Record<string, () => JSX.Element> = {
  'ap-psychology': () => <BrainModel />,
  'ap-world-history': () => <GlobeModel />,
  'ap-government': () => <CapitolModel />,
  'ap-calculus-ab': () => <IntegralModel />,
  'ap-precalculus': () => <GraphModel />,
  'ap-csp': () => <TerminalModel />,
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
        <ambientLight intensity={2.0} />
        <directionalLight position={[3, 4, 5]} intensity={2.0} />
        <pointLight position={[-4, 2, 3]} intensity={1.0} color="#c4b5fd" />
        <pointLight position={[0, -3, 4]} intensity={0.6} color="#fde68a" />
        <ModelComponent />
      </Canvas>
    </div>
  )
}
