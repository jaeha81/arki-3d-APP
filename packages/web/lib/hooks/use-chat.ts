'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { chatApi } from '@/lib/api/chat'
import type { UiMessage } from '@/types/chat'

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<UiMessage[]>([])

  const sendMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onMutate: (variables) => {
      const userMsg: UiMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: variables.message,
        createdAt: new Date(),
      }
      const loadingMsg: UiMessage = {
        id: 'loading',
        role: 'assistant',
        content: '',
        isLoading: true,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, userMsg, loadingMsg])
    },
    onSuccess: (data) => {
      const aiMsg: UiMessage = {
        id: data.message_id,
        role: 'assistant',
        content: data.reply,
        variants: data.actions.find((a) => a.type === 'auto_furnish')?.variants,
        images:
          data.images.length > 0
            ? data.images
            : data.actions.find((a) => a.type === 'restyle_photo')?.images,
        createdAt: new Date(),
      }
      setMessages((prev) => prev.filter((m) => m.id !== 'loading').concat(aiMsg))
    },
    onError: () => {
      setMessages((prev) =>
        prev.filter((m) => m.id !== 'loading').concat({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
          createdAt: new Date(),
        }),
      )
    },
  })

  const sendMessage = useCallback(
    (message: string) => {
      sendMutation.mutate({ project_id: projectId, message })
    },
    [sendMutation, projectId],
  )

  return { messages, sendMessage, isLoading: sendMutation.isPending }
}
