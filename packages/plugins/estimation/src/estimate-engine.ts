import type { FloorPlan, Wall, Room } from '../../core/src/types'
import { PRICE_CATALOG, LABOR_RATE } from './price-catalog'

export interface EstimateLineItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface EstimateResult {
  projectName: string
  totalArea: number // m²
  lineItems: EstimateLineItem[]
  subtotal: number
  laborCost: number
  vat: number
  grandTotal: number
  generatedAt: string
}

export interface EstimateOptions {
  flooringId?: string
  wallFinishId?: string
  ceilingId?: string
  includeElectrical?: boolean
  includeLabor?: boolean
}

// mm² → m² 변환
function mmSqToMSq(mmSq: number): number {
  return mmSq / 1_000_000
}

// 벽 길이 계산 (mm)
function wallLength(wall: Wall): number {
  const dx = wall.end.x - wall.start.x
  const dy = wall.end.y - wall.start.y
  return Math.sqrt(dx * dx + dy * dy)
}

// 방 면적 계산 (m²) — room.area is in mm²
function getRoomArea(room: Room): number {
  return mmSqToMSq(room.area)
}

export function calculateEstimate(plan: FloorPlan, options: EstimateOptions = {}): EstimateResult {
  const {
    flooringId = 'floor-vinyl',
    wallFinishId = 'wall-paint',
    ceilingId = 'ceil-paint',
    includeElectrical = true,
    includeLabor = true,
  } = options

  const totalRoomArea = plan.rooms.reduce((sum, r) => sum + getRoomArea(r), 0)
  // mm → m
  const totalWallLength = plan.walls.reduce((sum, w) => sum + wallLength(w) / 1000, 0)

  const lineItems: EstimateLineItem[] = []

  // 바닥재
  const floorItem = PRICE_CATALOG.find(p => p.id === flooringId)
  if (floorItem !== undefined && totalRoomArea > 0) {
    lineItems.push({
      id: floorItem.id,
      name: floorItem.name,
      category: '바닥',
      quantity: Math.ceil(totalRoomArea),
      unit: floorItem.unit,
      unitPrice: floorItem.unitPrice,
      total: Math.ceil(totalRoomArea) * floorItem.unitPrice,
    })
  }

  // 벽 마감
  const wallItem = PRICE_CATALOG.find(p => p.id === wallFinishId)
  if (wallItem !== undefined && totalWallLength > 0) {
    const wallArea = totalWallLength * 2.7 // 벽 높이 2700mm = 2.7m
    lineItems.push({
      id: wallItem.id,
      name: wallItem.name,
      category: '벽',
      quantity: Math.ceil(wallArea),
      unit: wallItem.unit,
      unitPrice: wallItem.unitPrice,
      total: Math.ceil(wallArea) * wallItem.unitPrice,
    })
  }

  // 천장
  const ceilItem = PRICE_CATALOG.find(p => p.id === ceilingId)
  if (ceilItem !== undefined && totalRoomArea > 0) {
    lineItems.push({
      id: ceilItem.id,
      name: ceilItem.name,
      category: '천장',
      quantity: Math.ceil(totalRoomArea),
      unit: ceilItem.unit,
      unitPrice: ceilItem.unitPrice,
      total: Math.ceil(totalRoomArea) * ceilItem.unitPrice,
    })
  }

  // 전기
  if (includeElectrical) {
    const outletCount = Math.max(plan.rooms.length * 3, 6)
    const outletItem = PRICE_CATALOG.find(p => p.id === 'elec-outlet')
    if (outletItem !== undefined) {
      lineItems.push({
        id: 'elec-outlet',
        name: '콘센트 추가',
        category: '전기',
        quantity: outletCount,
        unit: '개',
        unitPrice: outletItem.unitPrice,
        total: outletCount * outletItem.unitPrice,
      })
    }
  }

  // 철거 + 폐기물
  if (includeLabor) {
    const demoItem = PRICE_CATALOG.find(p => p.id === 'labor-demo')
    if (demoItem !== undefined) {
      lineItems.push({
        id: 'labor-demo',
        name: '철거 작업',
        category: '인건비',
        quantity: Math.ceil(totalRoomArea),
        unit: 'm²',
        unitPrice: demoItem.unitPrice,
        total: Math.ceil(totalRoomArea) * demoItem.unitPrice,
      })
    }

    const cleanupItem = PRICE_CATALOG.find(p => p.id === 'labor-cleanup')
    if (cleanupItem !== undefined) {
      lineItems.push({
        id: 'labor-cleanup',
        name: '폐기물 처리',
        category: '인건비',
        quantity: 1,
        unit: '식',
        unitPrice: cleanupItem.unitPrice,
        total: cleanupItem.unitPrice,
      })
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  // laborCost는 인건비 항목을 포함하지 않을 때만 LABOR_RATE 가산
  const laborCost = includeLabor ? 0 : Math.round(subtotal * LABOR_RATE)
  const vat = Math.round((subtotal + laborCost) * 0.1)
  const grandTotal = subtotal + laborCost + vat

  return {
    projectName: plan.metadata.name,
    totalArea: totalRoomArea,
    lineItems,
    subtotal,
    laborCost,
    vat,
    grandTotal,
    generatedAt: new Date().toISOString(),
  }
}
