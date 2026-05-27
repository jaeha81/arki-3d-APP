'use client'

import { useMemo, useState, useRef } from 'react'
import {
  MeshStandardMaterial,
  BufferGeometry,
  BoxGeometry,
  Matrix4,
  Float32BufferAttribute,
  Mesh,
} from 'three'
import { useFrame } from '@react-three/fiber'
import type { WallMeshData, BoxSegment } from '@spaceplanner/engine'

// Shared materials — created once, never mutated
const MAT_NORMAL = new MeshStandardMaterial({ color: '#e8e8e8', emissive: '#000000', emissiveIntensity: 0 })
const MAT_SELECTED = new MeshStandardMaterial({ color: '#4a90d9', emissive: '#4a90d9', emissiveIntensity: 0.15 })
const MAT_HOVER = new MeshStandardMaterial({ color: '#f0f0f0', emissive: '#ffffff', emissiveIntensity: 0.06 })
// Low-poly LOD material (flatShading for distant view)
const MAT_NORMAL_LOW = new MeshStandardMaterial({ color: '#e8e8e8', flatShading: true })

type LodLevel = 'high' | 'medium' | 'low'

interface WallMeshProps {
  data: WallMeshData
  isSelected?: boolean
  onClick?: () => void
  lod?: LodLevel
}

/**
 * 동일 재질 벽 세그먼트를 단일 BufferGeometry로 병합.
 * three.js BufferGeometry.merge() API를 직접 사용하여 외부 의존성 없이 구현.
 * draw call을 세그먼트 수 → 1로 줄임.
 */
function mergeBoxSegments(segments: BoxSegment[]): BufferGeometry {
  if (segments.length === 0) return new BufferGeometry()

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  let indexOffset = 0
  const _mat4 = new Matrix4()

  for (const seg of segments) {
    const [w, h, d] = seg.size
    const geo = new BoxGeometry(w, h, d)
    _mat4.makeTranslation(seg.position[0], seg.position[1], seg.position[2])
    geo.applyMatrix4(_mat4)

    const pos = geo.attributes['position']
    const nor = geo.attributes['normal']
    const uv = geo.attributes['uv']
    const idx = geo.index

    if (!pos || !nor || !uv || !idx) {
      geo.dispose()
      continue
    }

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      normals.push(nor.getX(i), nor.getY(i), nor.getZ(i))
      uvs.push(uv.getX(i), uv.getY(i))
    }

    for (let i = 0; i < idx.count; i++) {
      indices.push(idx.getX(i) + indexOffset)
    }
    indexOffset += pos.count
    geo.dispose()
  }

  const merged = new BufferGeometry()
  merged.setAttribute('position', new Float32BufferAttribute(positions, 3))
  merged.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  merged.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  merged.setIndex(indices)
  return merged
}

function MergedWallSegments({
  segments,
  isSelected,
  onClick,
  lod,
}: {
  segments: BoxSegment[]
  isSelected: boolean
  onClick?: () => void
  lod: LodLevel
}) {
  const mergedGeo = useMemo<BufferGeometry>(
    () => mergeBoxSegments(segments),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [segments]
  )

  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<Mesh>(null)

  // Smooth emissive intensity interpolation
  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const mat = mesh.material as MeshStandardMaterial
    if (!mat || !('emissiveIntensity' in mat)) return

    const targetIntensity = isSelected ? 0.15 : hovered ? 0.06 : 0
    const currentIntensity = mat.emissiveIntensity
    if (Math.abs(currentIntensity - targetIntensity) > 0.001) {
      mat.emissiveIntensity += (targetIntensity - currentIntensity) * Math.min(delta * 10, 1)
      mat.needsUpdate = false // emissiveIntensity 변경은 needsUpdate 불필요
    }
  })

  // lod=low 이면 hover 효과 스킵
  if (lod === 'low') {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <mesh
        geometry={mergedGeo as any}
        material={MAT_NORMAL_LOW as any}
        castShadow={false}
        receiveShadow
        onClick={
          onClick
            ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); onClick() }
            : undefined
        }
      />
    )
  }

  // high/medium: per-instance material for hover/select state
  const baseMat = isSelected ? MAT_SELECTED : hovered ? MAT_HOVER : MAT_NORMAL

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <mesh
      ref={meshRef as any}
      geometry={mergedGeo as any}
      material={baseMat as any}
      castShadow
      receiveShadow
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default' }}
      onClick={
        onClick
          ? (e: { stopPropagation: () => void }) => {
              e.stopPropagation()
              onClick()
            }
          : undefined
      }
    />
  )
}

export function WallMesh({ data, isSelected = false, onClick, lod = 'high' }: WallMeshProps) {
  return (
    <group>
      <MergedWallSegments
        segments={data.segments}
        isSelected={isSelected}
        onClick={onClick}
        lod={lod}
      />
    </group>
  )
}
