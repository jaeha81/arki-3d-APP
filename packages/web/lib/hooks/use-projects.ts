'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Project, ApiResponse, PaginatedResponse } from '@/types'

const STALE_TIME = 5 * 60 * 1000
const GC_TIME = 30 * 60 * 1000

interface CreateProjectPayload {
  name: string
  description?: string
}

export function useProjects() {
  const queryClient = useQueryClient()

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<PaginatedResponse<Project>>('/projects'),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

  const createProject = useMutation({
    mutationFn: async (payload: CreateProjectPayload) => {
      const res = await apiClient.post<ApiResponse<Project>>('/projects', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const deleteProject = useMutation({
    mutationFn: (projectId: string) => apiClient.delete(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return { projectsQuery, createProject, deleteProject }
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: Boolean(projectId),
  })
}
