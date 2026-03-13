import { apiClient } from './client'
import type {
  Subscription,
  PlanInfo,
  AdminStats,
  AdminUser,
} from '@/types/subscription'

export const subscriptionApi = {
  getMySubscription: async (): Promise<Subscription> => {
    const res = await apiClient.get<{ data: Subscription }>('/subscriptions/me')
    return res.data.data
  },

  getPlans: async (): Promise<PlanInfo[]> => {
    const res = await apiClient.get<{ data: PlanInfo[] }>('/subscriptions/plans')
    return res.data.data
  },

  upgradePlan: async (plan: string): Promise<Subscription> => {
    const res = await apiClient.post<{ data: Subscription }>(
      '/subscriptions/upgrade',
      { plan }
    )
    return res.data.data
  },

  // Admin
  getAdminStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get<{ data: AdminStats }>('/admin/stats')
    return res.data.data
  },

  getAdminUsers: async (
    limit?: number,
    offset?: number
  ): Promise<AdminUser[]> => {
    const res = await apiClient.get<{ data: AdminUser[] }>('/admin/users', {
      params: { limit, offset },
    })
    return res.data.data
  },
}
