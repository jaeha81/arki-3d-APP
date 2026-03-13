import type { FloorPlanEngine, FloorPlanState } from '@spaceplanner/engine'
import { WallTool, SnapEngine } from '@spaceplanner/engine'
import type { EditorTool } from '@/types/editor'

export interface CanvasControllerOptions {
  onStateChange: (state: FloorPlanState) => void
  onPreviewChange: (
    preview: { start: { x: number; y: number }; end: { x: number; y: number } } | null
  ) => void
  getActiveTool: () => EditorTool
  getScale: () => number
  getOffset: () => { x: number; y: number }
  setOffset: (x: number, y: number) => void
  setScale: (scale: number) => void
}

export class CanvasController {
  private wallTool: WallTool
  private snapEngine: SnapEngine
  private isPanning = false
  private panStart = { x: 0, y: 0 }
  private panStartOffset = { x: 0, y: 0 }
  private unsubscribeEngine: (() => void) | null = null

  constructor(
    private engine: FloorPlanEngine,
    private options: CanvasControllerOptions
  ) {
    this.snapEngine = new SnapEngine()
    this.wallTool = new WallTool(engine, this.snapEngine)
    this.wallTool.onPreviewChange(preview => options.onPreviewChange(preview))
    this.unsubscribeEngine = engine.subscribe(state => options.onStateChange(state))
  }

  destroy(): void {
    this.unsubscribeEngine?.()
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const scale = this.options.getScale()
    const offset = this.options.getOffset()
    return {
      x: (screenX - offset.x) / scale,
      y: (screenY - offset.y) / scale,
    }
  }

  onMouseDown(e: MouseEvent, rect: DOMRect): void {
    const tool = this.options.getActiveTool()
    const world = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top)

    if (tool === 'wall') {
      this.wallTool.onMouseDown(world, this.engine.getState().floorPlan.walls)
    } else if (e.button === 1 || (e.button === 0 && tool === 'select' && e.altKey)) {
      this.isPanning = true
      this.panStart = { x: e.clientX, y: e.clientY }
      this.panStartOffset = { ...this.options.getOffset() }
    } else if (tool === 'select') {
      this.engine.select(null, null)
    }
  }

  onMouseMove(e: MouseEvent, rect: DOMRect): void {
    const tool = this.options.getActiveTool()
    const world = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top)

    if (tool === 'wall') {
      this.wallTool.onMouseMove(world, this.engine.getState().floorPlan.walls)
    }

    if (this.isPanning) {
      const dx = e.clientX - this.panStart.x
      const dy = e.clientY - this.panStart.y
      this.options.setOffset(this.panStartOffset.x + dx, this.panStartOffset.y + dy)
    }
  }

  onMouseUp(_e: MouseEvent): void {
    this.isPanning = false
  }

  onDoubleClick(_e: MouseEvent, _rect: DOMRect): void {
    if (this.options.getActiveTool() === 'wall') {
      this.wallTool.onDoubleClick()
    }
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.wallTool.onEscape()
      this.engine.select(null, null)
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault()
      if (e.shiftKey) this.engine.redo()
      else this.engine.undo()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault()
      this.engine.redo()
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      this.engine.deleteSelected()
    }

    if (e.key === '+' || e.key === '=') {
      this.options.setScale(Math.min(this.options.getScale() * 1.2, 10))
    } else if (e.key === '-') {
      this.options.setScale(Math.max(this.options.getScale() / 1.2, 0.05))
    }
  }

  onWheel(e: WheelEvent, rect: DOMRect): void {
    e.preventDefault()
    const scale = this.options.getScale()
    const offset = this.options.getOffset()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    const newScale = Math.max(0.05, Math.min(10, scale * zoomFactor))
    const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale)
    const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale)
    this.options.setScale(newScale)
    this.options.setOffset(newOffsetX, newOffsetY)
  }
}
