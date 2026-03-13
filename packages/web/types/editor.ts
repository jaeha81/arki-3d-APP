export type ViewMode = '2d' | '3d' | 'split'
export type EditorTool = 'select' | 'wall' | 'door' | 'window' | 'furniture' | 'measure'

export interface Asset {
  id: string
  categoryId: string
  name: string
  slug: string
  description?: string
  thumbnailUrl?: string
  modelUrl?: string
  widthMm?: number
  depthMm?: number
  heightMm?: number
  tags: string[]
  style?: string
  isFree: boolean
}

export interface AssetCategory {
  id: string
  parentId?: string
  name: string
  slug: string
  icon?: string
  sortOrder: number
  children?: AssetCategory[]
}

export interface Material {
  id: string
  name: string
  category: 'wall' | 'floor' | 'ceiling'
  thumbnailUrl?: string
  textureUrl?: string
  colorHex?: string
  isFree: boolean
}

export interface EditorSelection {
  type: 'wall' | 'door' | 'window' | 'furniture' | 'room' | null
  id: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
