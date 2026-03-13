import { apiClient } from './client'
import type { MessageRequest, MessageResponse, ChatHistoryItem } from '@/types/chat'

export const chatApi = {
  sendMessage: async (data: MessageRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<{ data: MessageResponse }>('/chat/message', data)
    return res.data.data
  },

  getHistory: async (projectId: string): Promise<ChatHistoryItem[]> => {
    const res = await apiClient.get<{ data: ChatHistoryItem[] }>(
      `/chat/history/${projectId}`,
    )
    return res.data.data
  },
}
