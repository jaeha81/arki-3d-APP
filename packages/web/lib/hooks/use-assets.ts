import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Asset, AssetCategory } from '@/types/editor'

export function useAssetCategories() {
  return useQuery<AssetCategory[]>({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/asset-categories')
      return res.data.data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useAssets(params?: { categoryId?: string; search?: string; style?: string }) {
  return useQuery<Asset[]>({
    queryKey: ['assets', params],
    queryFn: async () => {
      const res = await apiClient.get('/assets', { params })
      return res.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}
