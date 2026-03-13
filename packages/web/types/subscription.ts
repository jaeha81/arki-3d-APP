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
}

export interface AdminUser {
  id: string
  email: string
  full_name: string
  plan: string
  created_at: string
}
