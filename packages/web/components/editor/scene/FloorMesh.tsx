'use client'

import { useMemo } from 'react'
import { Shape, DoubleSide, FrontSide, type Side } from 'three'
import type { FloorData } from '@spaceplanner/engine'

interface FloorMeshProps {
  floor: FloorData | null
  ceiling: FloorData | null
}

function PolygonPlane({
  data,
  color,
  transparent = false,
  opacity = 1,
  side = FrontSide,
  receiveShadow = false,
}: {
  data: FloorData
  color: string
  transparent?: boolean
  opacity?: number
  side?: Side
  receiveShadow?: boolean
}) {
  const shape = useMemo(() => {
    const s = new Shape()
    const verts = data.vertices
    if (verts.length === 0) return s

    const first = verts[0]
    if (!first) return s
    s.moveTo(first[0], first[1])

    for (let i = 1; i < verts.length; i++) {
      const v = verts[i]
      if (v) {
        s.lineTo(v[0], v[1])
      }
    }
    s.closePath()
    return s
  }, [data.vertices])

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, data.y, 0]}
      receiveShadow={receiveShadow}
    >
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color={color}
        transparent={transparent}
        opacity={opacity}
        side={side}
      />
    </mesh>
  )
}

export function FloorMesh({ floor, ceiling }: FloorMeshProps) {
  return (
    <group>
      {floor && (
        <PolygonPlane
          data={floor}
          color="#d4c5a9"
          receiveShadow
        />
      )}
      {ceiling && (
        <PolygonPlane
          data={ceiling}
          color="#f5f5f5"
          transparent
          opacity={0.3}
          side={DoubleSide}
        />
      )}
    </group>
  )
}
