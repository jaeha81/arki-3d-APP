'use client'

import { Grid } from '@react-three/drei'

interface SceneGridProps {
  showGrid?: boolean
}

export function SceneGrid({ showGrid = true }: SceneGridProps) {
  if (!showGrid) return null

  return (
    <Grid
      position={[0, -1, 0]}
      args={[50000, 50000]}
      cellSize={100}
      sectionSize={1000}
      cellColor="#e0e0e0"
      sectionColor="#b0b0b0"
      fadeDistance={30000}
      infiniteGrid
    />
  )
}
