import type { Point2D } from '../types/geometry'
import type { FloorPlanEngine } from './FloorPlanEngine'
import { SnapEngine } from './SnapEngine'
import type { Wall } from '../types/floor-plan'

export type WallToolState = 'idle' | 'drawing'

export interface WallPreview {
  start: Point2D
  end: Point2D
  snapIndicator?: Point2D
}

export class WallTool {
  private state: WallToolState = 'idle'
  private drawStart: Point2D | null = null
  private preview: WallPreview | null = null
  private listeners: Array<(preview: WallPreview | null) => void> = []

  constructor(
    private engine: FloorPlanEngine,
    private snapEngine: SnapEngine = new SnapEngine()
  ) {}

  onMouseDown(worldPoint: Point2D, walls: Wall[]): void {
    const snapped = this.snapEngine.snap(worldPoint, walls)

    if (this.state === 'idle') {
      this.drawStart = snapped.point
      this.state = 'drawing'
    } else if (this.state === 'drawing' && this.drawStart) {
      const snappedEnd = this.snapEngine.snap(worldPoint, walls, this.drawStart)
      this.engine.addWall(this.drawStart, snappedEnd.point)
      // 연속 그리기: 끝점이 새 시작점
      this.drawStart = snappedEnd.point
      this.preview = null
      this.notifyPreview()
    }
  }

  onMouseMove(worldPoint: Point2D, walls: Wall[]): void {
    if (this.state !== 'drawing' || !this.drawStart) return

    const snapped = this.snapEngine.snap(worldPoint, walls, this.drawStart)
    this.preview = {
      start: this.drawStart,
      end: snapped.point,
      snapIndicator: snapped.snapped ? snapped.point : undefined,
    }
    this.notifyPreview()
  }

  onDoubleClick(): void {
    this.cancel()
  }

  onEscape(): void {
    this.cancel()
  }

  cancel(): void {
    this.state = 'idle'
    this.drawStart = null
    this.preview = null
    this.notifyPreview()
  }

  getPreview(): WallPreview | null {
    return this.preview
  }

  getState(): WallToolState {
    return this.state
  }

  onPreviewChange(
    listener: (preview: WallPreview | null) => void
  ): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyPreview(): void {
    for (const l of this.listeners) l(this.preview)
  }
}
