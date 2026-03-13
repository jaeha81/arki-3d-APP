import type {
  FloorPlan,
  Wall,
  Door,
  WindowElement,
  FurniturePlacement,
} from '../types/floor-plan'
import type { Point2D } from '../types/geometry'
import {
  createEmptyFloorPlan,
  WALL_DEFAULTS,
  DOOR_DEFAULTS,
  WINDOW_DEFAULTS,
} from '../types/floor-plan'
import { generateId } from '../utils/id'
import { UndoManager } from './UndoManager'
import { RoomDetector } from './RoomDetector'
import { DimensionEngine, type DimensionLine } from './DimensionEngine'
import { distance2D } from '../utils/math'

type Listener = (state: FloorPlanState) => void

export interface FloorPlanState {
  floorPlan: FloorPlan
  selectedId: string | null
  selectedType: 'wall' | 'door' | 'window' | 'furniture' | null
  dimensions: DimensionLine[]
  canUndo: boolean
  canRedo: boolean
}

/** JSON-based deep clone (no DOM dependency) */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

export class FloorPlanEngine {
  private floorPlan: FloorPlan
  private selectedId: string | null = null
  private selectedType: FloorPlanState['selectedType'] = null
  private listeners: Listener[] = []
  private undoManager = new UndoManager()
  private roomDetector = new RoomDetector()
  private dimensionEngine = new DimensionEngine()

  constructor(initialPlan?: FloorPlan) {
    this.floorPlan = initialPlan ?? createEmptyFloorPlan()
  }

  getState(): FloorPlanState {
    return {
      floorPlan: deepClone(this.floorPlan),
      selectedId: this.selectedId,
      selectedType: this.selectedType,
      dimensions: this.dimensionEngine.calculate(this.floorPlan.walls),
      canUndo: this.undoManager.canUndo(),
      canRedo: this.undoManager.canRedo(),
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify(): void {
    // 방 자동 감지
    this.floorPlan.rooms = this.roomDetector.detect(this.floorPlan.walls)
    const state = this.getState()
    for (const listener of this.listeners) listener(state)
  }

  // ─── 벽 ───────────────────────────────────────────────
  addWall(start: Point2D, end: Point2D): string {
    if (distance2D(start, end) < 50) return '' // 너무 짧은 벽 무시

    const wall: Wall = {
      id: generateId('wall'),
      start: { ...start },
      end: { ...end },
      thickness: WALL_DEFAULTS.THICKNESS,
      height: WALL_DEFAULTS.HEIGHT,
      materialInner: 'mat-white-paint',
      materialOuter: 'mat-white-paint',
    }

    this.undoManager.execute({
      description: '벽 추가',
      execute: () => {
        this.floorPlan.walls.push(wall)
        this.notify()
      },
      undo: () => {
        this.floorPlan.walls = this.floorPlan.walls.filter(w => w.id !== wall.id)
        this.notify()
      },
    })

    return wall.id
  }

  removeWall(id: string): void {
    const wall = this.floorPlan.walls.find(w => w.id === id)
    if (!wall) return

    const idx = this.floorPlan.walls.indexOf(wall)
    this.undoManager.execute({
      description: '벽 삭제',
      execute: () => {
        this.floorPlan.walls.splice(idx, 1)
        this.notify()
      },
      undo: () => {
        this.floorPlan.walls.splice(idx, 0, wall)
        this.notify()
      },
    })
  }

  moveWall(id: string, dx: number, dy: number): void {
    const wall = this.floorPlan.walls.find(w => w.id === id)
    if (!wall) return

    const origStart = { ...wall.start }
    const origEnd = { ...wall.end }

    this.undoManager.execute({
      description: '벽 이동',
      execute: () => {
        wall.start = { x: origStart.x + dx, y: origStart.y + dy }
        wall.end = { x: origEnd.x + dx, y: origEnd.y + dy }
        this.notify()
      },
      undo: () => {
        wall.start = origStart
        wall.end = origEnd
        this.notify()
      },
    })
  }

  // ─── 문/창문 ─────────────────────────────────────────
  addDoor(wallId: string, position: number): string {
    const door: Door = {
      id: generateId('door'),
      wallId,
      position: Math.max(0, Math.min(1, position)),
      width: DOOR_DEFAULTS.WIDTH,
      height: DOOR_DEFAULTS.HEIGHT,
      swingAngle: Math.PI / 2,
      openDirection: 'left',
    }

    this.undoManager.execute({
      description: '문 추가',
      execute: () => {
        this.floorPlan.doors.push(door)
        this.notify()
      },
      undo: () => {
        this.floorPlan.doors = this.floorPlan.doors.filter(d => d.id !== door.id)
        this.notify()
      },
    })

    return door.id
  }

  addWindow(wallId: string, position: number): string {
    const win: WindowElement = {
      id: generateId('win'),
      wallId,
      position: Math.max(0, Math.min(1, position)),
      width: WINDOW_DEFAULTS.WIDTH,
      height: WINDOW_DEFAULTS.HEIGHT,
      sillHeight: WINDOW_DEFAULTS.SILL_HEIGHT,
    }

    this.undoManager.execute({
      description: '창문 추가',
      execute: () => {
        this.floorPlan.windows.push(win)
        this.notify()
      },
      undo: () => {
        this.floorPlan.windows = this.floorPlan.windows.filter(w => w.id !== win.id)
        this.notify()
      },
    })

    return win.id
  }

  // ─── 가구 ─────────────────────────────────────────────
  addFurniture(assetId: string, position: Point2D): string {
    const furniture: FurniturePlacement = {
      id: generateId('furn'),
      assetId,
      position: { ...position },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    }

    this.undoManager.execute({
      description: '가구 배치',
      execute: () => {
        this.floorPlan.furniture.push(furniture)
        this.notify()
      },
      undo: () => {
        this.floorPlan.furniture = this.floorPlan.furniture.filter(
          f => f.id !== furniture.id
        )
        this.notify()
      },
    })

    return furniture.id
  }

  moveFurniture(id: string, position: Point2D): void {
    const furniture = this.floorPlan.furniture.find(f => f.id === id)
    if (!furniture) return

    const orig = { ...furniture.position }
    this.undoManager.execute({
      description: '가구 이동',
      execute: () => {
        furniture.position = { ...position }
        this.notify()
      },
      undo: () => {
        furniture.position = orig
        this.notify()
      },
    })
  }

  // ─── 선택 ─────────────────────────────────────────────
  select(
    id: string | null,
    type: FloorPlanState['selectedType'] = null
  ): void {
    this.selectedId = id
    this.selectedType = type
    this.notify()
  }

  deleteSelected(): void {
    if (!this.selectedId) return

    if (this.selectedType === 'wall') {
      this.removeWall(this.selectedId)
    } else if (this.selectedType === 'door') {
      const door = this.floorPlan.doors.find(d => d.id === this.selectedId)
      if (door) {
        const idx = this.floorPlan.doors.indexOf(door)
        this.undoManager.execute({
          description: '문 삭제',
          execute: () => {
            this.floorPlan.doors.splice(idx, 1)
            this.notify()
          },
          undo: () => {
            this.floorPlan.doors.splice(idx, 0, door)
            this.notify()
          },
        })
      }
    } else if (this.selectedType === 'window') {
      const win = this.floorPlan.windows.find(w => w.id === this.selectedId)
      if (win) {
        const idx = this.floorPlan.windows.indexOf(win)
        this.undoManager.execute({
          description: '창문 삭제',
          execute: () => {
            this.floorPlan.windows.splice(idx, 1)
            this.notify()
          },
          undo: () => {
            this.floorPlan.windows.splice(idx, 0, win)
            this.notify()
          },
        })
      }
    } else if (this.selectedType === 'furniture') {
      const furn = this.floorPlan.furniture.find(f => f.id === this.selectedId)
      if (furn) {
        const idx = this.floorPlan.furniture.indexOf(furn)
        this.undoManager.execute({
          description: '가구 삭제',
          execute: () => {
            this.floorPlan.furniture.splice(idx, 1)
            this.notify()
          },
          undo: () => {
            this.floorPlan.furniture.splice(idx, 0, furn)
            this.notify()
          },
        })
      }
    }

    this.selectedId = null
    this.selectedType = null
  }

  undo(): void {
    this.undoManager.undo()
  }

  redo(): void {
    this.undoManager.redo()
  }

  loadPlan(plan: FloorPlan): void {
    this.floorPlan = deepClone(plan)
    this.undoManager.clear()
    this.selectedId = null
    this.selectedType = null
    this.notify()
  }

  exportPlan(): FloorPlan {
    return deepClone(this.floorPlan)
  }
}
