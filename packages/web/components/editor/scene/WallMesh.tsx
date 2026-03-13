'use client'

import type { WallMeshData, BoxSegment } from '@spaceplanner/engine'

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
      onClick={onClick ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); onClick() } : undefined}
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={isSelected ? '#4a90d9' : '#e8e8e8'} />
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
