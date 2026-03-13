import type { Point2D } from '../types/geometry'
import { distance2D, angleBetween } from '../utils/math'
import type { Wall } from '../types/floor-plan'

export interface SnapResult {
  point: Point2D
  snapped: boolean
  snapType: 'grid' | 'angle' | 'point' | 'none'
}

export class SnapEngine {
  constructor(
    private gridSize: number = 100,
    private angleSnap: boolean = true,
    private pointSnap: boolean = true,
    private pointSnapThreshold: number = 200 // mm
  ) {}

  setGridSize(size: number): void {
    this.gridSize = size
  }

  snapToGrid(point: Point2D): SnapResult {
    return {
      point: {
        x: Math.round(point.x / this.gridSize) * this.gridSize,
        y: Math.round(point.y / this.gridSize) * this.gridSize,
      },
      snapped: true,
      snapType: 'grid',
    }
  }

  snapToAngle(start: Point2D, current: Point2D): SnapResult {
    if (!this.angleSnap) return { point: current, snapped: false, snapType: 'none' }

    const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
    const angle = angleBetween(start, current) * (180 / Math.PI)
    const dist = distance2D(start, current)
    const normalizedAngle = ((angle % 360) + 360) % 360

    let closest = SNAP_ANGLES[0]!
    let minDiff = 360

    for (const a of SNAP_ANGLES) {
      const diff = Math.abs(normalizedAngle - a)
      const wrappedDiff = Math.min(diff, 360 - diff)
      if (wrappedDiff < minDiff) {
        minDiff = wrappedDiff
        closest = a
      }
    }

    if (minDiff > 10) return { point: current, snapped: false, snapType: 'none' }

    const rad = (closest * Math.PI) / 180
    return {
      point: {
        x: start.x + Math.cos(rad) * dist,
        y: start.y + Math.sin(rad) * dist,
      },
      snapped: true,
      snapType: 'angle',
    }
  }

  snapToWallPoints(point: Point2D, walls: Wall[]): SnapResult {
    if (!this.pointSnap) return { point, snapped: false, snapType: 'none' }

    let closest: Point2D | null = null
    let minDist = this.pointSnapThreshold

    for (const wall of walls) {
      for (const pt of [wall.start, wall.end]) {
        const d = distance2D(point, pt)
        if (d < minDist) {
          minDist = d
          closest = pt
        }
      }
    }

    if (closest) return { point: closest, snapped: true, snapType: 'point' }
    return { point, snapped: false, snapType: 'none' }
  }

  snap(point: Point2D, walls: Wall[], drawStart?: Point2D): SnapResult {
    // 우선순위: 포인트 스냅 > 각도 스냅 > 그리드 스냅
    const pointResult = this.snapToWallPoints(point, walls)
    if (pointResult.snapped) return pointResult

    if (drawStart) {
      const angleResult = this.snapToAngle(drawStart, point)
      if (angleResult.snapped) {
        // 각도 스냅된 점에 그리드도 적용
        const gridResult = this.snapToGrid(angleResult.point)
        return { ...gridResult, snapType: 'angle' }
      }
    }

    return this.snapToGrid(point)
  }
}
