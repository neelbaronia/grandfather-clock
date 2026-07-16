import { ContactShadows, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { pendulumPeriod } from '../physics.js'

const WOOD = '#5c2f1d'
const WOOD_DARK = '#2b1711'
const WOOD_LIGHT = '#875139'
const BRASS = '#c8a55c'
const BRASS_LIGHT = '#f1d994'
const INK = '#231f19'
const CREAM = '#e9dfc5'

function WoodMaterial({ opacity = 1, color = WOOD, roughness = 0.48 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.04}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity > 0.35}
    />
  )
}

function BrassMaterial({ glow = false, opacity = 1 }) {
  return (
    <meshStandardMaterial
      color={glow ? BRASS_LIGHT : BRASS}
      emissive={glow ? '#6b4611' : '#000000'}
      emissiveIntensity={glow ? 0.45 : 0}
      metalness={0.78}
      roughness={0.24}
      transparent={opacity < 1}
      opacity={opacity}
    />
  )
}

function Gear({ radius = 0.4, teeth = 24, width = 0.09, color = BRASS, ...props }) {
  return (
    <group {...props}>
      <mesh>
        <torusGeometry args={[radius * 0.73, radius * 0.12, 8, 40]} />
        <meshStandardMaterial color={color} metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.15, radius * 0.15, width * 1.4, 18]} />
        <meshStandardMaterial color={color} metalness={0.76} roughness={0.25} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => (
        <mesh key={index} rotation={[0, 0, index * Math.PI / 3]} position={[0, 0, 0]}>
          <boxGeometry args={[radius * 1.45, radius * 0.075, width]} />
          <meshStandardMaterial color={color} metalness={0.72} roughness={0.28} />
        </mesh>
      ))}
      {Array.from({ length: teeth }, (_, index) => {
        const angle = index / teeth * Math.PI * 2
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[radius * 0.2, radius * 0.075, width]} />
            <meshStandardMaterial color={color} metalness={0.72} roughness={0.28} />
          </mesh>
        )
      })}
    </group>
  )
}

function Pendulum({ amplitude, length, emphasized = false }) {
  const swingRef = useRef()
  const visualLength = 2.15 * length
  const period = pendulumPeriod(length)
  const angle = Math.min(14, amplitude) * Math.PI / 180

  useFrame(({ clock }) => {
    if (swingRef.current) {
      swingRef.current.rotation.z = Math.sin(clock.elapsedTime * Math.PI * 2 / period) * angle
    }
  })

  return (
    <group ref={swingRef}>
      <mesh position={[0, -visualLength / 2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, visualLength, 12]} />
        <BrassMaterial glow={emphasized} />
      </mesh>
      <mesh position={[0, -visualLength, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.11, 48]} />
        <BrassMaterial glow={emphasized} />
      </mesh>
      <mesh position={[0, -visualLength, 0.065]}>
        <sphereGeometry args={[0.11, 24, 16]} />
        <BrassMaterial glow={emphasized} />
      </mesh>
    </group>
  )
}

function Dial({ opacity = 1 }) {
  const hourRef = useRef()
  const minuteRef = useRef()

  useFrame(() => {
    const now = new Date()
    const minutes = now.getMinutes() + now.getSeconds() / 60
    const hours = (now.getHours() % 12) + minutes / 60
    if (minuteRef.current) minuteRef.current.rotation.z = -minutes / 60 * Math.PI * 2
    if (hourRef.current) hourRef.current.rotation.z = -hours / 12 * Math.PI * 2
  })

  return (
    <group position={[0, 1.7, 0.56]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.01, 1.01, 0.08, 64]} />
        <meshStandardMaterial color={CREAM} roughness={0.64} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, 0.052]}>
        <torusGeometry args={[0.91, 0.028, 10, 64]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.26} transparent opacity={opacity} />
      </mesh>
      {Array.from({ length: 60 }, (_, index) => {
        const angle = index / 60 * Math.PI * 2
        const major = index % 5 === 0
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * 0.81, Math.cos(angle) * 0.81, 0.105]}
            rotation={[0, 0, -angle]}
          >
            <boxGeometry args={[major ? 0.035 : 0.014, major ? 0.15 : 0.075, 0.018]} />
            <meshStandardMaterial color={INK} transparent opacity={opacity * (major ? 0.92 : 0.58)} />
          </mesh>
        )
      })}
      <group ref={hourRef} position={[0, 0, 0.14]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.075, 0.56, 0.035]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </group>
      <group ref={minuteRef} position={[0, 0, 0.16]}>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.045, 0.76, 0.03]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.09, 24, 16]} />
        <BrassMaterial />
      </mesh>
    </group>
  )
}

function Weight({ x, height, glow = false, scale = 1 }) {
  const y = -2.25 + height * 1.42
  return (
    <group position={[x, 0, 0.16]} scale={scale}>
      <mesh position={[0, (y + 0.65) / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 2.6 - y, 8]} />
        <meshStandardMaterial color="#76664c" metalness={0.42} roughness={0.46} />
      </mesh>
      <mesh position={[0, y, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.68, 28]} />
        <BrassMaterial glow={glow} />
      </mesh>
      <mesh position={[0, y + 0.37, 0]}>
        <torusGeometry args={[0.08, 0.025, 8, 24]} />
        <BrassMaterial glow={glow} />
      </mesh>
    </group>
  )
}

function GoingTrain({ highlighted = false }) {
  const trainRef = useRef()
  useFrame(({ clock }) => {
    if (!trainRef.current) return
    const speed = highlighted ? 0.26 : 0.08
    trainRef.current.rotation.z = clock.elapsedTime * speed
  })
  const color = highlighted ? BRASS_LIGHT : BRASS
  return (
    <group position={[0, 0.64, 0.2]}>
      <group ref={trainRef}>
        <Gear radius={0.43} teeth={28} color={color} />
      </group>
      <Gear position={[-0.55, 0.38, 0.03]} radius={0.25} teeth={18} color={color} rotation={[0, 0, 0.3]} />
      <Gear position={[0.5, 0.46, 0.05]} radius={0.2} teeth={16} color={color} />
    </group>
  )
}

function ClockCase({ opacity = 1 }) {
  return (
    <group>
      <RoundedBox args={[2.8, 0.42, 1.0]} radius={0.09} position={[0, -3.05, 0]} castShadow>
        <WoodMaterial opacity={opacity} color={WOOD_DARK} />
      </RoundedBox>
      <RoundedBox args={[2.42, 0.34, 0.84]} radius={0.06} position={[0, -2.7, 0]} castShadow>
        <WoodMaterial opacity={opacity} />
      </RoundedBox>
      <mesh position={[0, -0.92, -0.3]} receiveShadow>
        <boxGeometry args={[2.2, 3.52, 0.24]} />
        <WoodMaterial opacity={opacity} color={WOOD_DARK} />
      </mesh>
      <RoundedBox args={[0.26, 3.7, 0.73]} radius={0.08} position={[-1.12, -0.91, 0]} castShadow>
        <WoodMaterial opacity={opacity} color={WOOD_LIGHT} />
      </RoundedBox>
      <RoundedBox args={[0.26, 3.7, 0.73]} radius={0.08} position={[1.12, -0.91, 0]} castShadow>
        <WoodMaterial opacity={opacity} color={WOOD_LIGHT} />
      </RoundedBox>
      <RoundedBox args={[2.3, 0.25, 0.76]} radius={0.05} position={[0, 0.9, 0]}>
        <WoodMaterial opacity={opacity} />
      </RoundedBox>
      <RoundedBox args={[2.95, 2.34, 1.02]} radius={0.16} position={[0, 1.74, -0.02]} castShadow>
        <WoodMaterial opacity={opacity} />
      </RoundedBox>
      <mesh position={[0, 2.85, -0.02]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[2.1, 2.1, 0.98]} />
        <WoodMaterial opacity={opacity} />
      </mesh>
      <mesh position={[0, 1.73, 0.53]}>
        <torusGeometry args={[1.12, 0.12, 12, 64]} />
        <WoodMaterial opacity={opacity} color={WOOD_DARK} />
      </mesh>
      <mesh position={[0, -0.9, 0.44]}>
        <boxGeometry args={[1.84, 3.18, 0.045]} />
        <meshPhysicalMaterial
          color="#adc2bd"
          roughness={0.08}
          transmission={0.78}
          transparent
          opacity={0.2 * opacity}
          thickness={0.05}
          depthWrite={false}
        />
      </mesh>
      <RoundedBox args={[2.28, 0.18, 0.72]} radius={0.04} position={[0, -2.5, 0.18]}>
        <WoodMaterial opacity={opacity} />
      </RoundedBox>
    </group>
  )
}

function EnergyFlow({ visible }) {
  const dots = useRef([])
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.58, -1.25, 0.62),
    new THREE.Vector3(-0.58, 0.36, 0.62),
    new THREE.Vector3(-0.3, 1.03, 0.68),
    new THREE.Vector3(0.24, 1.03, 0.68),
    new THREE.Vector3(0, 0.38, 0.72),
    new THREE.Vector3(0, -0.5, 0.68),
  ]), [])

  useFrame(({ clock }) => {
    if (!visible) return
    dots.current.forEach((dot, index) => {
      if (!dot) return
      const point = path.getPoint((clock.elapsedTime * 0.18 + index / dots.current.length) % 1)
      dot.position.copy(point)
    })
  })

  if (!visible) return null
  return (
    <group>
      {Array.from({ length: 11 }, (_, index) => (
        <mesh key={index} ref={(node) => { dots.current[index] = node }}>
          <sphereGeometry args={[0.045, 14, 10]} />
          <meshBasicMaterial color="#ffd66f" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function ClockModel({ active, amplitude, length, weightHeight }) {
  const rootRef = useRef()
  const { size } = useThree()
  const isMobile = size.width < 760
  const caseOpacity = active <= 2 ? 0.06 : active === 3 || active === 4 ? 0.09
    : active === 6 || active === 7 || active === 8 ? 0.22 : 1
  const focused = active >= 3 && active <= 8
  const rightHandChapter = [2, 4, 6, 8].includes(active)
  const xTarget = focused ? (isMobile ? 0.35 : (rightHandChapter ? -1.22 : 1.22)) : 0

  useFrame(() => {
    if (!rootRef.current) return
    rootRef.current.position.x = THREE.MathUtils.lerp(rootRef.current.position.x, xTarget, 0.055)
    const scaleTarget = active === 0 || active === 9 ? 0.92 : active === 6 ? 0.78 : 0.88
    const nextScale = THREE.MathUtils.lerp(rootRef.current.scale.x, scaleTarget, 0.05)
    rootRef.current.scale.setScalar(nextScale)
  })

  return (
    <group ref={rootRef} position={[0, -0.05, 0]} scale={0.92}>
      <ClockCase opacity={caseOpacity} />
      <Dial opacity={active === 3 || active === 4 || active === 6 || active === 7 || active === 8 ? 0.2 : 1} />
      <group position={[0, 0.67, 0.28]}>
        <Pendulum amplitude={amplitude} length={length} emphasized={active === 3 || active === 4 || active === 5} />
      </group>
      <GoingTrain highlighted={active === 6 || active === 8} />
      <Weight x={-0.58} height={weightHeight} glow={active === 7 || active === 8} />
      <Weight x={0} height={Math.max(0.32, weightHeight - 0.16)} glow={active === 7} scale={0.94} />
      <Weight x={0.58} height={Math.max(0.25, weightHeight - 0.29)} glow={active === 7} scale={0.97} />
      <EnergyFlow visible={active === 8} />
    </group>
  )
}

function Sundial() {
  return (
    <group position={[-1.5, -0.8, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.76, 0.12, 48]} />
        <meshStandardMaterial color="#b9a57c" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[0, 0, -0.32]}>
        <coneGeometry args={[0.12, 0.85, 3]} />
        <meshStandardMaterial color="#705d43" roughness={0.65} />
      </mesh>
    </group>
  )
}

function WaterClock() {
  return (
    <group position={[0, -0.55, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.34, 0.55, 0.74, 32, 1, true]} />
        <meshStandardMaterial color="#9b7c57" roughness={0.54} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.5, 0.34, 0.65, 32, 1, true]} />
        <meshStandardMaterial color="#9b7c57" roughness={0.54} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.06, 16, 10]} />
        <meshPhysicalMaterial color="#74a7b8" transmission={0.6} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function CandleClock() {
  const flameRef = useRef()
  useFrame(({ clock }) => {
    if (flameRef.current) flameRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 8) * 0.12
  })
  return (
    <group position={[1.5, -0.65, 0]}>
      <mesh>
        <cylinderGeometry args={[0.24, 0.27, 1.28, 28]} />
        <meshStandardMaterial color="#d9cba4" roughness={0.82} />
      </mesh>
      {[-0.38, -0.12, 0.14, 0.4].map((y) => (
        <mesh key={y} position={[0, y, 0.245]}>
          <boxGeometry args={[0.23, 0.018, 0.012]} />
          <meshStandardMaterial color="#725b3c" />
        </mesh>
      ))}
      <mesh ref={flameRef} position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.12, 18, 12]} />
        <meshBasicMaterial color="#ffb63d" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Timekeepers({ visible }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.22) * 0.08
  })
  if (!visible) return null
  return (
    <group ref={ref} position={[1.05, 0.05, 1]}>
      <Sundial />
      <WaterClock />
      <CandleClock />
      <mesh position={[0, -1.28, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.12, 1.8]} />
        <meshStandardMaterial color="#332820" roughness={0.72} />
      </mesh>
    </group>
  )
}

function FrequencyField({ visible }) {
  const rings = useRef([])
  useFrame(({ clock }) => {
    if (!visible) return
    rings.current.forEach((ring, index) => {
      if (!ring) return
      const pulse = (clock.elapsedTime * 0.42 + index / rings.current.length) % 1
      ring.scale.setScalar(0.35 + pulse * 3.2)
      ring.material.opacity = (1 - pulse) * 0.7
    })
  })
  if (!visible) return null
  return (
    <group position={[-1.1, -0.15, 0.8]}>
      <mesh>
        <sphereGeometry args={[0.28, 28, 18]} />
        <meshStandardMaterial color={BRASS_LIGHT} emissive="#7a5517" emissiveIntensity={0.55} />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={index} ref={(node) => { rings.current[index] = node }}>
          <torusGeometry args={[0.5, 0.012, 8, 64]} />
          <meshBasicMaterial color="#e5c577" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[0, -2.0, 0]}>
        <boxGeometry args={[0.04, 3.5, 0.04]} />
        <meshBasicMaterial color="#c8a55c" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

function EscapementStudy({ visible, amplitude, length }) {
  const wheel = useRef()
  const anchor = useRef()
  const period = pendulumPeriod(length)
  useFrame(({ clock }) => {
    if (!visible) return
    const phase = clock.elapsedTime / period * Math.PI * 2
    if (wheel.current) wheel.current.rotation.z = Math.floor(clock.elapsedTime * 4) * -Math.PI / 15
    if (anchor.current) anchor.current.rotation.z = Math.sin(phase) * Math.min(0.13, amplitude * Math.PI / 180)
  })
  if (!visible) return null
  return (
    <group position={[-1.05, 0.5, 2]} scale={1.45}>
      <group ref={wheel}>
        <Gear radius={0.72} teeth={30} width={0.12} color={BRASS_LIGHT} />
      </group>
      <group ref={anchor} position={[0, 0.68, 0.18]}>
        <mesh rotation={[0, 0, -0.55]} position={[-0.43, -0.1, 0]}>
          <boxGeometry args={[0.76, 0.11, 0.12]} />
          <meshStandardMaterial color="#d9d0ba" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, 0, 0.55]} position={[0.43, -0.1, 0]}>
          <boxGeometry args={[0.76, 0.11, 0.12]} />
          <meshStandardMaterial color="#d9d0ba" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[-0.73, -0.32, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.2, 0.3, 0.15]} />
          <meshStandardMaterial color="#ebe1c8" metalness={0.35} />
        </mesh>
        <mesh position={[0.73, -0.32, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.2, 0.3, 0.15]} />
          <meshStandardMaterial color="#ebe1c8" metalness={0.35} />
        </mesh>
      </group>
    </group>
  )
}

function Scene({ active, amplitude, length, weightHeight }) {
  const { camera } = useThree()
  useFrame(() => {
    const zoomed = active === 6
    const target = new THREE.Vector3(0, zoomed ? 0.35 : 0.08, zoomed ? 8.6 : 10.2)
    camera.position.lerp(target, 0.045)
    camera.lookAt(0, zoomed ? 0.25 : 0, 0)
  })

  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[-4, 7, 6]} intensity={3.2} color="#ffe6b0" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[5, 2, 5]} intensity={2.0} color="#9ab5c8" />
      <pointLight position={[0, -1, 4]} intensity={1.4} color="#d69c55" />
      <ClockModel active={active} amplitude={amplitude} length={length} weightHeight={weightHeight} />
      <Timekeepers visible={active === 1} />
      <FrequencyField visible={active === 2} />
      <EscapementStudy visible={active === 6} amplitude={amplitude} length={length} />
      <ContactShadows position={[0, -3.23, 0]} opacity={0.42} scale={8} blur={2.6} far={5} color="#0a0807" />
    </>
  )
}

export default function ClockScene(props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.65]}
      camera={{ position: [0, 0.1, 10.2], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Scene {...props} />
    </Canvas>
  )
}
