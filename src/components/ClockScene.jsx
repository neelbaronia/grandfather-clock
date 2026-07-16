import { ContactShadows, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { pendulumPeriod } from '../physics.js'

const WOOD = '#7a3f27'
const WOOD_DARK = '#351c17'
const WOOD_LIGHT = '#ac6b3c'
const BRASS = '#b98a36'
const BRASS_LIGHT = '#e0b957'
const INK = '#1f2928'
const CREAM = '#f0e3bd'

function WoodMaterial({ opacity = 1, color = WOOD, roughness = 0.48 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={Math.max(0.5, roughness)}
      metalness={0.03}
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
      emissive={glow ? '#6f4811' : '#000000'}
      emissiveIntensity={glow ? 0.28 : 0}
      metalness={0.46}
      roughness={0.34}
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
        <meshStandardMaterial color={color} metalness={0.42} roughness={0.36} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.15, radius * 0.15, width * 1.4, 18]} />
        <meshStandardMaterial color={color} metalness={0.45} roughness={0.34} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => (
        <mesh key={index} rotation={[0, 0, index * Math.PI / 3]} position={[0, 0, 0]}>
          <boxGeometry args={[radius * 1.45, radius * 0.075, width]} />
          <meshStandardMaterial color={color} metalness={0.42} roughness={0.36} />
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
            <meshStandardMaterial color={color} metalness={0.42} roughness={0.36} />
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
        <meshStandardMaterial color={CREAM} roughness={0.78} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, 0.052]}>
        <torusGeometry args={[0.91, 0.028, 10, 64]} />
        <meshStandardMaterial color={BRASS} metalness={0.44} roughness={0.34} transparent opacity={opacity} />
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
        <meshStandardMaterial color="#746047" metalness={0.28} roughness={0.46} />
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
      <RoundedBox args={[2.72, 0.4, 1.08]} radius={0.1} position={[0, 2.82, -0.02]} castShadow>
        <WoodMaterial opacity={opacity} color={WOOD_DARK} />
      </RoundedBox>
      <RoundedBox args={[2.28, 0.34, 0.98]} radius={0.09} position={[0, 3.12, -0.02]} castShadow>
        <WoodMaterial opacity={opacity} />
      </RoundedBox>
      <RoundedBox args={[1.66, 0.25, 0.86]} radius={0.08} position={[0, 3.36, -0.02]} castShadow>
        <WoodMaterial opacity={opacity} color={WOOD_LIGHT} />
      </RoundedBox>
      <mesh position={[0, 1.73, 0.53]}>
        <torusGeometry args={[1.12, 0.12, 12, 64]} />
        <WoodMaterial opacity={opacity} color={WOOD_DARK} />
      </mesh>
      <mesh position={[0, -0.9, 0.44]}>
        <boxGeometry args={[1.84, 3.18, 0.045]} />
        <meshPhysicalMaterial
          color="#d7e4df"
          roughness={0.14}
          transmission={0.7}
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
  const caseOpacity = active === 0 ? (isMobile ? 0.22 : 1) : active <= 2 ? 0.06 : active === 3 || active === 4 ? 0.09
    : active === 6 || active === 7 || active === 8 ? 0.22 : 1
  const focused = active >= 3 && active <= 8
  const isolatePendulum = active === 3 || active === 4
  const rightHandChapter = [2, 4, 6, 8].includes(active)
  const xTarget = active === 0
    ? (isMobile ? 0.2 : 1.05)
    : focused ? (isMobile ? 0.35 : (rightHandChapter ? -1.22 : 1.22)) : 0

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
      <Dial opacity={isolatePendulum ? 0.06 : active === 6 || active === 7 || active === 8 ? 0.2 : 1} />
      <group position={[0, 0.67, 0.28]}>
        <Pendulum amplitude={amplitude} length={length} emphasized={active === 3 || active === 4 || active === 5} />
      </group>
      {!isolatePendulum && <GoingTrain highlighted={active === 6 || active === 8} />}
      {!isolatePendulum && <Weight x={-0.58} height={weightHeight} glow={active === 7 || active === 8} />}
      {!isolatePendulum && <Weight x={0} height={Math.max(0.32, weightHeight - 0.16)} glow={active === 7} scale={0.94} />}
      {!isolatePendulum && <Weight x={0.58} height={Math.max(0.25, weightHeight - 0.29)} glow={active === 7} scale={0.97} />}
      <EnergyFlow visible={active === 8} />
    </group>
  )
}

function Sundial() {
  return (
    <group position={[-1.5, -0.8, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.76, 0.12, 48]} />
        <meshStandardMaterial color="#d8b983" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[0, 0, -0.32]}>
        <coneGeometry args={[0.12, 0.85, 3]} />
        <meshStandardMaterial color="#9b7050" roughness={0.72} />
      </mesh>
    </group>
  )
}

function WaterClock() {
  return (
    <group position={[0, -0.55, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.34, 0.55, 0.74, 32, 1, true]} />
        <meshStandardMaterial color="#c8956f" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.5, 0.34, 0.65, 32, 1, true]} />
        <meshStandardMaterial color="#c8956f" roughness={0.7} side={THREE.DoubleSide} />
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
        <meshStandardMaterial color="#f0dfb9" roughness={0.88} />
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
        <meshStandardMaterial color="#d9ccc0" roughness={0.86} />
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
          <meshStandardMaterial color="#e5d6bd" metalness={0.05} roughness={0.52} />
        </mesh>
        <mesh rotation={[0, 0, 0.55]} position={[0.43, -0.1, 0]}>
          <boxGeometry args={[0.76, 0.11, 0.12]} />
          <meshStandardMaterial color="#e5d6bd" metalness={0.05} roughness={0.52} />
        </mesh>
        <mesh position={[-0.73, -0.32, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.2, 0.3, 0.15]} />
          <meshStandardMaterial color="#f3e8d2" metalness={0.03} roughness={0.5} />
        </mesh>
        <mesh position={[0.73, -0.32, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.2, 0.3, 0.15]} />
          <meshStandardMaterial color="#f3e8d2" metalness={0.03} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function useRoomTextures() {
  return useMemo(() => {
    const makeCanvas = (size, background) => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      context.fillStyle = background
      context.fillRect(0, 0, size, size)
      return { canvas, context }
    }

    const wallpaperCanvas = makeCanvas(320, '#e9dfbd')
    const wallpaperContext = wallpaperCanvas.context
    wallpaperContext.strokeStyle = 'rgba(36, 52, 48, .34)'
    wallpaperContext.lineWidth = 1.2
    for (let x = 6; x < 320; x += 12) {
      wallpaperContext.beginPath()
      for (let y = 0; y <= 320; y += 5) {
        const wave = Math.sin(y * 0.075 + x) * 1.8
        if (y === 0) wallpaperContext.moveTo(x + wave, y)
        else wallpaperContext.lineTo(x + wave, y)
      }
      wallpaperContext.stroke()
    }
    for (let x = 32; x < 320; x += 80) {
      for (let y = 34; y < 320; y += 82) {
        wallpaperContext.strokeStyle = 'rgba(126, 43, 34, .34)'
        wallpaperContext.beginPath()
        wallpaperContext.arc(x, y, 8, 0, Math.PI * 2)
        wallpaperContext.arc(x - 7, y + 4, 5, 0, Math.PI * 2)
        wallpaperContext.arc(x + 7, y + 4, 5, 0, Math.PI * 2)
        wallpaperContext.stroke()
      }
    }
    const wallpaper = new THREE.CanvasTexture(wallpaperCanvas.canvas)
    wallpaper.wrapS = wallpaper.wrapT = THREE.RepeatWrapping
    wallpaper.repeat.set(5.5, 3.4)
    wallpaper.colorSpace = THREE.SRGBColorSpace

    const floorCanvas = makeCanvas(256, '#9a5a2f')
    const floorContext = floorCanvas.context
    for (let y = 0; y < 256; y += 32) {
      floorContext.fillStyle = y % 64 === 0 ? '#9a5a2f' : '#a86536'
      floorContext.fillRect(0, y, 256, 31)
      floorContext.strokeStyle = '#63351f'
      floorContext.lineWidth = 2
      floorContext.beginPath()
      floorContext.moveTo(0, y + 31)
      floorContext.lineTo(256, y + 31)
      floorContext.stroke()
      floorContext.strokeStyle = 'rgba(48, 26, 18, .28)'
      floorContext.lineWidth = 1
      for (let x = 0; x < 256; x += 36) {
        floorContext.beginPath()
        floorContext.moveTo(x, y + 7 + Math.sin(x + y) * 3)
        floorContext.bezierCurveTo(x + 14, y + 3, x + 22, y + 17, x + 34, y + 11)
        floorContext.stroke()
      }
    }
    const floor = new THREE.CanvasTexture(floorCanvas.canvas)
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping
    floor.repeat.set(5, 5)
    floor.colorSpace = THREE.SRGBColorSpace

    const rugCanvas = makeCanvas(512, '#8f201f')
    const rugContext = rugCanvas.context
    rugContext.fillStyle = '#102f3a'
    rugContext.fillRect(0, 0, 512, 54)
    rugContext.fillRect(0, 458, 512, 54)
    rugContext.fillRect(0, 0, 54, 512)
    rugContext.fillRect(458, 0, 54, 512)
    rugContext.strokeStyle = '#e6aa3c'
    rugContext.lineWidth = 7
    rugContext.strokeRect(66, 66, 380, 380)
    rugContext.strokeStyle = '#e7d69e'
    rugContext.lineWidth = 3
    rugContext.strokeRect(24, 24, 464, 464)
    const motifColors = ['#0d5360', '#e2a43d', '#d9d2a2', '#1f4033']
    for (let y = 88; y <= 424; y += 56) {
      for (let x = 88; x <= 424; x += 56) {
        const color = motifColors[(x / 56 + y / 56) % motifColors.length]
        rugContext.save()
        rugContext.translate(x, y)
        rugContext.rotate(Math.PI / 4)
        rugContext.fillStyle = color
        rugContext.fillRect(-10, -10, 20, 20)
        rugContext.strokeStyle = '#351f1b'
        rugContext.lineWidth = 2
        rugContext.strokeRect(-10, -10, 20, 20)
        rugContext.restore()
      }
    }
    const starPath = (cx, cy, outer, inner, points = 12) => {
      rugContext.beginPath()
      for (let index = 0; index < points * 2; index += 1) {
        const radius = index % 2 === 0 ? outer : inner
        const angle = -Math.PI / 2 + index * Math.PI / points
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius
        if (index === 0) rugContext.moveTo(x, y)
        else rugContext.lineTo(x, y)
      }
      rugContext.closePath()
    }
    for (let index = 0; index < 18; index += 1) {
      const along = 44 + index * 25
      rugContext.fillStyle = index % 2 ? '#dba33d' : '#d8d19f'
      rugContext.beginPath()
      rugContext.arc(along, 27, 5, 0, Math.PI * 2)
      rugContext.arc(along, 485, 5, 0, Math.PI * 2)
      rugContext.fill()
      rugContext.beginPath()
      rugContext.arc(27, along, 5, 0, Math.PI * 2)
      rugContext.arc(485, along, 5, 0, Math.PI * 2)
      rugContext.fill()
    }
    ;[[116, 116], [396, 116], [116, 396], [396, 396]].forEach(([x, y]) => {
      starPath(x, y, 31, 16, 8)
      rugContext.fillStyle = '#d8a03a'
      rugContext.fill()
      rugContext.strokeStyle = '#163f47'
      rugContext.lineWidth = 4
      rugContext.stroke()
      rugContext.fillStyle = '#e9d89d'
      rugContext.beginPath()
      rugContext.arc(x, y, 7, 0, Math.PI * 2)
      rugContext.fill()
    })
    starPath(256, 256, 126, 82, 16)
    rugContext.fillStyle = '#d5a03a'
    rugContext.fill()
    rugContext.strokeStyle = '#e8d89e'
    rugContext.lineWidth = 7
    rugContext.stroke()
    starPath(256, 256, 93, 59, 12)
    rugContext.fillStyle = '#123e47'
    rugContext.fill()
    rugContext.strokeStyle = '#2b1f1a'
    rugContext.lineWidth = 4
    rugContext.stroke()
    starPath(256, 256, 55, 30, 10)
    rugContext.fillStyle = '#a52b29'
    rugContext.fill()
    rugContext.strokeStyle = '#e7d69e'
    rugContext.lineWidth = 4
    rugContext.stroke()
    rugContext.fillStyle = '#d8a23d'
    rugContext.beginPath()
    rugContext.arc(256, 256, 13, 0, Math.PI * 2)
    rugContext.fill()
    const rug = new THREE.CanvasTexture(rugCanvas.canvas)
    rug.colorSpace = THREE.SRGBColorSpace

    return { floor, rug, wallpaper }
  }, [])
}

function Bookcase() {
  const bookColors = ['#193c42', '#912e27', '#c18b33', '#e0c980', '#2f5960', '#6e3829']
  return (
    <group position={[-4.2, -1.28, -2.05]}>
      <mesh position={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[1.72, 4.15, 0.38]} />
        <WoodMaterial color="#4b291f" />
      </mesh>
      {[-1.78, -0.9, -0.02, 0.86, 1.74].map((y) => (
        <mesh key={y} position={[0, y, 0.17]} castShadow>
          <boxGeometry args={[1.82, 0.13, 0.56]} />
          <WoodMaterial color={WOOD_LIGHT} />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, index) => {
        const shelf = Math.floor(index / 6)
        const slot = index % 6
        const height = 0.45 + ((index * 7) % 5) * 0.055
        return (
          <mesh key={index} position={[-0.64 + slot * 0.255, -1.42 + shelf * 0.88 + height / 2, 0.38]}>
            <boxGeometry args={[0.19, height, 0.28 + (index % 2) * 0.04]} />
            <meshStandardMaterial color={bookColors[index % bookColors.length]} roughness={0.76} />
          </mesh>
        )
      })}
    </group>
  )
}

function LoungeChair() {
  return (
    <group position={[3.65, -2.64, -0.7]} rotation={[0, -0.42, 0]}>
      <RoundedBox args={[1.65, 0.45, 1.55]} radius={0.18} position={[0, 0.32, 0]} castShadow>
        <meshStandardMaterial color="#173a42" roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[1.65, 1.72, 0.38]} radius={0.18} position={[0, 1.23, -0.56]} rotation={[-0.12, 0, 0]} castShadow>
        <meshStandardMaterial color="#173a42" roughness={0.82} />
      </RoundedBox>
      {[-0.92, 0.92].map((x) => (
        <RoundedBox key={x} args={[0.28, 0.62, 1.55]} radius={0.12} position={[x, 0.58, 0]} castShadow>
          <meshStandardMaterial color="#173a42" roughness={0.82} />
        </RoundedBox>
      ))}
      {[-0.64, 0.64].map((x) => (
        <mesh key={x} position={[x, -0.13, 0.45]}>
          <cylinderGeometry args={[0.06, 0.08, 0.55, 10]} />
          <WoodMaterial color={WOOD_DARK} />
        </mesh>
      ))}
    </group>
  )
}

function HousePlant() {
  const leaves = [
    [-0.48, 0.65, 0, -0.45], [0.42, 0.73, 0.08, 0.48], [-0.22, 1.12, 0.1, -0.2],
    [0.35, 1.32, -0.04, 0.32], [-0.5, 1.55, 0.03, -0.56], [0.05, 1.82, 0.08, 0.08],
    [0.5, 1.72, 0, 0.55], [-0.3, 2.05, -0.04, -0.28], [0.25, 2.18, 0.05, 0.28],
  ]
  return (
    <group position={[3.95, -3.02, -2.0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.32, 0.72, 20]} />
        <meshStandardMaterial color="#a62f28" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 2.2, 10]} />
        <meshStandardMaterial color="#3f4d2a" roughness={0.75} />
      </mesh>
      {leaves.map(([x, y, z, rotation], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[0, 0, rotation]} scale={[1.5, 0.58, 0.45]} castShadow>
          <sphereGeometry args={[0.38, 16, 10]} />
          <meshStandardMaterial color={index % 3 === 0 ? '#244d3a' : '#356143'} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function FloorLamp() {
  return (
    <group position={[2.55, -2.38, -2.15]}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 3.1, 10]} />
        <meshStandardMaterial color="#2a211c" metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh position={[0, 3.03, 0]}>
        <coneGeometry args={[0.62, 0.72, 24, 1, true]} />
        <meshStandardMaterial color="#c59a37" side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      <pointLight position={[0, 2.82, 0]} intensity={0.72} distance={5.5} color="#ffd485" />
    </group>
  )
}

function FramedArt({ position, size = [1.3, 1.75], color = '#123b45' }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[size[0] + 0.16, size[1] + 0.16, 0.12]} />
        <WoodMaterial color="#6c3a23" />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => {
        const x = ((index * 37) % 100) / 100 * size[0] - size[0] / 2
        const y = ((index * 61) % 100) / 100 * size[1] - size[1] / 2
        return (
          <mesh key={index} position={[x, y, 0.085]} rotation={[0, 0, index * 0.7]}>
            <torusGeometry args={[0.09 + (index % 3) * 0.03, 0.018, 6, 18]} />
            <meshStandardMaterial color={index % 2 ? '#d6a13d' : '#a62f2b'} />
          </mesh>
        )
      })}
    </group>
  )
}

function CozyRoom() {
  const textures = useRoomTextures()
  return (
    <group>
      <mesh position={[0, 0.3, -2.58]} receiveShadow>
        <planeGeometry args={[13.5, 8.1]} />
        <meshStandardMaterial map={textures.wallpaper} roughness={0.96} />
      </mesh>
      <mesh position={[0, -3.5, 0.65]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8.2]} />
        <meshStandardMaterial map={textures.floor} roughness={0.74} />
      </mesh>
      <mesh position={[0.35, -3.47, 0.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.3, 4.4]} />
        <meshStandardMaterial map={textures.rug} roughness={0.92} />
      </mesh>
      <Bookcase />
      <LoungeChair />
      <HousePlant />
      <FloorLamp />
      <FramedArt position={[-2.55, 1.15, -2.48]} color="#153e48" />
      <FramedArt position={[3.5, 1.25, -2.48]} size={[1.05, 1.35]} color="#772722" />
      <mesh position={[0, 2.9, -2.48]}>
        <boxGeometry args={[1.8, 0.08, 0.12]} />
        <WoodMaterial color={WOOD_DARK} />
      </mesh>
    </group>
  )
}

function Scene({ active, amplitude, length, weightHeight }) {
  const { camera, size } = useThree()
  useFrame(() => {
    const zoomed = active === 6
    const target = new THREE.Vector3(7.8, zoomed ? 6.25 : 6.8, zoomed ? 9.2 : 10.4)
    camera.position.lerp(target, 0.045)
    const targetZoom = size.width < 760 ? (zoomed ? 84 : 88) : (zoomed ? 106 : 116)
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, targetZoom, 0.055)
    camera.updateProjectionMatrix()
    camera.lookAt(0, zoomed ? 0.2 : 0, 0)
  })

  return (
    <>
      <ambientLight intensity={1.9} color="#fff8ef" />
      <hemisphereLight args={['#fff8f0', '#c5b3a4', 1.15]} />
      <directionalLight position={[-5, 10, 8]} intensity={3.1} color="#fff2df" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002} />
      <directionalLight position={[7, 5, -3]} intensity={1.45} color="#c9d7dc" />
      <pointLight position={[1, 1, 5]} intensity={0.8} color="#ffd9a0" />
      <CozyRoom />
      <ClockModel active={active} amplitude={amplitude} length={length} weightHeight={weightHeight} />
      <Timekeepers visible={active === 1} />
      <FrequencyField visible={active === 2} />
      <EscapementStudy visible={active === 6} amplitude={amplitude} length={length} />
      <ContactShadows position={[0, -3.49, 0]} opacity={0.34} scale={10} blur={2.8} far={5} color="#33211a" />
    </>
  )
}

export default function ClockScene(props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.65]}
      orthographic
      camera={{ position: [7.8, 6.8, 10.4], zoom: 116, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Scene {...props} />
    </Canvas>
  )
}
