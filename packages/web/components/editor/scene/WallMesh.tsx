'use client'

import { MeshStandardMaterial } from 'three'
import type { WallMeshData, BoxSegment } from '@spaceplanner/engine'

// Shared materials — created once, never mutated
const MAT_NORMAL = new MeshStandardMaterial({ color: '#e8e8e8' })
const MAT_SELECTED = new MeshStandardMaterial({ color: '#4a90d9' })

interface WallMeshProps {
  data: WallMeshData
  isSelected?: boolean
  onClick?: () => void
}

function WallSegment({
  segment,
  isSelected,
  onClick,
}: {
  segment: BoxSegment
  isSelected?: boolean
  onClick?: () => void
}) {
  const [w, h, d] = segment.size

  return (
    <mesh
      position={segment.position}
      castShadow
      receiveShadow
      material={isSelected ? MAT_SELECTED : MAT_NORMAL}
      onClick={onClick ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); onClick() } : undefined}
    >
      <boxGeometry args={[w, h, d]} />
    </mesh>
  )
}

export function WallMesh({ data, isSelected = false, onClick }: WallMeshProps) {
  return (
    <group>
      {data.segments.map((segment, idx) => (
        <WallSegment
          key={`${data.id}-seg-${idx}`}
          segment={segment}
          isSelected={isSelected}
          onClick={onClick}
        />
      ))}
    </group>
  )
}
