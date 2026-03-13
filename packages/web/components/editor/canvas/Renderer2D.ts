import type { FloorPlan } from '@spaceplanner/engine'
import type { DimensionLine } from '@spaceplanner/engine'
import { distance2D, angleBetween } from '@spaceplanner/engine'

export interface RenderOptions {
  scale: number
  offsetX: number
  offsetY: number
  gridSize: number
  showDimensions: boolean
  showGrid: boolean
  selectedId: string | null
  wallPreview?: { start: { x: number; y: number }; end: { x: number; y: number } } | null
  colors: {
    background: string
    grid: string
    wall: string
    wallSelected: string
    door: string
    window: string
    room: string
    dimension: string
    dimensionText: string
    preview: string
    snapIndicator: string
  }
}

export class Renderer2D {
  private ctx: CanvasRenderingContext2D

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context not available')
    this.ctx = ctx
  }

  render(plan: FloorPlan, dimensions: DimensionLine[], options: RenderOptions): void {
    const { ctx } = this
    const { offsetX, offsetY, scale } = options

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.fillStyle = options.colors.background
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    if (options.showGrid) this.drawGrid(options)
    this.drawRooms(plan, options)
    this.drawWalls(plan, options)
    this.drawDoors(plan, options)
    this.drawWindows(plan, options)
    this.drawFurniture(plan, options)
    if (options.showDimensions) this.drawDimensions(dimensions, options)
    if (options.wallPreview) this.drawWallPreview(options.wallPreview, options)

    ctx.restore()
  }

  worldToScreen(
    world: { x: number; y: number },
    options: RenderOptions
  ): { x: number; y: number } {
    return {
      x: world.x * options.scale + options.offsetX,
      y: world.y * options.scale + options.offsetY,
    }
  }

  screenToWorld(
    screen: { x: number; y: number },
    options: RenderOptions
  ): { x: number; y: number } {
    return {
      x: (screen.x - options.offsetX) / options.scale,
      y: (screen.y - options.offsetY) / options.scale,
    }
  }

  private drawGrid(options: RenderOptions): void {
    const { ctx, canvas } = this
    const { scale, offsetX, offsetY, gridSize } = options

    ctx.save()
    ctx.strokeStyle = options.colors.grid
    ctx.lineWidth = 0.5 / scale

    const startX = Math.floor(-offsetX / scale / gridSize) * gridSize
    const startY = Math.floor(-offsetY / scale / gridSize) * gridSize
    const endX = startX + canvas.width / scale + gridSize
    const endY = startY + canvas.height / scale + gridSize

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
      ctx.stroke()
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
      ctx.stroke()
    }

    ctx.restore()
  }

  private drawWalls(plan: FloorPlan, options: RenderOptions): void {
    const { ctx } = this

    for (const wall of plan.walls) {
      const isSelected = wall.id === options.selectedId
      const angle = angleBetween(wall.start, wall.end)
      const perpAngle = angle + Math.PI / 2
      const hw = wall.thickness / 2

      ctx.save()
      ctx.strokeStyle = isSelected ? options.colors.wallSelected : options.colors.wall
      ctx.fillStyle = isSelected ? 'rgba(37, 99, 235, 0.1)' : 'hsl(0 0% 85%)'
      ctx.lineWidth = isSelected ? 2 / options.scale : 1 / options.scale

      ctx.beginPath()
      ctx.moveTo(
        wall.start.x + Math.cos(perpAngle) * hw,
        wall.start.y + Math.sin(perpAngle) * hw
      )
      ctx.lineTo(
        wall.end.x + Math.cos(perpAngle) * hw,
        wall.end.y + Math.sin(perpAngle) * hw
      )
      ctx.lineTo(
        wall.end.x - Math.cos(perpAngle) * hw,
        wall.end.y - Math.sin(perpAngle) * hw
      )
      ctx.lineTo(
        wall.start.x - Math.cos(perpAngle) * hw,
        wall.start.y - Math.sin(perpAngle) * hw
      )
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()

      if (isSelected) {
        ctx.save()
        ctx.fillStyle = options.colors.wallSelected
        for (const pt of [wall.start, wall.end]) {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 6 / options.scale, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
    }
  }

  private drawDoors(plan: FloorPlan, options: RenderOptions): void {
    const { ctx } = this

    for (const door of plan.doors) {
      const wall = plan.walls.find(w => w.id === door.wallId)
      if (!wall) continue

      const wallAngle = angleBetween(wall.start, wall.end)
      const wallLen = distance2D(wall.start, wall.end)
      const doorCenterX = wall.start.x + Math.cos(wallAngle) * wallLen * door.position
      const doorCenterY = wall.start.y + Math.sin(wallAngle) * wallLen * door.position
      const halfWidth = door.width / 2

      ctx.save()
      ctx.strokeStyle = options.colors.door
      ctx.lineWidth = 1.5 / options.scale
      ctx.setLineDash([4 / options.scale, 4 / options.scale])

      ctx.beginPath()
      const startAngle = wallAngle + (door.openDirection === 'left' ? 0 : Math.PI)
      ctx.arc(
        doorCenterX - Math.cos(wallAngle) * halfWidth,
        doorCenterY - Math.sin(wallAngle) * halfWidth,
        door.width,
        startAngle,
        startAngle + (door.openDirection === 'left' ? Math.PI / 2 : -Math.PI / 2)
      )
      ctx.stroke()

      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(
        doorCenterX - Math.cos(wallAngle) * halfWidth,
        doorCenterY - Math.sin(wallAngle) * halfWidth
      )
      ctx.lineTo(
        doorCenterX + Math.cos(wallAngle) * halfWidth,
        doorCenterY + Math.sin(wallAngle) * halfWidth
      )
      ctx.stroke()
      ctx.restore()
    }
  }

  private drawWindows(plan: FloorPlan, options: RenderOptions): void {
    const { ctx } = this

    for (const win of plan.windows) {
      const wall = plan.walls.find(w => w.id === win.wallId)
      if (!wall) continue

      const wallAngle = angleBetween(wall.start, wall.end)
      const wallLen = distance2D(wall.start, wall.end)
      const perpAngle = wallAngle + Math.PI / 2
      const cx = wall.start.x + Math.cos(wallAngle) * wallLen * win.position
      const cy = wall.start.y + Math.sin(wallAngle) * wallLen * win.position
      const halfW = win.width / 2
      const hw = wall.thickness / 2 * 0.6

      ctx.save()
      ctx.strokeStyle = options.colors.window
      ctx.lineWidth = 1.5 / options.scale

      for (const sign of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(
          cx - Math.cos(wallAngle) * halfW + Math.cos(perpAngle) * hw * sign,
          cy - Math.sin(wallAngle) * halfW + Math.sin(perpAngle) * hw * sign
        )
        ctx.lineTo(
          cx + Math.cos(wallAngle) * halfW + Math.cos(perpAngle) * hw * sign,
          cy + Math.sin(wallAngle) * halfW + Math.sin(perpAngle) * hw * sign
        )
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  private drawRooms(_plan: FloorPlan, _options: RenderOptions): void {
    // 방 영역 표시 (반투명) — 벽 사이클로부터 폴리곤 계산 필요
    // Sprint 3에서는 벽/문/창문 렌더링에 집중, 방 fill은 후속 개선
  }

  private drawFurniture(plan: FloorPlan, options: RenderOptions): void {
    const { ctx } = this

    for (const furn of plan.furniture) {
      const isSelected = furn.id === options.selectedId

      ctx.save()
      ctx.translate(furn.position.x, furn.position.y)
      ctx.rotate(furn.rotation)

      const w = 1000 * furn.scaleX
      const d = 500 * furn.scaleY
      ctx.strokeStyle = isSelected ? options.colors.wallSelected : '#8B5CF6'
      ctx.fillStyle = isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.05)'
      ctx.lineWidth = 1.5 / options.scale

      ctx.beginPath()
      ctx.rect(-w / 2, -d / 2, w, d)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
  }

  private drawDimensions(dimensions: DimensionLine[], options: RenderOptions): void {
    const { ctx } = this

    ctx.save()
    ctx.strokeStyle = options.colors.dimension
    ctx.fillStyle = options.colors.dimensionText
    ctx.lineWidth = 0.5 / options.scale
    ctx.font = `${200}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const dim of dimensions) {
      ctx.beginPath()
      ctx.moveTo(dim.start.x, dim.start.y)
      ctx.lineTo(dim.end.x, dim.end.y)
      ctx.stroke()

      const arrowSize = 100
      const arrowPairs: Array<[{ x: number; y: number }, number]> = [
        [dim.start, dim.angle + Math.PI],
        [dim.end, dim.angle],
      ]

      for (const [pt, angle] of arrowPairs) {
        ctx.beginPath()
        ctx.moveTo(pt.x, pt.y)
        ctx.lineTo(
          pt.x + Math.cos(angle + 0.3) * arrowSize,
          pt.y + Math.sin(angle + 0.3) * arrowSize
        )
        ctx.moveTo(pt.x, pt.y)
        ctx.lineTo(
          pt.x + Math.cos(angle - 0.3) * arrowSize,
          pt.y + Math.sin(angle - 0.3) * arrowSize
        )
        ctx.stroke()
      }

      const label =
        dim.length >= 1000
          ? `${(dim.length / 1000).toFixed(2)}m`
          : `${dim.length}mm`
      ctx.fillText(label, dim.labelPoint.x, dim.labelPoint.y)
    }

    ctx.restore()
  }

  private drawWallPreview(
    preview: { start: { x: number; y: number }; end: { x: number; y: number } },
    options: RenderOptions
  ): void {
    const { ctx } = this

    ctx.save()
    ctx.strokeStyle = options.colors.preview
    ctx.lineWidth = 2 / options.scale
    ctx.setLineDash([8 / options.scale, 4 / options.scale])
    ctx.beginPath()
    ctx.moveTo(preview.start.x, preview.start.y)
    ctx.lineTo(preview.end.x, preview.end.y)
    ctx.stroke()
    ctx.restore()
  }

  resize(width: number, height: number): void {
    this.canvas.width = width
    this.canvas.height = height
  }
}
