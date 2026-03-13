'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '@/lib/api/subscription'

export function useMySubscription() {
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: subscriptionApi.getMySubscription,
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: subscriptionApi.getPlans,
  })
}

export function useUpgradePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: subscriptionApi.upgradePlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription', 'me'] })
    },
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: subscriptionApi.getAdminStats,
  })
}

export function useAdminUsers(limit?: number, offset?: number) {
  return useQuery({
    queryKey: ['admin', 'users', limit, offset],
    queryFn: () => subscriptionApi.getAdminUsers(limit, offset),
  })
}
