'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentFailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const code = params.get('code') ?? ''
  const message = params.get('message') ?? '알 수 없는 오류가 발생했습니다.'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <XCircle className="h-16 w-16 text-destructive" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">결제 실패</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
        {code && <p className="mt-1 text-xs text-muted-foreground">오류 코드: {code}</p>}
      </div>
      <Button onClick={() => router.push('/settings/billing')}>다시 시도</Button>
    </div>
  )
}
