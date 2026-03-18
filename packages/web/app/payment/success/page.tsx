'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paymentApi } from '@/lib/api/payment'
import type { PaymentRecord } from '@/types/payment'

type State = 'loading' | 'success' | 'error'

export default function PaymentSuccessPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<State>('loading')
  const [payment, setPayment] = useState<PaymentRecord | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const paymentKey = params.get('paymentKey')
    const orderId = params.get('orderId')
    const amount = params.get('amount')
    if (!paymentKey || !orderId || !amount) {
      setErrorMsg('결제 정보가 올바르지 않습니다.')
      setState('error')
      return
    }
    paymentApi
      .confirm(paymentKey, orderId, Number(amount))
      .then((data) => { setPayment(data); setState('success') })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.detail ?? '결제 확인 중 오류가 발생했습니다.')
        setState('error')
      })
  }, [params])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">결제 확인 중...</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <div className="text-center">
          <h1 className="text-2xl font-bold">결제 확인 실패</h1>
          <p className="mt-2 text-muted-foreground">{errorMsg}</p>
        </div>
        <Button onClick={() => router.push('/settings/billing')}>다시 시도</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">결제 완료!</h1>
        <p className="mt-2 text-muted-foreground">
          <span className="font-semibold capitalize">{payment?.plan}</span> 플랜이 활성화되었습니다.
        </p>
        <p className="mt-1 text-lg font-semibold">
          {payment ? `${payment.amount.toLocaleString('ko-KR')}원` : ''}
        </p>
      </div>
      {payment?.receipt_url && (
        <a
          href={payment.receipt_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          영수증 보기
        </a>
      )}
      <Button onClick={() => router.push('/projects')}>대시보드로 이동</Button>
    </div>
  )
}
