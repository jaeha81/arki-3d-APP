'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Paperclip, Send, X, Bot, FileText, Zap } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useChat } from '@/lib/hooks/use-chat'
import { chatApi } from '@/lib/api/chat'
import { FurnishVariantCard } from './FurnishVariantCard'
import { ImagePreviewGrid } from './ImagePreviewGrid'
import { ConceptProposalCard } from './ConceptProposalCard'
import { EstimateDraftCard } from './EstimateDraftCard'
import { cn } from '@/lib/utils'
import type { UiMessage, ConsultationSummary } from '@/types/chat'

const WELCOME: UiMessage = {
  id: 'system-welcome',
  role: 'assistant',
  content: '안녕하세요! 공간 디자인을 도와드릴게요. 어떻게 꾸며드릴까요?',
  createdAt: new Date(),
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
    </span>
  )
}

interface VariantBlockProps {
  message: UiMessage
}

function VariantBlock({ message }: VariantBlockProps) {
  const setPendingVariants = useEditorStore((s) => s.setPendingVariants)
  const applyVariant = useEditorStore((s) => s.applyVariant)
  const selectedVariantIndex = useEditorStore((s) => s.selectedVariantIndex)
  const [localSelected, setLocalSelected] = useState<number | null>(null)
  const variants = message.variants
  if (!variants || variants.length === 0) return null

  const handleSelect = (index: number) => {
    setLocalSelected(index)
    setPendingVariants(variants)
    useEditorStore.getState().setSelectedVariant(index)
  }
  const handleApply = (index: number) => {
    setPendingVariants(variants)
    applyVariant(index)
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      {variants.map((v, i) => (
        <FurnishVariantCard
          key={`${v.name}-${i}`}
          variant={v}
          index={i}
          isSelected={localSelected === i || selectedVariantIndex === i}
          onSelect={() => handleSelect(i)}
          onApply={() => handleApply(i)}
        />
      ))}
    </div>
  )
}

interface SummaryModalProps {
  summary: ConsultationSummary
  onClose: () => void
}

function SummaryModal({ summary, onClose }: SummaryModalProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center bg-black/50 p-4 pt-8 overflow-y-auto">
      <div className="w-full max-w-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{summary.title}</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          {summary.agreed_style && (
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">합의 스타일</p>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{summary.agreed_style}</p>
            </div>
          )}

          {summary.key_points.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">핵심 요점</p>
              <ul className="flex flex-col gap-1">
                {summary.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-[hsl(var(--foreground))]">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.estimate_draft && (
            <EstimateDraftCard draft={summary.estimate_draft} />
          )}

          {summary.next_actions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">다음 액션</p>
              <ul className="flex flex-col gap-1">
                {summary.next_actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-[hsl(var(--foreground))]">
                    <span className="text-[hsl(var(--primary))]">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed border-t border-[hsl(var(--border))] pt-3">
            {summary.summary_text}
          </p>
        </div>
      </div>
    </div>
  )
}

/** 크레딧 잔여량 배지 */
function CreditBadge({ remaining, cached }: { remaining: number | null; cached: boolean }) {
  if (remaining === null) return null
  const isLow = remaining <= 3
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        isLow
          ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
      )}
      title={cached ? '마지막 응답: 캐시 사용 (크레딧 미소모)' : undefined}
    >
      {cached && <Zap className="h-2.5 w-2.5 text-yellow-500" />}
      AI 크레딧 {remaining}회 남음
    </div>
  )
}

/** 크레딧 소진 업그레이드 CTA */
function CreditExhaustedCard({ upgradeUrl, hint }: { upgradeUrl?: string; hint?: string }) {
  return (
    <div className="mx-3 mb-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
      <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
        월 AI 크레딧이 모두 소진되었습니다
      </p>
      {hint && (
        <p className="text-[11px] text-red-600 dark:text-red-300 mb-2">{hint}</p>
      )}
      {upgradeUrl && (
        <a
          href={upgradeUrl}
          className="inline-block rounded-md bg-red-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-red-700 transition-colors"
        >
          Pro로 업그레이드 →
        </a>
      )}
    </div>
  )
}

export function ChatPanel() {
  const isChatOpen = useEditorStore((s) => s.isChatOpen)
  const toggleChat = useEditorStore((s) => s.toggleChat)
  const { messages: apiMessages, sendMessage, isLoading, credits } = useChat('current-project')
  const allMessages = [WELCOME, ...apiMessages]

  // 마지막 에러 메시지에서 업그레이드 정보 추출
  const lastMsg = apiMessages[apiMessages.length - 1]
  const showUpgradeCta = lastMsg?.isError && lastMsg?.upgradeUrl

  const [inputValue, setInputValue] = useState('')
  const [summaryModal, setSummaryModal] = useState<ConsultationSummary | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  const summaryMutation = useMutation({
    mutationFn: () => chatApi.getConsultationSummary('current-project'),
    onSuccess: (data) => setSummaryModal(data.summary),
  })

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text || isLoading) return
    sendMessage(text)
    setInputValue('')
  }, [inputValue, isLoading, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div
      className={cn(
        'absolute right-0 top-0 z-30 flex h-full w-80 flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg transition-transform duration-200 ease-in-out',
        isChatOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {summaryModal && (
        <SummaryModal summary={summaryModal} onClose={() => setSummaryModal(null)} />
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-3 py-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-semibold">AI 디자인 어시스턴트</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Phase 4: 크레딧 잔여량 실시간 표시 */}
          <CreditBadge remaining={credits.remaining} cached={credits.lastCached} />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="상담 요약"
            disabled={apiMessages.length === 0 || summaryMutation.isPending}
            onClick={() => summaryMutation.mutate()}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-3">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className="max-w-[85%]">
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : msg.isError
                        ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
                  )}
                >
                  {msg.isLoading ? <LoadingDots /> : msg.content}
                </div>

                {!msg.isLoading && msg.variants && msg.variants.length > 0 && (
                  <VariantBlock message={msg} />
                )}

                {!msg.isLoading && msg.images && msg.images.length > 0 && (
                  <ImagePreviewGrid images={msg.images} title="생성된 이미지" />
                )}

                {!msg.isLoading && msg.concept && (
                  <ConceptProposalCard concept={msg.concept} />
                )}

                {!msg.isLoading && msg.estimate_draft && (
                  <EstimateDraftCard draft={msg.estimate_draft} />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 빠른 제안 버튼 */}
      {apiMessages.length === 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {['컨셉 잡아줘', '견적 뽑아줘', '모던하게 꾸며줘'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                sendMessage(suggestion)
              }}
              className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Phase 4: 크레딧 소진 업그레이드 CTA */}
      {showUpgradeCta && (
        <CreditExhaustedCard
          upgradeUrl={lastMsg.upgradeUrl}
          hint={lastMsg.errorHint}
        />
      )}

      {/* 입력 영역 */}
      <div className="border-t border-[hsl(var(--border))] p-2">
        <div className="flex items-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="파일 첨부">
            <Paperclip className="h-4 w-4" />
          </Button>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 resize-none rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
