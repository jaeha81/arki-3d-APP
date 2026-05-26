'use client'

import { useMemo } from 'react'
import {
  MeshStandardMaterial,
  BufferGeometry,
  BoxGeometry,
  Matrix4,
  Float32BufferAttribute,
} from 'three'
import type { WallMeshData, BoxSegment } from '@spaceplanner/engine'

// Shared materials — created once, never mutated
const MAT_NORMAL = new MeshStandardMaterial({ color: '#e8e8e8' })
const MAT_SELECTED = new MeshStandardMaterial({ color: '#4a90d9' })
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

  const material = isSelected
    ? MAT_SELECTED
    : lod === 'low'
    ? MAT_NORMAL_LOW
    : MAT_NORMAL

  return (
    <mesh
      geometry={mergedGeo}
      material={material}
      castShadow={lod !== 'low'}
      receiveShadow
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
