export interface EstimateItem {
  id: string
  category: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
}

export interface Estimate {
  id: string
  project_id: string
  name: string
  material_cost: number
  labor_cost: number
  margin_rate: number
  total_cost: number
  items: EstimateItem[]
  created_at: string
}

export interface EstimateCreateRequest {
  project_id: string
  name?: string
  scene_data: Record<string, unknown>
}

export interface ShareLink {
  token: string
  url: string
  project_id: string
  is_active: boolean
  view_count: number
}

export interface SharedProject {
  project_id: string
  name: string
  scene_data: Record<string, unknown>
}
