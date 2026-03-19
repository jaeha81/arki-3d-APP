import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Material } from '@/types/editor'

export function useMaterials(category?: string) {
  return useQuery<Material[]>({
    queryKey: ['materials', category],
    queryFn: async () => {
      const q = category ? `?category=${encodeURIComponent(category)}` : ''
      const res = await apiClient.get<{ data: Material[] }>(`/materials${q}`)
      return res.data
    },
    staleTime: 1000 * 60 * 10,
  })
}
