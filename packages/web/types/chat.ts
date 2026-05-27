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

export interface ColorSwatch {
  name: string
  hex: string
  usage: string
}

export interface ConceptProposal {
  concept_name: string
  mood: string
  color_palette: ColorSwatch[]
  key_furniture: string[]
  style_keywords: string[]
  budget_range?: { min: number; max: number; currency: string } | null
  summary: string
}

export interface EstimateLineItem {
  category: string
  unit_price?: number | null
  estimated_qty?: string | null
  total: number
}

export interface EstimateDraft {
  room_type: string
  area_m2?: number | null
  breakdown: EstimateLineItem[]
  subtotal: number
  margin_rate: number
  total: number
  notes?: string | null
}

export interface ConsultationSummary {
  title: string
  agreed_style?: string | null
  key_points: string[]
  client_preferences?: Record<string, unknown> | null
  estimate_draft?: EstimateDraft | null
  next_actions: string[]
  summary_text: string
}

export interface ChatAction {
  type:
    | 'auto_furnish'
    | 'restyle_photo'
    | 'modify_object'
    | 'concept_proposal'
    | 'quick_estimate'
    | 'estimate'
    | 'share'
    | 'general'
  variants?: FurnishVariant[]
  images?: string[]
  concept?: ConceptProposal
  estimate_draft?: EstimateDraft
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
  concept?: ConceptProposal
  estimate_draft?: EstimateDraft
  isLoading?: boolean
  createdAt: Date
}

export interface ConsultationSummaryResponse {
  summary: ConsultationSummary
  credits_used: number
  credits_remaining: number
}
