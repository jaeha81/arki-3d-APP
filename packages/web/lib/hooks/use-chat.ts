'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { chatApi } from '@/lib/api/chat'
import type { UiMessage } from '@/types/chat'

export interface CreditState {
  remaining: number | null   // null = 아직 모름
  used: number
  lastCached: boolean
}

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [credits, setCredits] = useState<CreditState>({
    remaining: null,
    used: 0,
    lastCached: false,
  })

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
        concept: data.actions.find((a) => a.type === 'concept_proposal')?.concept,
        estimate_draft: data.actions.find((a) => a.type === 'quick_estimate')?.estimate_draft,
        createdAt: new Date(),
      }
      setMessages((prev) => prev.filter((m) => m.id !== 'loading').concat(aiMsg))

      // Phase 4: 크레딧 상태 업데이트
      setCredits({
        remaining: data.credits_remaining,
        used: data.credits_used,
        lastCached: data.cached ?? false,
      })
    },
    onError: (error: unknown) => {
      // Phase 4: 크레딧 소진 에러(429) 처리
      const axiosError = error as { response?: { status?: number; data?: { detail?: { code?: string; message?: string; upgrade_url?: string; hint?: string } } } }
      const detail = axiosError?.response?.data?.detail

      let errorContent = '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
      if (axiosError?.response?.status === 429 && detail?.code === 'CREDIT_EXHAUSTED') {
        errorContent = detail.message ?? '월 AI 크레딧을 모두 사용했습니다.'
      }

      setMessages((prev) =>
        prev.filter((m) => m.id !== 'loading').concat({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: errorContent,
          isError: true,
          upgradeUrl: detail?.upgrade_url,
          errorHint: detail?.hint,
          createdAt: new Date(),
        } as UiMessage & { isError?: boolean; upgradeUrl?: string; errorHint?: string }),
      )
    },
  })

  const sendMessage = useCallback(
    (message: string) => {
      sendMutation.mutate({ project_id: projectId, message })
    },
    [sendMutation, projectId],
  )

  return { messages, sendMessage, isLoading: sendMutation.isPending, credits }
}
