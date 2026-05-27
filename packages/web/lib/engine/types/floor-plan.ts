import type { Point2D } from './geometry'

/** 벽 기본값 (mm) */
export const WALL_DEFAULTS = {
  THICKNESS: 200,
  HEIGHT: 2700,
} as const

/** 문 기본값 (mm) */
export const DOOR_DEFAULTS = {
  WIDTH: 900,
  HEIGHT: 2100,
} as const

/** 창문 기본값 (mm) */
export const WINDOW_DEFAULTS = {
  WIDTH: 1200,
  HEIGHT: 1200,
  SILL_HEIGHT: 900,
} as const

export interface Wall {
  id: string
  start: Point2D
  end: Point2D
  thickness: number
  height: number
  materialInner: string
  materialOuter: string
}

export interface Door {
  id: string
  wallId: string
  position: number   // 0~1, 벽 위의 상대적 위치
  width: number
  height: number
  swingAngle: number // 열림 각도 (라디안)
  openDirection: 'left' | 'right'
}

export interface WindowElement {
  id: string
  wallId: string
  position: number
  width: number
  height: number
  sillHeight: number
}

export interface Room {
  id: string
  name: string
  wallIds: string[]
  area: number      // mm²
  color?: string
}

export interface FurniturePlacement {
  id: string
  assetId: string
  position: Point2D
  rotation: number  // 라디안
  scaleX: number
  scaleY: number
}

export interface FloorPlan {
  version: string
  metadata: {
    name: string
    unit: 'mm'
    gridSize: number
  }
  walls: Wall[]
  doors: Door[]
  windows: WindowElement[]
  rooms: Room[]
  furniture: FurniturePlacement[]
}

export function createEmptyFloorPlan(name: string = '새 프로젝트'): FloorPlan {
  return {
    version: '1.0',
    metadata: { name, unit: 'mm', gridSize: 100 },
    walls: [],
    doors: [],
    windows: [],
    rooms: [],
    furniture: [],
  }
}
