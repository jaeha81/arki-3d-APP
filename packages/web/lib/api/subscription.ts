import { apiClient } from './client'
import type { Subscription, PlanInfo, AdminStats, AdminUser } from '@/types/subscription'

export const subscriptionApi = {
  getMySubscription: async (): Promise<Subscription> => {
    const res = await apiClient.get<{ data: Subscription }>('/subscriptions/me')
    return res.data
  },

  getPlans: async (): Promise<PlanInfo[]> => {
    const res = await apiClient.get<{ data: PlanInfo[] }>('/subscriptions/plans')
    return res.data
  },

  upgradePlan: async (plan: string): Promise<Subscription> => {
    const res = await apiClient.post<{ data: Subscription }>('/subscriptions/upgrade', { plan })
    return res.data
  },

  // Admin
  getAdminStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get<{ data: AdminStats }>('/admin/stats')
    return res.data
  },

  getAdminUsers: async (limit?: number, offset?: number): Promise<AdminUser[]> => {
    const params = new URLSearchParams()
    if (limit !== undefined) params.set('limit', String(limit))
    if (offset !== undefined) params.set('offset', String(offset))
    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await apiClient.get<{ data: AdminUser[] }>(`/admin/users${query}`)
    return res.data
  },
}
