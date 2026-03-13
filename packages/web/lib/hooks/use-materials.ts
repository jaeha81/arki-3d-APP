import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Material } from '@/types/editor'

export function useMaterials(category?: string) {
  return useQuery<Material[]>({
    queryKey: ['materials', category],
    queryFn: async () => {
      const res = await apiClient.get('/materials', { params: { category } })
      return res.data.data
    },
    staleTime: 1000 * 60 * 10,
  })
}
