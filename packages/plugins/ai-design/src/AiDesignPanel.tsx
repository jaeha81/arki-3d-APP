'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { PluginContext } from '@arki/plugin-core'
import { streamChatMessage, type ChatMessage } from './ai-service'

interface UiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  '거실을 모던하게 꾸며줘',
  '소파 배치를 최적화해줘',
  '현재 공간에 어울리는 컬러 제안해줘',
  '침실 가구 배치 추천해줘',
  '좁은 공간을 넓어 보이게 해줘',
]

interface Props {
  ctx: PluginContext
}

export function AiDesignPanel({ ctx }: Props) {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        '안녕하세요! AI 디자인 어시스턴트입니다. 인테리어 디자인 제안이나 가구 배치에 대해 물어보세요.',
      timestamp: new Date(),
    },
  ])
  // Separate history fed to API (no ids, uses numeric timestamps)
  const chatHistoryRef = useRef<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      const userUiMsg: UiMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userUiMsg])
      setInput('')
      setIsStreaming(true)

      // Build floor-plan context and inject it into the API message
      const plan = ctx.scene.getFloorPlan()
      const contextNote = `[도면 정보: 방 ${plan.rooms.length}개, 벽 ${plan.walls.length}개, 가구 ${plan.furniture.length}개] `
      const apiUserMsg: ChatMessage = {
        role: 'user',
        content: contextNote + text.trim(),
        timestamp: Date.now(),
      }

      chatHistoryRef.current = [...chatHistoryRef.current, apiUserMsg]

      const assistantId = (Date.now() + 1).toString()
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
      ])

      let assistantText = ''

      try {
        await streamChatMessage(chatHistoryRef.current, {
          onChunk: (chunk: string) => {
            assistantText += chunk
            setMessages(prev =>
              prev.map(m => (m.id === assistantId ? { ...m, content: assistantText } : m))
            )
          },
          onComplete: () => {
            // Append assistant reply to history for multi-turn context
            chatHistoryRef.current = [
              ...chatHistoryRef.current,
              { role: 'assistant', content: assistantText, timestamp: Date.now() },
            ]
          },
          onError: (err: Error) => {
            const errorMsg = `AI 서비스에 연결할 수 없습니다: ${err.message}`
            setMessages(prev =>
              prev.map(m => (m.id === assistantId ? { ...m, content: errorMsg } : m))
            )
          },
        })
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: 'AI 서비스에 연결할 수 없습니다. API 설정을 확인해주세요.' }
              : m
          )
        )
      } finally {
        setIsStreaming(false)
        inputRef.current?.focus()
      }
    },
    [ctx, isStreaming]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content ||
                (isStreaming && msg.role === 'assistant' ? (
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                      ·
                    </span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
                      ·
                    </span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
                      ·
                    </span>
                  </span>
                ) : null)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts — shown only on first interaction */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => void sendMessage(p)}
              disabled={isStreaming}
              className="text-xs px-2 py-1 border rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="디자인 요청을 입력하세요..."
          disabled={isStreaming}
          className="flex-1 text-sm border rounded-md px-3 py-2 bg-background disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          전송
        </button>
      </form>
    </div>
  )
}
