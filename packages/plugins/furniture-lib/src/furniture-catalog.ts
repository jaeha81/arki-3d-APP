export type FurnitureCategory =
  | 'living' // 거실
  | 'bedroom' // 침실
  | 'dining' // 주방/식당
  | 'office' // 서재/사무실
  | 'bathroom' // 욕실
  | 'storage' // 수납

export interface FurnitureAsset {
  id: string
  name: string
  category: FurnitureCategory
  brand?: string
  width: number // mm
  depth: number // mm
  height: number // mm
  modelUrl: string // GLB URL (placeholder)
  thumbnailUrl: string // thumbnail (placeholder)
  tags: string[]
  price?: number // KRW 참고가격
}

// Base URL for placeholder models (three.js example assets)
const MODEL_BASE = 'https://threejs.org/examples/models/gltf'
const PLACEHOLDER = `${MODEL_BASE}/Duck/glTF-Binary/Duck.glb`

export const FURNITURE_CATALOG: FurnitureAsset[] = [
  // ─── 거실 ────────────────────────────────────────────────────────────────────
  {
    id: 'sofa-3seat',
    name: '3인 소파',
    category: 'living',
    width: 2100,
    depth: 900,
    height: 850,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['소파', '거실', '3인용'],
    price: 890000,
  },
  {
    id: 'sofa-2seat',
    name: '2인 소파',
    category: 'living',
    width: 1600,
    depth: 900,
    height: 850,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['소파', '거실', '2인용'],
    price: 650000,
  },
  {
    id: 'sofa-single',
    name: '1인 암체어',
    category: 'living',
    width: 900,
    depth: 850,
    height: 850,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['소파', '거실', '1인용', '암체어'],
    price: 350000,
  },
  {
    id: 'coffee-table',
    name: '거실 테이블',
    category: 'living',
    width: 1200,
    depth: 600,
    height: 430,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['테이블', '거실', '커피테이블'],
    price: 280000,
  },
  {
    id: 'tv-stand',
    name: 'TV 콘솔',
    category: 'living',
    width: 1800,
    depth: 400,
    height: 450,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['TV장', '거실', '콘솔'],
    price: 420000,
  },
  {
    id: 'bookshelf',
    name: '책장 (5단)',
    category: 'living',
    width: 800,
    depth: 300,
    height: 1800,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['책장', '수납', '5단'],
    price: 250000,
  },

  // ─── 침실 ────────────────────────────────────────────────────────────────────
  {
    id: 'bed-queen',
    name: '퀸 침대',
    category: 'bedroom',
    width: 1600,
    depth: 2100,
    height: 500,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['침대', '침실', '퀸'],
    price: 780000,
  },
  {
    id: 'bed-single',
    name: '싱글 침대',
    category: 'bedroom',
    width: 1000,
    depth: 2000,
    height: 500,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['침대', '침실', '싱글'],
    price: 450000,
  },
  {
    id: 'nightstand',
    name: '협탁',
    category: 'bedroom',
    width: 450,
    depth: 400,
    height: 580,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['협탁', '침실'],
    price: 150000,
  },
  {
    id: 'wardrobe',
    name: '옷장 (3문)',
    category: 'bedroom',
    width: 1800,
    depth: 600,
    height: 2100,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['옷장', '침실', '수납'],
    price: 950000,
  },
  {
    id: 'dresser',
    name: '화장대',
    category: 'bedroom',
    width: 1000,
    depth: 500,
    height: 750,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['화장대', '침실'],
    price: 320000,
  },

  // ─── 주방/식당 ───────────────────────────────────────────────────────────────
  {
    id: 'dining-table-4',
    name: '4인 식탁',
    category: 'dining',
    width: 1400,
    depth: 800,
    height: 750,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['식탁', '식당', '4인'],
    price: 480000,
  },
  {
    id: 'dining-table-6',
    name: '6인 식탁',
    category: 'dining',
    width: 1800,
    depth: 900,
    height: 750,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['식탁', '식당', '6인'],
    price: 680000,
  },
  {
    id: 'dining-chair',
    name: '식탁 의자',
    category: 'dining',
    width: 450,
    depth: 500,
    height: 850,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['의자', '식당'],
    price: 85000,
  },
  {
    id: 'kitchen-island',
    name: '주방 아일랜드',
    category: 'dining',
    width: 1200,
    depth: 700,
    height: 900,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['아일랜드', '주방', '수납'],
    price: 850000,
  },

  // ─── 서재/사무실 ─────────────────────────────────────────────────────────────
  {
    id: 'desk',
    name: '사무용 책상',
    category: 'office',
    width: 1400,
    depth: 700,
    height: 750,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['책상', '서재', '사무실'],
    price: 320000,
  },
  {
    id: 'office-chair',
    name: '사무용 의자',
    category: 'office',
    width: 640,
    depth: 640,
    height: 1150,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['의자', '서재', '사무실'],
    price: 280000,
  },
  {
    id: 'filing-cabinet',
    name: '서랍장',
    category: 'office',
    width: 420,
    depth: 500,
    height: 700,
    modelUrl: PLACEHOLDER,
    thumbnailUrl: '',
    tags: ['서랍장', '수납', '사무실'],
    price: 180000,
  },
]

export function getByCategory(category: FurnitureCategory): FurnitureAsset[] {
  return FURNITURE_CATALOG.filter(f => f.category === category)
}

export function searchFurniture(query: string): FurnitureAsset[] {
  const lower = query.toLowerCase()
  return FURNITURE_CATALOG.filter(
    f => f.name.includes(query) || f.tags.some(t => t.includes(query)) || f.id.includes(lower)
  )
}

export const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  living: '거실',
  bedroom: '침실',
  dining: '주방/식당',
  office: '서재/사무실',
  bathroom: '욕실',
  storage: '수납',
}
