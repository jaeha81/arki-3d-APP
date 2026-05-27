export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  credits_used: number
  images_used: number
  credits_remaining: number // -1 = unlimited
  images_remaining: number
  is_active: boolean
}

export interface PlanInfo {
  plan: string
  price: number
  credits_per_month: number // -1 = unlimited
  images_per_month: number
  max_projects: number
}

export interface AdminStats {
  total_users: number
  active_subscriptions: number
  pro_users: number
  starter_users: number
  free_users: number
  total_projects: number
  total_estimates: number
  // AI 비용 통계
  ai_calls_today?: number
  ai_calls_this_month?: number
  ai_cost_this_month_usd?: number
  ai_cost_this_month_krw?: number
}

export interface ModelBreakdown {
  model: string
  call_count: number
  total_cost_usd: number
  total_input_tokens: number
  total_output_tokens: number
}

export interface AIStatsDetail {
  daily_calls: { date: string; count: number; cost_usd: number }[]
  model_breakdown: ModelBreakdown[]
  top_users: { user_id: string; email: string; credits_used: number; cost_usd: number }[]
}

export interface AdminUser {
  id: string
  email: string
  full_name: string
  plan: string
  created_at: string
}
