import type { Point2D } from '../types/geometry'
import type { Wall, Room } from '../types/floor-plan'
import { distance2D } from '../utils/math'
import { generateId } from '../utils/id'

interface Node {
  id: string
  point: Point2D
  neighbors: string[]
}

export class RoomDetector {
  private readonly JOIN_THRESHOLD = 50 // mm, 벽 끝점 결합 거리

  detect(walls: Wall[]): Room[] {
    if (walls.length < 3) return []

    // 1. 그래프 구성 (벽 끝점을 노드로)
    const nodes = this.buildGraph(walls)
    if (Object.keys(nodes).length < 3) return []

    // 2. 사이클 탐지 (최소 3개 노드)
    const cycles = this.findMinimalCycles(nodes)

    // 3. Room 객체 생성
    return cycles.map(cycle => {
      const points = cycle.map(id => nodes[id]!.point)
      const area = this.calculatePolygonArea(points)
      const wallIds = this.findWallsForCycle(cycle, walls, nodes)
      const room: Room = {
        id: generateId('room'),
        name: '방',
        wallIds,
        area: Math.abs(area),
      }
      return room
    })
  }

  private buildGraph(walls: Wall[]): Record<string, Node> {
    const nodes: Record<string, Node> = {}

    const getOrCreateNode = (point: Point2D): string => {
      for (const [id, node] of Object.entries(nodes)) {
        if (distance2D(node.point, point) < this.JOIN_THRESHOLD) return id
      }
      const id = generateId('node')
      nodes[id] = { id, point, neighbors: [] }
      return id
    }

    for (const wall of walls) {
      const startId = getOrCreateNode(wall.start)
      const endId = getOrCreateNode(wall.end)
      if (startId === endId) continue

      const startNode = nodes[startId]
      const endNode = nodes[endId]
      if (!startNode || !endNode) continue

      if (!startNode.neighbors.includes(endId)) startNode.neighbors.push(endId)
      if (!endNode.neighbors.includes(startId)) endNode.neighbors.push(startId)
    }

    return nodes
  }

  private findMinimalCycles(nodes: Record<string, Node>): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()

    const dfs = (current: string, parent: string | null, path: string[]): void => {
      if (path.length > 8) return // 최대 8면 방

      const currentNode = nodes[current]
      if (!currentNode) return

      for (const neighbor of currentNode.neighbors) {
        if (neighbor === parent) continue

        const loopIdx = path.indexOf(neighbor)
        if (loopIdx !== -1) {
          const cycle = path.slice(loopIdx)
          if (cycle.length >= 3 && !this.cycleExists(cycles, cycle)) {
            cycles.push([...cycle])
          }
          continue
        }

        if (!visited.has(neighbor)) {
          path.push(neighbor)
          visited.add(neighbor)
          dfs(neighbor, current, path)
          path.pop()
          visited.delete(neighbor)
        }
      }
    }

    for (const nodeId of Object.keys(nodes)) {
      visited.add(nodeId)
      dfs(nodeId, null, [nodeId])
    }

    return cycles
  }

  private cycleExists(cycles: string[][], newCycle: string[]): boolean {
    const sorted = [...newCycle].sort().join(',')
    return cycles.some(c => [...c].sort().join(',') === sorted)
  }

  private calculatePolygonArea(points: Point2D[]): number {
    let area = 0
    const n = points.length
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const pi = points[i]
      const pj = points[j]
      if (!pi || !pj) continue
      area += pi.x * pj.y
      area -= pj.x * pi.y
    }
    return area / 2
  }

  private findWallsForCycle(
    cycle: string[],
    walls: Wall[],
    nodes: Record<string, Node>
  ): string[] {
    const wallIds: string[] = []

    for (let i = 0; i < cycle.length; i++) {
      const aId = cycle[i]
      const bId = cycle[(i + 1) % cycle.length]
      if (!aId || !bId) continue

      const aNode = nodes[aId]
      const bNode = nodes[bId]
      if (!aNode || !bNode) continue

      const a = aNode.point
      const b = bNode.point

      const wall = walls.find(
        w =>
          (distance2D(w.start, a) < this.JOIN_THRESHOLD &&
            distance2D(w.end, b) < this.JOIN_THRESHOLD) ||
          (distance2D(w.start, b) < this.JOIN_THRESHOLD &&
            distance2D(w.end, a) < this.JOIN_THRESHOLD)
      )
      if (wall) wallIds.push(wall.id)
    }

    return wallIds
  }
}
