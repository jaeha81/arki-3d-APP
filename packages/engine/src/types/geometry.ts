/** 2D 좌표 (단위: mm) */
export interface Point2D {
  x: number
  y: number
}

/** 3D 좌표 (단위: mm) */
export interface Point3D {
  x: number
  y: number
  z: number
}

/** 축-정렬 경계 박스 */
export interface BoundingBox2D {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** 선분 */
export interface Segment2D {
  start: Point2D
  end: Point2D
}

/** 변환 행렬 (2D) */
export interface Transform2D {
  translateX: number
  translateY: number
  rotation: number   // 라디안
  scaleX: number
  scaleY: number
}
