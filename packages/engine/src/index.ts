// Types
export type { Point2D, Point3D, BoundingBox2D, Segment2D, Transform2D } from './types/geometry'
export type { Wall, Door, WindowElement, Room, FurniturePlacement, FloorPlan } from './types/floor-plan'
export { WALL_DEFAULTS, DOOR_DEFAULTS, WINDOW_DEFAULTS, createEmptyFloorPlan } from './types/floor-plan'
export type { SceneLight, CameraState, SceneSettings } from './types/scene'

// Utils
export { distance2D, angleBetween, midpoint, snapToGrid, degToRad, radToDeg, clamp } from './utils/math'
export { generateId } from './utils/id'

// Engine classes
export { FloorPlanEngine } from './floor-plan/FloorPlanEngine'
export type { FloorPlanState } from './floor-plan/FloorPlanEngine'
export { SnapEngine } from './floor-plan/SnapEngine'
export type { SnapResult } from './floor-plan/SnapEngine'
export { WallTool } from './floor-plan/WallTool'
export type { WallPreview, WallToolState } from './floor-plan/WallTool'
export { UndoManager } from './floor-plan/UndoManager'
export type { Command } from './floor-plan/UndoManager'
export { RoomDetector } from './floor-plan/RoomDetector'
export { DimensionEngine } from './floor-plan/DimensionEngine'
export type { DimensionLine } from './floor-plan/DimensionEngine'

// 3D Scene Builder
export { buildScene } from './three/SceneBuilder'
export type {
  SceneData,
  WallMeshData,
  BoxSegment,
  FloorData,
  FurniturePlacement3D,
} from './three/SceneBuilder'
