'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEditorStore } from '@/lib/stores/editor-store'
import type { CameraPreset3D } from '@/lib/stores/editor-store'

// Camera positions per preset (mm units, matching room scale)
const PRESET_POSITIONS: Record<CameraPreset3D, { pos: [number, number, number]; target: [number, number, number] }> = {
  iso:   { pos: [6000, 7000, 9000],  target: [0, 500, 0] },
  top:   { pos: [0, 18000, 10],      target: [0, 0, 0] },
  front: { pos: [0, 1800, 14000],    target: [0, 1800, 0] },
  right: { pos: [14000, 1800, 0],    target: [0, 1800, 0] },
}

interface CameraControllerProps {
  controlsRef: React.RefObject<{ target: THREE.Vector3; update: () => void } | null>
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const cameraPreset3D = useEditorStore(s => s.cameraPreset3D)
  const { camera, invalidate } = useThree()

  const animTargetPos = useRef<THREE.Vector3 | null>(null)
  const animTargetLookAt = useRef<THREE.Vector3 | null>(null)
  const isAnimating = useRef(false)

  useEffect(() => {
    const preset = PRESET_POSITIONS[cameraPreset3D]
    animTargetPos.current = new THREE.Vector3(...preset.pos)
    animTargetLookAt.current = new THREE.Vector3(...preset.target)
    isAnimating.current = true
    invalidate()
  }, [cameraPreset3D, invalidate])

  useFrame(() => {
    if (!isAnimating.current || !animTargetPos.current || !animTargetLookAt.current) return

    const controls = controlsRef.current
    const lerpFactor = 0.1

    camera.position.lerp(animTargetPos.current, lerpFactor)

    if (controls) {
      controls.target.lerp(animTargetLookAt.current, lerpFactor)
      controls.update()
    }

    invalidate()

    // Stop animation when close enough
    if (camera.position.distanceTo(animTargetPos.current) < 50) {
      camera.position.copy(animTargetPos.current)
      if (controls) {
        controls.target.copy(animTargetLookAt.current)
        controls.update()
      }
      isAnimating.current = false
      animTargetPos.current = null
      animTargetLookAt.current = null
    }
  })

  return null
}
