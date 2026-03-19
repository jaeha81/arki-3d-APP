import { apiClient } from './client'
import type { Estimate, EstimateCreateRequest, ShareLink, SharedProject } from '@/types/estimate'

export const estimateApi = {
  create: async (data: EstimateCreateRequest): Promise<Estimate> => {
    const res = await apiClient.post<{ data: Estimate }>('/estimates', data)
    return res.data
  },

  get: async (id: string): Promise<Estimate> => {
    const res = await apiClient.get<{ data: Estimate }>(`/estimates/${id}`)
    return res.data
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1/estimates/${id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${typeof window !== 'undefined' ? (localStorage.getItem('access_token') ?? '') : ''}`,
        },
      }
    )
    if (!response.ok) throw new Error('PDF download failed')
    return response.blob()
  },

  createShareLink: async (projectId: string): Promise<ShareLink> => {
    const res = await apiClient.post<{ data: ShareLink }>(`/share/${projectId}`, {})
    return res.data
  },

  getSharedProject: async (token: string): Promise<SharedProject> => {
    const res = await apiClient.get<SharedProject>(`/share/${token}`)
    return res
  },
}
