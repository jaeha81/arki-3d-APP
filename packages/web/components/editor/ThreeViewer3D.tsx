'use client'

import { useMemo, Suspense, useRef, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { FloorPlan } from '@spaceplanner/engine'
import { buildScene } from '@spaceplanner/engine'
import { WallMesh } from './scene/WallMesh'
import { FloorMesh } from './scene/FloorMesh'
import { FurnitureMesh } from './scene/FurnitureMesh'
import { SceneGrid } from './scene/SceneGrid'

interface ThreeViewer3DProps {
  floorPlan: FloorPlan | null
  selectedId?: string | null
  onSelect?: (id: string | null) => void
}

// LOD 거리 임계값 (Three.js 단위 기준)
const LOD_HIGH_DISTANCE = 8000
const LOD_MED_DISTANCE = 20000

/** 카메라 거리에 따라 LOD 레벨 반환: 'high' | 'medium' | 'low' */
function useCameraLod(): 'high' | 'medium' | 'low' {
  const lodRef = useRef<'high' | 'medium' | 'low'>('high')
  const { camera, invalidate } = useThree()

  useFrame(() => {
    const dist = camera.position.length()
    const next: 'high' | 'medium' | 'low' =
      dist < LOD_HIGH_DISTANCE ? 'high' : dist < LOD_MED_DISTANCE ? 'medium' : 'low'
    if (next !== lodRef.current) {
      lodRef.current = next
      invalidate() // LOD 변경 시 한 프레임 강제 렌더
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

      {sceneData.furniture.map(item => (
        <FurnitureMesh
          key={item.id}
          item={item}
          isSelected={item.id === selectedId}
          onClick={onSelect ? () => onSelect(item.id) : undefined}
          lod={lod}
        />
      ))}
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
  // 인터랙션 없을 때 frameloop="demand"로 RAF 일시중단 (Canvas 레벨에서 이미 처리)
  // OrbitControls change → invalidate() 자동 호출됨
  const handlePointerMissed = useCallback(() => onSelect?.(null), [onSelect])

  return (
    <div className="relative h-full w-full">
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        shadows="soft"
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          // 미사용 WebGL 객체 자동 정리
          logarithmicDepthBuffer: false,
        } as object}
        camera={{ position: [0, 5000, 8000], fov: 45, near: 10, far: 100000 }}
        onPointerMissed={handlePointerMissed}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5000, 8000, 3000]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50000}
          shadow-camera-left={-10000}
          shadow-camera-right={10000}
          shadow-camera-top={10000}
          shadow-camera-bottom={-10000}
        />

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

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2}
          minDistance={500}
          maxDistance={50000}
          // 컨트롤 변경 시 한 프레임 강제 렌더 (frameloop="demand"와 조화)
          enableDamping
          dampingFactor={0.08}
        />
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
