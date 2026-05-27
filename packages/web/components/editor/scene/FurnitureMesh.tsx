'use client'

import { Suspense, useMemo, useRef, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'
import {
  InstancedMesh,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
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
  isDragging?: boolean
  onClick?: () => void
  lod?: LodLevel
}

// LOD별 박스 geometry 크기 (세그먼트 수 조정)
// high: 1×1×1 세그먼트 (기본 BoxGeometry는 이미 최소)
// low: 동일 형태이지만 flatShading 재질
const BOX_GEO_HIGH = new BoxGeometry(1000, 800, 600, 1, 1, 1)
const BOX_GEO_LOW = new BoxGeometry(1000, 800, 600, 1, 1, 1)
const MAT_DEFAULT = new MeshStandardMaterial({ color: '#a0a0a0', emissive: '#000000', emissiveIntensity: 0 })
const MAT_DEFAULT_LOW = new MeshStandardMaterial({ color: '#a0a0a0', flatShading: true })
const MAT_HOVER = new MeshStandardMaterial({ color: '#b8b8b8', emissive: '#ffffff', emissiveIntensity: 0.08 })
const MAT_SELECTED = new MeshStandardMaterial({ color: '#4a90d9', emissive: '#4a90d9', emissiveIntensity: 0.2 })
// 드래그 중 반투명 처리
const MAT_DRAGGING = new MeshStandardMaterial({ color: '#a0a0a0', opacity: 0.5, transparent: true, emissive: '#ffffff', emissiveIntensity: 0.1 })

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene])
  return <primitive object={cloned} />
}

/**
 * PlaceholderBox — LOD에 따라 재질 교체.
 * hover/select/drag 상태 시각 피드백 포함.
 */
function PlaceholderBox({
  isSelected,
  isDragging,
  lod,
  castShadow,
  onHoverChange,
}: {
  isSelected: boolean
  isDragging?: boolean
  lod: LodLevel
  castShadow: boolean
  onHoverChange?: (h: boolean) => void
}) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Smooth emissive interpolation
  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const mat = mesh.material as MeshStandardMaterial
    if (!mat || !('emissiveIntensity' in mat)) return
    const targetIntensity = isSelected ? 0.2 : isDragging ? 0.1 : hovered ? 0.08 : 0
    const current = mat.emissiveIntensity
    if (Math.abs(current - targetIntensity) > 0.001) {
      mat.emissiveIntensity += (targetIntensity - current) * Math.min(delta * 10, 1)
    }
  })

  if (lod === 'low') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <mesh geometry={BOX_GEO_LOW as any} material={MAT_DEFAULT_LOW as any} castShadow={false} receiveShadow />
  }

  const mat = isDragging
    ? MAT_DRAGGING
    : isSelected
    ? MAT_SELECTED
    : hovered
    ? MAT_HOVER
    : MAT_DEFAULT

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <mesh
      ref={meshRef as any}
      geometry={BOX_GEO_HIGH as any}
      material={mat as any}
      castShadow={castShadow}
      receiveShadow
      onPointerEnter={(e) => {
        e.stopPropagation()
        setHovered(true)
        onHoverChange?.(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={() => {
        setHovered(false)
        onHoverChange?.(false)
        document.body.style.cursor = 'default'
      }}
    />
  )
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <instancedMesh
      ref={meshRef as any}
      args={[geo as any, mat as any, items.length]}
      castShadow
      receiveShadow
      onClick={handleClick}
    />
  )
}
