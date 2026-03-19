// 한국 시공 단가표 (2024년 기준, 단위: 원/m²)

export interface PriceItem {
  id: string
  category:
    | 'flooring'
    | 'wall'
    | 'ceiling'
    | 'painting'
    | 'electrical'
    | 'plumbing'
    | 'furniture'
    | 'labor'
  name: string
  unit: 'm²' | '개' | '식' | 'm'
  unitPrice: number // 원
  laborIncluded: boolean
}

export const PRICE_CATALOG: PriceItem[] = [
  // 바닥재
  {
    id: 'floor-vinyl',
    category: 'flooring',
    name: '강화마루 (고급)',
    unit: 'm²',
    unitPrice: 45000,
    laborIncluded: true,
  },
  {
    id: 'floor-tile',
    category: 'flooring',
    name: '포세린타일 600x600',
    unit: 'm²',
    unitPrice: 65000,
    laborIncluded: true,
  },
  {
    id: 'floor-marble',
    category: 'flooring',
    name: '대리석 마감',
    unit: 'm²',
    unitPrice: 150000,
    laborIncluded: true,
  },
  {
    id: 'floor-wood',
    category: 'flooring',
    name: '원목마루',
    unit: 'm²',
    unitPrice: 85000,
    laborIncluded: true,
  },
  // 벽면
  {
    id: 'wall-paint',
    category: 'wall',
    name: '벽지 도배 (합지)',
    unit: 'm²',
    unitPrice: 8000,
    laborIncluded: true,
  },
  {
    id: 'wall-wallpaper',
    category: 'wall',
    name: '실크 벽지',
    unit: 'm²',
    unitPrice: 15000,
    laborIncluded: true,
  },
  {
    id: 'wall-tile',
    category: 'wall',
    name: '욕실 타일 시공',
    unit: 'm²',
    unitPrice: 55000,
    laborIncluded: true,
  },
  {
    id: 'wall-panel',
    category: 'wall',
    name: '우드 판넬 마감',
    unit: 'm²',
    unitPrice: 95000,
    laborIncluded: true,
  },
  // 천장
  {
    id: 'ceil-paint',
    category: 'ceiling',
    name: '천장 도장',
    unit: 'm²',
    unitPrice: 12000,
    laborIncluded: true,
  },
  {
    id: 'ceil-gypsum',
    category: 'ceiling',
    name: '석고보드 천장',
    unit: 'm²',
    unitPrice: 35000,
    laborIncluded: true,
  },
  {
    id: 'ceil-acoustic',
    category: 'ceiling',
    name: '흡음 천장재',
    unit: 'm²',
    unitPrice: 55000,
    laborIncluded: true,
  },
  // 전기
  {
    id: 'elec-outlet',
    category: 'electrical',
    name: '콘센트 추가',
    unit: '개',
    unitPrice: 35000,
    laborIncluded: true,
  },
  {
    id: 'elec-lighting',
    category: 'electrical',
    name: '조명 설치 (개당)',
    unit: '개',
    unitPrice: 25000,
    laborIncluded: true,
  },
  // 인건비
  {
    id: 'labor-demo',
    category: 'labor',
    name: '철거 작업',
    unit: 'm²',
    unitPrice: 25000,
    laborIncluded: false,
  },
  {
    id: 'labor-cleanup',
    category: 'labor',
    name: '폐기물 처리',
    unit: '식',
    unitPrice: 150000,
    laborIncluded: false,
  },
]

export const LABOR_RATE = 0.3 // 자재비의 30% 인건비 기본 가산

export function getPricesByCategory(category: PriceItem['category']): PriceItem[] {
  return PRICE_CATALOG.filter(p => p.category === category)
}
