'use client'

import { TransformControls } from '@react-three/drei'
import type { Object3D } from 'three'

interface TransformGizmoProps {
  target: React.RefObject<Object3D | null>
  mode?: 'translate' | 'rotate' | 'scale'
  enabled?: boolean
}

export function TransformGizmo({
  target,
  mode = 'translate',
  enabled = true,
}: TransformGizmoProps) {
  if (!enabled || !target.current) return null

  return (
    <TransformControls
      object={target.current}
      mode={mode}
      size={0.5}
    />
  )
}
