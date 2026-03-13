import type { Point3D } from './geometry'

export interface SceneLight {
  id: string
  type: 'ambient' | 'directional' | 'point'
  intensity: number
  color: string
  position?: Point3D
}

export interface CameraState {
  position: Point3D
  target: Point3D
  fov: number
}

export interface SceneSettings {
  lights: SceneLight[]
  camera: CameraState
  backgroundColor: string
}
