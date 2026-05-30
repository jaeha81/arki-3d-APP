'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ─── 평면도 구조물 — 실제 씬을 연상시키는 Spline 스타일 ───────────────────

function FloorPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color="#f0f0ee" roughness={0.9} metalness={0.0} />
    </mesh>
  )
}

function Wall({
  pos,
  size,
  color = '#e2e0dc',
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
    </mesh>
  )
}

function FurnitureBox({
  pos,
  size,
  color,
  rotY = 0,
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color: string
  rotY?: number
}) {
  return (
    <mesh position={pos} rotation={[0, rotY, 0]} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

// isVisible ref를 받아 화면에서 벗어나면 invalidate 중단
function FloorPlanScene({
  mouse,
  isVisibleRef,
}: {
  mouse: React.MutableRefObject<[number, number]>
  isVisibleRef: React.MutableRefObject<boolean>
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupRef = useRef<any>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const [mx, my] = mouse.current
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      my * 0.12 - 0.3,
      delta * 3,
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mx * 0.18,
      delta * 3,
    )
    // demand 모드에서 화면에 보일 때만 다음 프레임 요청
    if (isVisibleRef.current) {
      state.invalidate()
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <FloorPlane />
      <Wall pos={[0, 0.15, -2.9]} size={[8, 0.3, 0.15]} />
      <Wall pos={[0, 0.15, 2.9]} size={[8, 0.3, 0.15]} />
      <Wall pos={[-3.9, 0.15, 0]} size={[0.15, 0.3, 6]} />
      <Wall pos={[3.9, 0.15, 0]} size={[0.15, 0.3, 6]} />
      <Wall pos={[0.5, 0.15, 0.2]} size={[0.12, 0.3, 3.0]} color="#d8d6d2" />
      <Wall pos={[-1.2, 0.15, -0.9]} size={[3.0, 0.12, 0.12]} color="#d8d6d2" />
      <FurnitureBox pos={[-2.0, 0.15, 1.5]} size={[1.6, 0.3, 0.7]} color="#8b7355" />
      <FurnitureBox pos={[-2.0, 0.3, 1.9]} size={[1.6, 0.25, 0.15]} color="#7a6448" />
      <FurnitureBox pos={[-2.0, 0.1, 0.9]} size={[0.8, 0.08, 0.5]} color="#c4a882" />
      <FurnitureBox pos={[2.2, 0.18, -1.5]} size={[1.2, 0.36, 1.8]} color="#b0a898" />
      <FurnitureBox pos={[2.2, 0.22, -2.3]} size={[1.2, 0.45, 0.2]} color="#a09888" />
      <FurnitureBox pos={[1.0, 0.15, -2.2]} size={[0.9, 0.08, 0.5]} color="#d4c4a8" />
      <FurnitureBox pos={[-1.5, 0.2, -2.5]} size={[2.0, 0.4, 0.5]} color="#e8e4dc" />
      <FurnitureBox pos={[-1.5, 0.18, -1.6]} size={[1.0, 0.36, 0.5]} color="#f0ece4" />
      <mesh position={[-3.84, 0.25, -1.0]}>
        <planeGeometry args={[0.05, 0.5]} />
        <meshStandardMaterial color="#a8d4f0" emissive="#60b4e8" emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-3.84, 0.25, 0.6]}>
        <planeGeometry args={[0.05, 0.5]} />
        <meshStandardMaterial color="#a8d4f0" emissive="#60b4e8" emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

// visibility 변경 시 demand 루프를 재시작하는 킥스타터
function VisibilityDriver({ isVisibleRef }: { isVisibleRef: React.MutableRefObject<boolean> }) {
  const { invalidate } = useThree()
  useEffect(() => {
    if (isVisibleRef.current) invalidate()
  })
  return null
}

// prefers-reduced-motion 시 보여줄 정적 평면도 SVG
function StaticFloorPlan() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <svg viewBox="0 0 400 320" className="w-full h-full opacity-50" xmlns="http://www.w3.org/2000/svg">
        <polygon points="200,260 340,180 200,100 60,180" fill="#f0efeb" stroke="#d8d6d2" strokeWidth="1" />
        <polygon points="60,180 60,100 200,20 200,100" fill="#e8e6e2" stroke="#ccc" strokeWidth="1" />
        <polygon points="200,100 200,20 340,100 340,180" fill="#dddbd7" stroke="#ccc" strokeWidth="1" />
        <polygon points="80,200 80,180 140,148 140,168" fill="#9b8466" stroke="#7a6448" strokeWidth="0.8" />
        <polygon points="255,145 255,120 310,90 310,115" fill="#b8b0a0" stroke="#999" strokeWidth="0.8" />
      </svg>
    </div>
  )
}

export function HeroScene3D() {
  const mouseRef = useRef<[number, number]>([0, 0])
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisibleRef = useRef(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    setMounted(true)
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      ]
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // IntersectionObserver: 화면 밖이면 프레임 요청 중단
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting },
      { threshold: 0.1 },
    )
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  if (!mounted) return null

  if (prefersReducedMotion) {
    return <StaticFloorPlan />
  }

  return (
    <div ref={containerRef} className="h-full w-full" style={{ touchAction: 'none' }}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 6], fov: 42, near: 0.1, far: 100 }}
        shadows="soft"
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[4, 8, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-4, 3, -2]} intensity={0.4} color="#fff5e6" />
        <Environment preset="apartment" />

        <VisibilityDriver isVisibleRef={isVisibleRef} />

        <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.15}>
          <FloorPlanScene mouse={mouseRef} isVisibleRef={isVisibleRef} />
        </Float>
      </Canvas>
    </div>
  )
}
