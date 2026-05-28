'use client'

import { useMemo, Suspense, useRef, useCallback, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, GizmoViewcube, Environment } from '@react-three/drei'
import type { FloorPlan } from '@spaceplanner/engine'
import { buildScene } from '@spaceplanner/engine'
import { WallMesh } from './scene/WallMesh'
import { FloorMesh } from './scene/FloorMesh'
import { InstancedFurnitureGroup } from './scene/FurnitureMesh'
import { SceneGrid } from './scene/SceneGrid'
import { CameraController } from './scene/CameraController'
import { useEditorStore } from '@/lib/stores/editor-store'
import type { EnvPreset } from '@/lib/stores/editor-store'
import * as THREE from 'three'

const ENV_MAP: Record<EnvPreset, React.ComponentProps<typeof Environment>['preset']> = {
  studio: 'studio',
  forest: 'forest',
  city: 'city',
  sunset: 'sunset',
  night: 'night',
}

interface ThreeViewer3DProps {
  floorPlan: FloorPlan | null
  selectedId?: string | null
  onSelect?: (id: string | null) => void
}

// LOD 거리 임계값 (Three.js 단위 기준)
// 6000/15000으로 좁혀 고품질 렌더 범위를 줄이고 저품질 전환을 앞당김
const LOD_HIGH_DISTANCE = 6000
const LOD_MED_DISTANCE = 15000

// LOD 계산 throttle 간격 (ms) — 매 프레임 계산 불필요
const LOD_THROTTLE_MS = 80

// 카메라 진입 애니메이션 — 씬 첫 로드 시 위에서 아래로 내려오는 Spring 효과
function useCameraEntryAnimation() {
  const { camera, invalidate } = useThree()
  const startRef = useRef(false)
  const progressRef = useRef(0)
  const startPosRef = useRef<THREE.Vector3 | null>(null)
  const endPosRef = useRef<THREE.Vector3 | null>(null)

  useEffect(() => {
    if (startRef.current) return
    startRef.current = true
    // 시작: 위에서 2배 높이, 끝: 정규 카메라 위치
    startPosRef.current = new THREE.Vector3(0, 14000, 8000)
    endPosRef.current = new THREE.Vector3(0, 5000, 8000)
    camera.position.set(0, 14000, 8000)
    invalidate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    if (!startPosRef.current || !endPosRef.current) return
    if (progressRef.current >= 1) return

    // Spring-like easing: exponential ease-out
    progressRef.current = Math.min(progressRef.current + delta * 1.2, 1)
    const t = 1 - Math.pow(1 - progressRef.current, 3)

    camera.position.lerpVectors(startPosRef.current, endPosRef.current, t)
    invalidate()
  })
}

// 선택된 오브젝트로 카메라가 부드럽게 포커스 이동
// sceneData를 부모에서 받아 buildScene 중복 호출 제거
function useCameraFocusOnSelect(
  selectedId: string | null | undefined,
  sceneData: ReturnType<typeof buildScene> | null,
) {
  const { camera, invalidate } = useThree()
  const prevSelectedRef = useRef<string | null | undefined>(null)
  const targetRef = useRef<THREE.Vector3 | null>(null)
  const lerpProgressRef = useRef(1)

  useEffect(() => {
    if (selectedId === prevSelectedRef.current) return
    prevSelectedRef.current = selectedId

    if (!selectedId || !sceneData) return

    const wall = sceneData.walls.find(w => w.id === selectedId)
    const furniture = sceneData.furniture.find(f => f.id === selectedId)

    let focusPos: [number, number, number] | null = null

    if (wall && wall.segments.length > 0) {
      focusPos = wall.segments[0].position
    } else if (furniture) {
      focusPos = furniture.position
    }

    if (!focusPos) return

    const offset = new THREE.Vector3(focusPos[0], focusPos[1] + 2000, focusPos[2] + 5000)
    targetRef.current = offset
    lerpProgressRef.current = 0
    invalidate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  useFrame((_, delta) => {
    if (!targetRef.current || lerpProgressRef.current >= 1) return

    lerpProgressRef.current = Math.min(lerpProgressRef.current + delta * 2.5, 1)
    const t = 1 - Math.pow(1 - lerpProgressRef.current, 3)

    camera.position.lerp(targetRef.current, t * 0.04)
    invalidate()
  })
}

function CameraAnimations({
  selectedId,
  sceneData,
}: {
  selectedId?: string | null
  sceneData: ReturnType<typeof buildScene> | null
}) {
  useCameraEntryAnimation()
  useCameraFocusOnSelect(selectedId, sceneData)
  return null
}

/** 카메라 거리에 따라 LOD 레벨 반환: 'high' | 'medium' | 'low' */
function useCameraLod(): 'high' | 'medium' | 'low' {
  const lodRef = useRef<'high' | 'medium' | 'low'>('high')
  const lastCheckRef = useRef(0)
  const { camera, invalidate } = useThree()

  useFrame((_, __, xrFrame) => {
    // throttle: LOD_THROTTLE_MS마다 한 번만 거리 계산
    const now = xrFrame ? 0 : performance.now()
    if (now - lastCheckRef.current < LOD_THROTTLE_MS) return
    lastCheckRef.current = now

    const dist = camera.position.length()
    const next: 'high' | 'medium' | 'low' =
      dist < LOD_HIGH_DISTANCE ? 'high' : dist < LOD_MED_DISTANCE ? 'medium' : 'low'
    if (next !== lodRef.current) {
      lodRef.current = next
      invalidate()
    }
  })

  return lodRef.current
}

function SceneContent({
  floorPlan,
  selectedId,
  onSelect,
}: {
  floorPlan: FloorPlan
  selectedId?: string | null
  onSelect?: (id: string | null) => void
}) {
  const sceneData = useMemo(() => buildScene(floorPlan), [floorPlan])
  const lod = useCameraLod()

  return (
    <>
      <CameraAnimations selectedId={selectedId} sceneData={sceneData} />
      {sceneData.walls.map(wallData => (
        <WallMesh
          key={wallData.id}
          data={wallData}
          isSelected={wallData.id === selectedId}
          onClick={onSelect ? () => onSelect(wallData.id) : undefined}
          lod={lod}
        />
      ))}

      <FloorMesh floor={sceneData.floor} ceiling={sceneData.ceiling} />

      {/* 가구 전체를 InstancedMesh 1개로 렌더 — draw call N→1 */}
      <InstancedFurnitureGroup
        items={sceneData.furniture}
        selectedId={selectedId}
        onSelect={onSelect ?? undefined}
      />
    </>
  )
}

function EmptySceneHint() {
  return (
    <mesh position={[0, 500, 0]}>
      <boxGeometry args={[200, 200, 200]} />
      <meshStandardMaterial color="#c0c0c0" wireframe />
    </mesh>
  )
}

export function ThreeViewer3D({
  floorPlan,
  selectedId,
  onSelect,
}: ThreeViewer3DProps) {
  const controlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null)
  const showEnvironment = useEditorStore(s => s.showEnvironment)
  const envPreset = useEditorStore(s => s.envPreset)
  const handlePointerMissed = useCallback(() => onSelect?.(null), [onSelect])

  return (
    <div className="relative h-full w-full">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        shadows="soft"
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          logarithmicDepthBuffer: false,
        } as object}
        camera={{ position: [0, 5000, 8000], fov: 45, near: 10, far: 100000 }}
        onPointerMissed={handlePointerMissed}
      >
        <ambientLight intensity={showEnvironment ? 0.2 : 0.4} />
        <directionalLight
          position={[5000, 8000, 3000]}
          intensity={showEnvironment ? 0.5 : 0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={30000}
          shadow-camera-left={-8000}
          shadow-camera-right={8000}
          shadow-camera-top={8000}
          shadow-camera-bottom={-8000}
        />

        {/* Environment HDRI lighting */}
        {showEnvironment && (
          <Environment preset={ENV_MAP[envPreset]} background={false} />
        )}

        <SceneGrid showGrid />

        <Suspense fallback={null}>
          {floorPlan ? (
            <SceneContent
              floorPlan={floorPlan}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ) : (
            <EmptySceneHint />
          )}
        </Suspense>

        {/* Spline-style camera preset animation controller */}
        <CameraController controlsRef={controlsRef} />

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <OrbitControls
          ref={controlsRef as any}
          makeDefault
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2}
          minDistance={500}
          maxDistance={50000}
          enableDamping
          dampingFactor={0.08}
        />

        {/* Spline-style navigation cube — top-right corner */}
        <GizmoHelper alignment="top-right" margin={[72, 72]}>
          <GizmoViewcube />
        </GizmoHelper>
      </Canvas>

      {!floorPlan && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-lg bg-[hsl(var(--card))]/80 px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] backdrop-blur-sm">
            2D 에디터에서 도면을 그리면 3D로 표시됩니다
          </p>
        </div>
      )}
    </div>
  )
}
