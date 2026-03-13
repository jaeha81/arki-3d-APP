import { apiClient } from './client'
import type {
  Estimate,
  EstimateCreateRequest,
  ShareLink,
  SharedProject,
} from '@/types/estimate'

export const estimateApi = {
  create: async (data: EstimateCreateRequest): Promise<Estimate> => {
    const res = await apiClient.post<{ data: Estimate }>('/estimates', data)
    return res.data.data
  },

  get: async (id: string): Promise<Estimate> => {
    const res = await apiClient.get<{ data: Estimate }>(`/estimates/${id}`)
    return res.data.data
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const res = await apiClient.get<Blob>(`/estimates/${id}/pdf`, {
      responseType: 'blob',
    })
    return res.data
  },

  createShareLink: async (projectId: string): Promise<ShareLink> => {
    const res = await apiClient.post<{ data: ShareLink }>(`/share/${projectId}`)
    return res.data.data
  },

  getSharedProject: async (token: string): Promise<SharedProject> => {
    const res = await apiClient.get<SharedProject>(`/share/${token}`)
    return res.data
  },
}
