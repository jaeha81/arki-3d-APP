import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Asset, AssetCategory } from '@/types/editor'

export function useAssetCategories() {
  return useQuery<AssetCategory[]>({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AssetCategory[] }>('/asset-categories')
      return res.data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useAssets(params?: { categoryId?: string; search?: string; style?: string }) {
  return useQuery<Asset[]>({
    queryKey: ['assets', params],
    queryFn: async () => {
      const p = new URLSearchParams()
      if (params?.categoryId) p.set('category_id', params.categoryId)
      if (params?.search) p.set('search', params.search)
      if (params?.style) p.set('style', params.style)
      const q = p.toString() ? `?${p.toString()}` : ''
      const res = await apiClient.get<{ data: Asset[] }>(`/assets${q}`)
      return res.data
    },
    staleTime: 1000 * 60 * 5,
  })
}
