import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'

const PREFETCH_STALE_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Prefetches editor data (project, assets, materials) on hover
 * to eliminate loading latency when the user opens a project.
 */
export function usePrefetchEditorData(projectId: string) {
  const queryClient = useQueryClient()

  const prefetch = useCallback(() => {
    if (!projectId) return

    // Prefetch project detail
    queryClient.prefetchQuery({
      queryKey: ['projects', projectId],
      queryFn: () => apiClient.get(`/projects/${projectId}`),
      staleTime: PREFETCH_STALE_TIME,
    })

    // Prefetch assets list
    queryClient.prefetchQuery({
      queryKey: ['assets', undefined],
      queryFn: () => apiClient.get('/assets'),
      staleTime: PREFETCH_STALE_TIME,
    })

    // Prefetch materials list
    queryClient.prefetchQuery({
      queryKey: ['materials', undefined],
      queryFn: () => apiClient.get('/materials'),
      staleTime: PREFETCH_STALE_TIME,
    })
  }, [projectId, queryClient])

  return { prefetch }
}
