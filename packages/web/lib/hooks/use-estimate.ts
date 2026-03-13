import { useMutation, useQuery } from '@tanstack/react-query'
import { estimateApi } from '@/lib/api/estimate'
import type { EstimateCreateRequest } from '@/types/estimate'

export function useCreateEstimate() {
  return useMutation({
    mutationFn: (data: EstimateCreateRequest) => estimateApi.create(data),
  })
}

export function useEstimate(id: string | null) {
  return useQuery({
    queryKey: ['estimate', id],
    queryFn: () => estimateApi.get(id!),
    enabled: !!id,
  })
}

export function useShareLink() {
  return useMutation({
    mutationFn: (projectId: string) => estimateApi.createShareLink(projectId),
  })
}
