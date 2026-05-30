'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
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

// 동일 크기의 BoxGeometry를 재사용 — 세그먼트 수가 많을 때 GC 압력 감소
const _boxGeoCache = new Map<string, BoxGeometry>()
function getCachedBoxGeo(w: number, h: number, d: number): BoxGeometry {
  const key = `${w}|${h}|${d}`
  let geo = _boxGeoCache.get(key)
  if (!geo) {
    geo = new BoxGeometry(w, h, d)
    _boxGeoCache.set(key, geo)
  }
  return geo
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
    // 캐시에서 가져온 geo는 dispose하지 않음 — 공유 원본
    const sourceGeo = getCachedBoxGeo(w, h, d)
    const geo = sourceGeo.clone()
    // 벽 방향 회전 먼저 적용 → 이후 월드 위치로 이동 (순서 중요)
    if (seg.rotationY) {
      geo.applyMatrix4(_mat4.makeRotationY(seg.rotationY))
    }
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
  const geoRef = useRef<BufferGeometry | null>(null)
  const mergedGeo = useMemo<BufferGeometry>(() => {
    geoRef.current?.dispose()
    const g = mergeBoxSegments(segments)
    geoRef.current = g
    return g
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments])

  useEffect(() => {
    return () => { geoRef.current?.dispose() }
  }, [])

  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<Mesh>(null)

  // Smooth emissive intensity interpolation — 목표값 도달 시 early return
  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const mat = mesh.material as MeshStandardMaterial
    if (!mat || !('emissiveIntensity' in mat)) return

    const targetIntensity = isSelected ? 0.15 : hovered ? 0.06 : 0
    const currentIntensity = mat.emissiveIntensity
    if (Math.abs(currentIntensity - targetIntensity) <= 0.001) return
    mat.emissiveIntensity += (targetIntensity - currentIntensity) * Math.min(delta * 10, 1)
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
