'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

// ═══ Shared hover/float behavior ═══

function useFloatAndHover() {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = Math.sin(t * 0.8) * 0.12
    ref.current.rotation.y += hovered ? 0.015 : 0.004
    const targetScale = hovered ? 1.12 : 1
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })

  return { ref, hovered, setHovered }
}

// ═══ Brain — displaced sphere with folds ═══

function BrainModel() {
  const { ref, setHovered } = useFloatAndHover()

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.7, 64, 64)
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      // Create folds using layered sine waves
      const noise =
        Math.sin(v.x * 8 + v.y * 3) * 0.04 +
        Math.sin(v.y * 12 + v.z * 5) * 0.03 +
        Math.sin(v.z * 6 + v.x * 10) * 0.025 +
        Math.sin(v.x * 15 - v.y * 8) * 0.015
      v.normalize().multiplyScalar(0.7 + noise)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  // Center crease
  const creaseGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.72, 64, 64)
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      // Deep crease down the middle
      const crease = Math.exp(-v.x * v.x * 20) * 0.06
      v.normalize().multiplyScalar(0.7 - crease)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#d8b4fe" emissive="#7c3aed" emissiveIntensity={0.15} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh geometry={creaseGeo}>
        <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={0.1} roughness={0.7} metalness={0.05} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// ═══ Globe — sphere with meridians and equator ═══

function GlobeModel() {
  const { ref, setHovered } = useFloatAndHover()

  // Continents approximated as displaced patches
  const globeGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.65, 64, 64)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const v = new THREE.Vector3()
    const oceanColor = new THREE.Color('#0369a1')
    const landColor = new THREE.Color('#ca8a04')

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const lat = Math.asin(v.y / 0.65)
      const lon = Math.atan2(v.z, v.x)
      // Simple continent approximation using sine combinations
      const land =
        Math.sin(lon * 2 + 1) * Math.cos(lat * 3) * 0.5 +
        Math.sin(lon * 5 - lat * 2) * 0.3 +
        Math.sin(lat * 6 + lon * 3) * 0.2
      const isLand = land > 0.15
      const c = isLand ? landColor : oceanColor
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      // Slightly raise land
      if (isLand) {
        v.normalize().multiplyScalar(0.66)
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
        <meshStandardMaterial vertexColors roughness={0.5} metalness={0.2} emissive="#92400e" emissiveIntensity={0.08} />
      </mesh>
      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.66, 0.008, 8, 64]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
      </mesh>
      {/* Meridian */}
      <mesh>
        <torusGeometry args={[0.66, 0.006, 8, 64]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.25} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

// ═══ Capitol — building with columns and triangular roof ═══

function CapitolModel() {
  const { ref, setHovered } = useFloatAndHover()

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Base platform */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.6]} />
        <meshStandardMaterial color="#60a5fa" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Steps */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[1.0, 0.08, 0.5]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Columns */}
      {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.05, 0.0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.5, 12]} />
          <meshStandardMaterial color="#bae6fd" roughness={0.25} metalness={0.5} emissive="#0284c7" emissiveIntensity={0.1} />
        </mesh>
      ))}
      {/* Roof beam */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.5]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Triangular pediment */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 0.3, 3]} />
        <meshStandardMaterial color="#93c5fd" roughness={0.3} metalness={0.35} emissive="#0284c7" emissiveIntensity={0.08} />
      </mesh>
      {/* Dome */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.2} metalness={0.5} emissive="#38bdf8" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

// ═══ Flask — erlenmeyer with liquid and bubbles ═══

function FlaskModel() {
  const { ref, hovered, setHovered } = useFloatAndHover()
  const bubblesRef = useRef<THREE.Group>(null)

  const flaskGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0, -0.5),    // bottom center
      new THREE.Vector2(0.4, -0.5),  // bottom edge
      new THREE.Vector2(0.4, -0.45), // bottom round
      new THREE.Vector2(0.38, -0.3), // body taper start
      new THREE.Vector2(0.15, 0.2),  // neck taper
      new THREE.Vector2(0.12, 0.35), // neck
      new THREE.Vector2(0.12, 0.5),  // rim
      new THREE.Vector2(0.14, 0.52), // lip
      new THREE.Vector2(0.14, 0.54), // lip top
    ]
    return new THREE.LatheGeometry(points, 32)
  }, [])

  // Animate bubbles
  useFrame((state) => {
    if (!bubblesRef.current) return
    bubblesRef.current.children.forEach((bubble, i) => {
      const speed = hovered ? 0.015 : 0.005
      bubble.position.y += speed
      if (bubble.position.y > 0.15) {
        bubble.position.y = -0.4
        bubble.position.x = (Math.random() - 0.5) * 0.25
        bubble.position.z = (Math.random() - 0.5) * 0.25
      }
      const s = 0.015 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.005
      bubble.scale.setScalar(s * 100)
    })
  })

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Flask glass */}
      <mesh geometry={flaskGeo}>
        <meshPhysicalMaterial
          color="#fed7aa"
          transparent
          opacity={0.25}
          roughness={0.05}
          metalness={0.1}
          transmission={0.6}
          thickness={0.5}
        />
      </mesh>
      {/* Liquid */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.28, 0.38, 0.45, 32]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.3} transparent opacity={0.7} roughness={0.3} />
      </mesh>
      {/* Bubbles */}
      <group ref={bubblesRef}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 0.2, -0.4 + i * 0.1, (Math.random() - 0.5) * 0.2]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ═══ Integral — 3D extruded ∫ symbol ═══

function IntegralModel() {
  const { ref, setHovered } = useFloatAndHover()

  const integralGeo = useMemo(() => {
    const shape = new THREE.Shape()
    // Draw the ∫ shape as a path
    shape.moveTo(0.1, 0.5)
    shape.bezierCurveTo(0.1, 0.6, -0.05, 0.6, -0.05, 0.5)
    shape.bezierCurveTo(-0.05, 0.35, 0.08, 0.15, 0.08, 0)
    shape.bezierCurveTo(0.08, -0.15, -0.05, -0.35, -0.05, -0.5)
    shape.bezierCurveTo(-0.05, -0.6, 0.1, -0.6, 0.1, -0.5)
    // Make it a thick stroke by offsetting
    shape.lineTo(0.18, -0.5)
    shape.bezierCurveTo(0.18, -0.55, 0.0, -0.55, 0.0, -0.5)
    shape.bezierCurveTo(0.0, -0.35, 0.16, -0.15, 0.16, 0)
    shape.bezierCurveTo(0.16, 0.15, 0.0, 0.35, 0.0, 0.5)
    shape.bezierCurveTo(0.0, 0.55, 0.18, 0.55, 0.18, 0.5)
    shape.lineTo(0.1, 0.5)

    const settings = { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }
    return new THREE.ExtrudeGeometry(shape, settings)
  }, [])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={1.3}>
      <mesh geometry={integralGeo} position={[-0.06, 0, -0.07]}>
        <meshStandardMaterial color="#5eead4" emissive="#0d9488" emissiveIntensity={0.2} roughness={0.25} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ═══ Graph — 3D function curve on a grid ═══

function GraphModel() {
  const { ref, setHovered } = useFloatAndHover()

  const curvePoints = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = -20; i <= 20; i++) {
      const x = i * 0.04
      const y = Math.sin(x * 3) * 0.25 + Math.cos(x * 1.5) * 0.1
      pts.push(new THREE.Vector3(x, y, 0))
    }
    return pts
  }, [])

  const curveGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(curvePoints)
    return new THREE.TubeGeometry(curve, 64, 0.02, 8, false)
  }, [curvePoints])

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Grid plane */}
      <mesh rotation={[0, 0, 0]} position={[0, -0.05, -0.05]}>
        <planeGeometry args={[1.6, 1, 8, 5]} />
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.12} />
      </mesh>
      {/* Axes */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.008, 0.008]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.008, 0.8, 0.008]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.4} />
      </mesh>
      {/* Function curve */}
      <mesh geometry={curveGeo}>
        <meshStandardMaterial color="#a5b4fc" emissive="#6366f1" emissiveIntensity={0.4} roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  )
}

// ═══ Terminal — monitor with glowing screen ═══

function TerminalModel() {
  const { ref, hovered, setHovered } = useFloatAndHover()
  const screenRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!screenRef.current) return
    const mat = screenRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = hovered ? 0.6 : 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05
  })

  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Monitor body */}
      <mesh>
        <boxGeometry args={[0.9, 0.65, 0.08]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.02, 0.045]}>
        <planeGeometry args={[0.78, 0.52]} />
        <meshStandardMaterial color="#052e16" emissive="#22c55e" emissiveIntensity={0.3} roughness={0.9} />
      </mesh>
      {/* Screen text lines */}
      {[0.15, 0.05, -0.05, -0.15].map((y, i) => (
        <mesh key={i} position={[-0.15 + i * 0.02, y, 0.05]}>
          <boxGeometry args={[0.3 + (i % 2) * 0.15, 0.02, 0.001]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.5 - i * 0.08} />
        </mesh>
      ))}
      {/* Cursor blink */}
      <mesh position={[0.15, -0.15, 0.05]}>
        <boxGeometry args={[0.015, 0.03, 0.001]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
      {/* Stand */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
        <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.5} />
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

function FallbackModel() {
  const { ref, setHovered } = useFloatAndHover()
  return (
    <group ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <icosahedronGeometry args={[0.6, 2]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.15} roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

function SetCursor() {
  const { gl } = useThree()
  return (
    <mesh
      visible={false}
      onPointerOver={() => { gl.domElement.style.cursor = 'pointer' }}
      onPointerOut={() => { gl.domElement.style.cursor = 'default' }}
    >
      <sphereGeometry args={[10]} />
    </mesh>
  )
}

export default function SubjectScene({ subject, size }: { subject: string; size: number }) {
  const ModelComponent = MODELS[subject] ?? FallbackModel

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2.8], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.9} />
        <pointLight position={[-3, -2, 3]} intensity={0.3} color="#a78bfa" />
        <pointLight position={[0, -4, 2]} intensity={0.2} color="#818cf8" />
        <ModelComponent />
        <SetCursor />
      </Canvas>
    </div>
  )
}
