import React, { useState, useRef, useCallback, useEffect } from 'react'
import { streamChatMessage } from './ai-service'
import type { ChatMessage } from './ai-service'

function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      className={`h-3 rounded bg-gray-200 animate-pulse ${width}`}
    />
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

export function AiDesignPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isInitial, setIsInitial] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || isStreaming) return

      if (isInitial) setIsInitial(false)

      const userMessage: ChatMessage = {
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setInput('')
      setIsStreaming(true)

      let assistantContent = ''

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages([...updatedMessages, assistantMessage])

      streamChatMessage(updatedMessages, {
        onChunk(chunk: string) {
          assistantContent += chunk
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: assistantContent }
            }
            return next
          })
        },
        onComplete() {
          setIsStreaming(false)
        },
        onError(error: Error) {
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last && last.role === 'assistant') {
              next[next.length - 1] = {
                ...last,
                content: `오류가 발생했습니다: ${error.message}`,
              }
            }
            return next
          })
          setIsStreaming(false)
        },
      })
    },
    [input, isStreaming, isInitial, messages]
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isInitial ? (
          <div className="space-y-4 pt-8">
            <p className="text-center text-sm text-gray-500">
              AI 디자인 어시스턴트
            </p>
            <div className="space-y-3 px-4">
              <SkeletonLine width="w-3/4" />
              <SkeletonLine width="w-1/2" />
              <SkeletonLine width="w-5/6" />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              메시지를 입력하여 대화를 시작하세요
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={`${msg.timestamp}-${i}`} message={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 rounded-lg px-3 py-2 space-y-2">
                  <SkeletonLine width="w-32" />
                  <SkeletonLine width="w-20" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-200 p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="디자인 요청을 입력하세요..."
          disabled={isStreaming}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm
                     placeholder:text-gray-400 focus:border-blue-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-blue-700 focus:outline-none
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                     disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          전송
        </button>
      </form>
    </div>
  )
}
