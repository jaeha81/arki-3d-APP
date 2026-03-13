'use client'

import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import type { FurniturePlacement3D } from '@spaceplanner/engine'

interface FurnitureMeshProps {
  item: FurniturePlacement3D
  gltfUrl?: string
  isSelected?: boolean
  onClick?: () => void
}

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene.clone()} />
}

function PlaceholderBox({ isSelected }: { isSelected: boolean }) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1000, 800, 600]} />
      <meshStandardMaterial color={isSelected ? '#4a90d9' : '#a0a0a0'} />
    </mesh>
  )
}

export function FurnitureMesh({
  item,
  gltfUrl,
  isSelected = false,
  onClick,
}: FurnitureMeshProps) {
  return (
    <group
      position={item.position}
      rotation={[0, item.rotationY, 0]}
      onClick={onClick ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); onClick() } : undefined}
    >
      {gltfUrl ? (
        <Suspense fallback={<PlaceholderBox isSelected={isSelected} />}>
          <GltfModel url={gltfUrl} />
        </Suspense>
      ) : (
        <PlaceholderBox isSelected={isSelected} />
      )}
    </group>
  )
}
