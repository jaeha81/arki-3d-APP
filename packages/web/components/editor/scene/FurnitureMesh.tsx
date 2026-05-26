'use client'

import { Suspense, useMemo, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import {
  InstancedMesh,
  BoxGeometry,
  MeshStandardMaterial,
  Matrix4,
  Color,
  DynamicDrawUsage,
} from 'three'
import type { FurniturePlacement3D } from '@spaceplanner/engine'

type LodLevel = 'high' | 'medium' | 'low'

interface FurnitureMeshProps {
  item: FurniturePlacement3D
  gltfUrl?: string
  isSelected?: boolean
  onClick?: () => void
  lod?: LodLevel
}

// LOD별 박스 geometry 크기 (세그먼트 수 조정)
// high: 1×1×1 세그먼트 (기본 BoxGeometry는 이미 최소)
// low: 동일 형태이지만 flatShading 재질
const BOX_GEO_HIGH = new BoxGeometry(1000, 800, 600, 1, 1, 1)
const BOX_GEO_LOW = new BoxGeometry(1000, 800, 600, 1, 1, 1)
const MAT_DEFAULT = new MeshStandardMaterial({ color: '#a0a0a0' })
const MAT_DEFAULT_LOW = new MeshStandardMaterial({ color: '#a0a0a0', flatShading: true })
const MAT_SELECTED = new MeshStandardMaterial({ color: '#4a90d9' })

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene])
  return <primitive object={cloned} />
}

/**
 * PlaceholderBox — LOD에 따라 재질 교체.
 * 동일 유형 가구가 여러 개 있는 경우 InstancedMesh를 쓸 수 있지만,
 * 현재 구조에서 각 item은 독립 위치/선택 상태를 갖고 있어
 * 단일 FurnitureMesh 단위에선 일반 mesh + 선택 시 색상 변경이 최적.
 */
function PlaceholderBox({
  isSelected,
  lod,
  castShadow,
}: {
  isSelected: boolean
  lod: LodLevel
  castShadow: boolean
}) {
  const geo = lod === 'low' ? BOX_GEO_LOW : BOX_GEO_HIGH
  const mat = isSelected ? MAT_SELECTED : lod === 'low' ? MAT_DEFAULT_LOW : MAT_DEFAULT

  return <mesh geometry={geo} material={mat} castShadow={castShadow} receiveShadow />
}

export function FurnitureMesh({
  item,
  gltfUrl,
  isSelected = false,
  onClick,
  lod = 'high',
}: FurnitureMeshProps) {
  const castShadow = lod !== 'low'

  return (
    <group
      position={item.position}
      rotation={[0, item.rotationY, 0]}
      onClick={
        onClick
          ? (e: { stopPropagation: () => void }) => {
              e.stopPropagation()
              onClick()
            }
          : undefined
      }
    >
      {gltfUrl ? (
        <Suspense fallback={<PlaceholderBox isSelected={isSelected} lod={lod} castShadow={castShadow} />}>
          <GltfModel url={gltfUrl} />
        </Suspense>
      ) : (
        <PlaceholderBox isSelected={isSelected} lod={lod} castShadow={castShadow} />
      )}
    </group>
  )
}

// ─────────────────────────────────────────────
// InstancedFurnitureGroup — 동일 gltfUrl을 가진 가구 묶음을 InstancedMesh로 렌더링.
// ThreeViewer3D에서 동일 종류 가구를 그룹핑해서 사용하는 고급 API.
// ─────────────────────────────────────────────
interface InstancedFurnitureGroupProps {
  items: FurniturePlacement3D[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}

const _mat4 = new Matrix4()
const _color = new Color()

export function InstancedFurnitureGroup({
  items,
  selectedId,
  onSelect,
}: InstancedFurnitureGroupProps) {
  const meshRef = useRef<InstancedMesh>(null)

  const geo = useMemo(() => new BoxGeometry(1000, 800, 600, 1, 1, 1), [])
  const mat = useMemo(
    () => new MeshStandardMaterial({ color: '#a0a0a0', vertexColors: true }),
    []
  )

  // 인스턴스 행렬 + 색상 초기화
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    mesh.instanceMatrix.setUsage(DynamicDrawUsage)

    items.forEach((item, i) => {
      _mat4.makeRotationY(item.rotationY)
      _mat4.setPosition(item.position[0], item.position[1], item.position[2])
      mesh.setMatrixAt(i, _mat4)

      const isSelected = item.id === selectedId
      mesh.setColorAt(i, _color.set(isSelected ? '#4a90d9' : '#a0a0a0'))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items, selectedId])

  const handleClick = (e: { stopPropagation: () => void; instanceId?: number }) => {
    e.stopPropagation()
    if (e.instanceId != null && onSelect) {
      const item = items[e.instanceId]
      if (item) onSelect(item.id)
    }
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, mat, items.length]}
      castShadow
      receiveShadow
      onClick={handleClick}
    />
  )
}
