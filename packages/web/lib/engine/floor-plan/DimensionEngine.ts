import type { Point2D } from '../types/geometry'
import type { Wall } from '../types/floor-plan'
import { distance2D, angleBetween } from '../utils/math'

export interface DimensionLine {
  wallId: string
  start: Point2D
  end: Point2D
  length: number // mm
  labelPoint: Point2D
  angle: number // 라디안
  offset: number // 치수선 오프셋 (벽에서 얼마나 떨어졌는지)
}

export class DimensionEngine {
  private readonly OFFSET = 300 // mm, 벽에서 치수선까지 거리

  calculate(walls: Wall[]): DimensionLine[] {
    return walls.map(wall => {
      const length = distance2D(wall.start, wall.end)
      const angle = angleBetween(wall.start, wall.end)

      // 벽의 수직 방향으로 오프셋
      const perpAngle = angle - Math.PI / 2
      const offset = this.OFFSET

      const midX = (wall.start.x + wall.end.x) / 2
      const midY = (wall.start.y + wall.end.y) / 2

      return {
        wallId: wall.id,
        start: {
          x: wall.start.x + Math.cos(perpAngle) * offset,
          y: wall.start.y + Math.sin(perpAngle) * offset,
        },
        end: {
          x: wall.end.x + Math.cos(perpAngle) * offset,
          y: wall.end.y + Math.sin(perpAngle) * offset,
        },
        length: Math.round(length),
        labelPoint: {
          x: midX + Math.cos(perpAngle) * offset,
          y: midY + Math.sin(perpAngle) * offset,
        },
        angle,
        offset,
      }
    })
  }
}
