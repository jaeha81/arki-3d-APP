'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Paperclip, Send, X, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useChat } from '@/lib/hooks/use-chat'
import { FurnishVariantCard } from './FurnishVariantCard'
import { ImagePreviewGrid } from './ImagePreviewGrid'
import { cn } from '@/lib/utils'
import type { UiMessage } from '@/types/chat'

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

export function ChatPanel() {
  const isChatOpen = useEditorStore((s) => s.isChatOpen)
  const toggleChat = useEditorStore((s) => s.toggleChat)

  const { messages: apiMessages, sendMessage, isLoading } = useChat('current-project')

  const allMessages = [WELCOME, ...apiMessages]

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

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
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-3 py-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-semibold">AI 디자인 어시스턴트</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleChat}>
          <X className="h-4 w-4" />
        </Button>
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
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

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
