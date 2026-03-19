export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void
  onComplete: () => void
  onError: (error: Error) => void
}

export async function streamChatMessage(
  messages: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  const { onChunk, onComplete, onError } = callbacks
  try {
    const response = await fetch('/api/v1/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        messages: messages.map(({ role, content }) => ({ role, content })),
        stream: true,
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data) as { text?: string }
          if (parsed.text) onChunk(parsed.text)
        } catch {
          onChunk(data)
        }
      }
    }

    onComplete()
  } catch (err) {
    onError(err instanceof Error ? err : new Error('알 수 없는 오류'))
  }
}
