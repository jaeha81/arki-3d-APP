'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, PresentationControls, Environment } from '@react-three/drei'
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

// 벽 세그먼트 하나
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

// 간단한 가구 박스
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

// 마우스 추적 평면도 씬
function FloorPlanScene({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    // 마우스 위치에 따라 subtle 회전 (Spline 인터랙티브 스타일)
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
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 바닥 */}
      <FloorPlane />

      {/* 외벽 — L자형 평면도 */}
      {/* 북쪽 벽 */}
      <Wall pos={[0, 0.15, -2.9]} size={[8, 0.3, 0.15]} />
      {/* 남쪽 벽 */}
      <Wall pos={[0, 0.15, 2.9]} size={[8, 0.3, 0.15]} />
      {/* 서쪽 벽 */}
      <Wall pos={[-3.9, 0.15, 0]} size={[0.15, 0.3, 6]} />
      {/* 동쪽 벽 */}
      <Wall pos={[3.9, 0.15, 0]} size={[0.15, 0.3, 6]} />
      {/* 내부 칸막이 벽 */}
      <Wall pos={[0.5, 0.15, 0.2]} size={[0.12, 0.3, 3.0]} color="#d8d6d2" />
      <Wall pos={[-1.2, 0.15, -0.9]} size={[3.0, 0.12, 0.12]} color="#d8d6d2" />

      {/* 거실 가구 */}
      <FurnitureBox pos={[-2.0, 0.15, 1.5]} size={[1.6, 0.3, 0.7]} color="#8b7355" />
      {/* 소파 등받이 */}
      <FurnitureBox pos={[-2.0, 0.3, 1.9]} size={[1.6, 0.25, 0.15]} color="#7a6448" />
      {/* 커피 테이블 */}
      <FurnitureBox pos={[-2.0, 0.1, 0.9]} size={[0.8, 0.08, 0.5]} color="#c4a882" />

      {/* 침실 가구 */}
      <FurnitureBox pos={[2.2, 0.18, -1.5]} size={[1.2, 0.36, 1.8]} color="#b0a898" />
      <FurnitureBox pos={[2.2, 0.22, -2.3]} size={[1.2, 0.45, 0.2]} color="#a09888" />
      {/* 책상 */}
      <FurnitureBox pos={[1.0, 0.15, -2.2]} size={[0.9, 0.08, 0.5]} color="#d4c4a8" rotY={0} />

      {/* 주방 */}
      <FurnitureBox pos={[-1.5, 0.2, -2.5]} size={[2.0, 0.4, 0.5]} color="#e8e4dc" />
      {/* 아일랜드 */}
      <FurnitureBox pos={[-1.5, 0.18, -1.6]} size={[1.0, 0.36, 0.5]} color="#f0ece4" />

      {/* 창문 — 빛나는 사각형 패널 */}
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

// autoRotate + 마우스 추적 컨트롤러
function SceneController({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  return <FloorPlanScene mouse={mouse} />
}

// Canvas를 감싸는 클라이언트 컴포넌트
export function HeroScene3D() {
  const mouseRef = useRef<[number, number]>([0, 0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      // -1 ~ 1 범위로 정규화
      mouseRef.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      ]
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!mounted) return null

  return (
    <div className="h-full w-full" style={{ touchAction: 'none' }}>
      <Canvas
        frameloop="always"
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

        {/* Spline 스타일 ambient environment */}
        <Environment preset="apartment" />

        <Float
          speed={0.6}
          rotationIntensity={0.08}
          floatIntensity={0.15}
        >
          <SceneController mouse={mouseRef} />
        </Float>
      </Canvas>
    </div>
  )
}
