import type { FloorPlan, Wall, Door, WindowElement, FurniturePlacement } from '../types/floor-plan'
import type { Point2D } from '../types/geometry'
import { WALL_DEFAULTS } from '../types/floor-plan'

// ─── 출력 데이터 타입 ─────────────────────────────────────

/** 박스 세그먼트 (개구부로 분할된 벽 조각) */
export interface BoxSegment {
  position: [number, number, number] // center X, Y, Z (mm)
  size: [number, number, number]     // width, height, depth (mm)
}

/** 벽 메쉬 데이터 */
export interface WallMeshData {
  id: string
  segments: BoxSegment[]
}

/** 바닥/천장 폴리곤 데이터 */
export interface FloorData {
  vertices: [number, number][] // XZ 폴리곤 (mm)
  y: number
}

/** 3D 가구 배치 데이터 */
export interface FurniturePlacement3D {
  id: string
  assetId: string
  position: [number, number, number]
  rotationY: number
}

/** 전체 씬 데이터 */
export interface SceneData {
  walls: WallMeshData[]
  floor: FloorData | null
  ceiling: FloorData | null
  furniture: FurniturePlacement3D[]
}

// ─── 내부 유틸 ────────────────────────────────────────────

function dist2D(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/** 벽의 2D 방향 각도 (라디안) */
function wallAngle(wall: Wall): number {
  return Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x)
}

/** 벽 중심의 2D 좌표 → 3D 좌표 */
function wallCenter2D(wall: Wall): Point2D {
  return {
    x: (wall.start.x + wall.end.x) / 2,
    y: (wall.start.y + wall.end.y) / 2,
  }
}

// ─── 개구부 정보 ──────────────────────────────────────────

interface Opening {
  /** 벽 시작점으로부터의 거리 (mm, 개구부 중심) */
  centerOffset: number
  /** 개구부 폭 (mm) */
  width: number
  /** 개구부 하단 높이 (mm, 바닥 기준) */
  bottomY: number
  /** 개구부 상단 높이 (mm, 바닥 기준) */
  topY: number
}

function collectOpenings(
  wall: Wall,
  doors: Door[],
  windows: WindowElement[]
): Opening[] {
  const wallLen = dist2D(wall.start, wall.end)
  const openings: Opening[] = []

  for (const door of doors) {
    if (door.wallId !== wall.id) continue
    const centerOffset = door.position * wallLen
    openings.push({
      centerOffset,
      width: door.width,
      bottomY: 0,
      topY: door.height,
    })
  }

  for (const win of windows) {
    if (win.wallId !== wall.id) continue
    const centerOffset = win.position * wallLen
    openings.push({
      centerOffset,
      width: win.width,
      bottomY: win.sillHeight,
      topY: win.sillHeight + win.height,
    })
  }

  // 중심 오프셋 기준 정렬
  openings.sort((a, b) => a.centerOffset - b.centerOffset)
  return openings
}

// ─── 벽 세그먼트 생성 ────────────────────────────────────

/**
 * 벽을 세그먼트로 분할한다.
 * 개구부가 없으면 1개 BoxSegment.
 * 개구부가 있으면 개구부 좌/우 + 개구부 위/아래 세그먼트.
 *
 * 좌표계: 2D x→3D x, 2D y→3D z, height→3D y
 * 벽의 로컬 축: 길이(wallLength)→ 벽 방향, 두께→ 법선 방향
 */
function buildWallSegments(
  wall: Wall,
  doors: Door[],
  windows: WindowElement[]
): BoxSegment[] {
  const wallLen = dist2D(wall.start, wall.end)
  if (wallLen < 1) return []

  const angle = wallAngle(wall)
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const height = wall.height || WALL_DEFAULTS.HEIGHT
  const thickness = wall.thickness || WALL_DEFAULTS.THICKNESS

  const center2D = wallCenter2D(wall)
  // 3D 좌표에서 벽 중심: x→2D x, z→2D y
  const cx = center2D.x
  const cz = center2D.y

  const openings = collectOpenings(wall, doors, windows)

  if (openings.length === 0) {
    // 개구부 없음 → 단일 박스
    return [
      {
        position: [cx, height / 2, cz],
        size: [wallLen, height, thickness],
      },
    ]
  }

  // 개구부 있는 벽 → 세그먼트 분할
  const segments: BoxSegment[] = []

  // 벽 시작점 기준으로 로컬 좌표 사용
  // 로컬 offset 0 = wall.start, offset wallLen = wall.end
  let prevEnd = 0

  for (const opening of openings) {
    const openStart = opening.centerOffset - opening.width / 2
    const openEnd = opening.centerOffset + opening.width / 2

    // 개구부 왼쪽 채움 세그먼트
    if (openStart > prevEnd + 1) {
      const segLen = openStart - prevEnd
      const segCenterLocal = prevEnd + segLen / 2
      // 로컬 → 월드
      const segCX = wall.start.x + cosA * segCenterLocal
      const segCZ = wall.start.y + sinA * segCenterLocal
      segments.push({
        position: [segCX, height / 2, segCZ],
        size: [segLen, height, thickness],
      })
    }

    // 개구부 아래 세그먼트 (sillHeight > 0인 창문)
    if (opening.bottomY > 0) {
      const segCX = wall.start.x + cosA * opening.centerOffset
      const segCZ = wall.start.y + sinA * opening.centerOffset
      segments.push({
        position: [segCX, opening.bottomY / 2, segCZ],
        size: [opening.width, opening.bottomY, thickness],
      })
    }

    // 개구부 위 세그먼트 (상인방)
    if (opening.topY < height) {
      const remainH = height - opening.topY
      const segCX = wall.start.x + cosA * opening.centerOffset
      const segCZ = wall.start.y + sinA * opening.centerOffset
      segments.push({
        position: [segCX, opening.topY + remainH / 2, segCZ],
        size: [opening.width, remainH, thickness],
      })
    }

    prevEnd = openEnd
  }

  // 마지막 개구부 오른쪽 채움
  if (prevEnd < wallLen - 1) {
    const segLen = wallLen - prevEnd
    const segCenterLocal = prevEnd + segLen / 2
    const segCX = wall.start.x + cosA * segCenterLocal
    const segCZ = wall.start.y + sinA * segCenterLocal
    segments.push({
      position: [segCX, height / 2, segCZ],
      size: [segLen, height, thickness],
    })
  }

  return segments
}

// ─── 바닥/천장 폴리곤 ─────────────────────────────────────

function buildFloorPolygon(walls: Wall[]): [number, number][] | null {
  if (walls.length === 0) return null

  // 모든 벽의 bounding box로 바닥 폴리곤 생성
  let minX = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxZ = -Infinity

  for (const wall of walls) {
    minX = Math.min(minX, wall.start.x, wall.end.x)
    maxX = Math.max(maxX, wall.start.x, wall.end.x)
    minZ = Math.min(minZ, wall.start.y, wall.end.y)
    maxZ = Math.max(maxZ, wall.start.y, wall.end.y)
  }

  return [
    [minX, minZ],
    [maxX, minZ],
    [maxX, maxZ],
    [minX, maxZ],
  ]
}

// ─── 가구 변환 ────────────────────────────────────────────

function buildFurniture(items: FurniturePlacement[]): FurniturePlacement3D[] {
  return items.map(f => ({
    id: f.id,
    assetId: f.assetId,
    position: [f.position.x, 0, f.position.y] as [number, number, number],
    rotationY: f.rotation,
  }))
}

// ─── 메인 빌드 함수 ───────────────────────────────────────

/** FloorPlan → 3D SceneData 변환 (순수 데이터, Three.js 의존 없음) */
export function buildScene(floorPlan: FloorPlan): SceneData {
  // 벽 변환
  const walls: WallMeshData[] = floorPlan.walls.map(wall => ({
    id: wall.id,
    segments: buildWallSegments(wall, floorPlan.doors, floorPlan.windows),
  }))

  // 바닥 / 천장
  const floorVerts = buildFloorPolygon(floorPlan.walls)
  const defaultH: number = WALL_DEFAULTS.HEIGHT
  const maxHeight = floorPlan.walls.reduce<number>(
    (h, w) => Math.max(h, w.height || defaultH),
    defaultH
  )

  const floor: FloorData | null = floorVerts
    ? { vertices: floorVerts, y: 0 }
    : null
  const ceiling: FloorData | null = floorVerts
    ? { vertices: floorVerts, y: maxHeight }
    : null

  // 가구
  const furniture = buildFurniture(floorPlan.furniture)

  return { walls, floor, ceiling, furniture }
}
