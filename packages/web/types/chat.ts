export interface FurnishObject {
  assetId: string
  name?: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale?: { x: number; y: number; z: number }
}

export interface MaterialChange {
  target: string
  materialId: string
}

export interface FurnishVariant {
  name: string
  description: string
  objects: FurnishObject[]
  materials: MaterialChange[]
  estimated_cost?: number
}

export interface ChatAction {
  type:
    | 'auto_furnish'
    | 'restyle_photo'
    | 'modify_object'
    | 'estimate'
    | 'share'
    | 'general'
  variants?: FurnishVariant[]
  images?: string[]
}

export interface MessageRequest {
  project_id: string
  message: string
  attachments?: Array<{ type: string; url: string }>
  floor_plan_data?: Record<string, unknown>
}

export interface MessageResponse {
  reply: string
  intent: string
  actions: ChatAction[]
  images: string[]
  estimate: Record<string, unknown> | null
  credits_used: number
  credits_remaining: number
  message_id: string
}

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatHistoryItem {
  id: string
  role: MessageRole
  content: string
  intent?: string
  actions_data?: { actions: ChatAction[] } | null
  created_at: string
}

/** UI용 로컬 메시지 (API 응답 포함) */
export interface UiMessage {
  id: string
  role: MessageRole
  content: string
  variants?: FurnishVariant[]
  images?: string[]
  isLoading?: boolean
  createdAt: Date
}
