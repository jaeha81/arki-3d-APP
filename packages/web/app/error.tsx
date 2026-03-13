'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>
      <p className="text-[hsl(var(--muted-foreground))]">{error.message}</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  )
}
