'use client'

import { useEffect, useState, useCallback } from 'react'
import Script from 'next/script'
import { CheckCircle2, Zap, Building2, Sparkles } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { subscriptionApi } from '@/lib/api/subscription'
import { paymentApi } from '@/lib/api/payment'
import type { Subscription, PlanInfo } from '@/types/subscription'
import type { PaymentRecord } from '@/types/payment'

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <CheckCircle2 className="h-5 w-5 text-slate-400" />,
  starter: <Zap className="h-5 w-5 text-blue-500" />,
  pro: <Sparkles className="h-5 w-5 text-violet-500" />,
  enterprise: <Building2 className="h-5 w-5 text-amber-500" />,
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['AI 크레딧 5회/월', '이미지 생성 2장/월', '프로젝트 3개', '기본 에셋'],
  starter: [
    'AI 크레딧 50회/월',
    '이미지 생성 20장/월',
    '프로젝트 10개',
    '전체 에셋',
    '이메일 지원',
  ],
  pro: [
    'AI 크레딧 무제한',
    '이미지 생성 100장/월',
    '프로젝트 무제한',
    '전체 에셋',
    '우선 지원',
    'PDF 견적서',
  ],
  enterprise: [
    'AI 크레딧 무제한',
    '이미지 생성 무제한',
    '프로젝트 무제한',
    '전담 지원',
    'SLA 보장',
    '커스텀 에셋',
  ],
}

const PLAN_COLORS: Record<string, string> = {
  free: 'border-slate-200',
  starter: 'border-blue-300 shadow-blue-100',
  pro: 'border-violet-400 shadow-violet-100 shadow-lg',
  enterprise: 'border-amber-300 shadow-amber-100',
}

function formatPrice(price: number) {
  if (price === 0) return '무료'
  return `${price.toLocaleString('ko-KR')}원/월`
}

function formatAmount(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<PlanInfo[]>([])
  const [history, setHistory] = useState<PaymentRecord[]>([])
  const [paying, setPaying] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [sub, planList, hist] = await Promise.all([
        subscriptionApi.getMySubscription(),
        subscriptionApi.getPlans(),
        paymentApi.getHistory(),
      ])
      setSubscription(sub)
      setPlans(planList)
      setHistory(hist)
    } catch (_) {
      setSubscription(null)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubscribe = async (plan: string) => {
    if (!sdkReady) {
      alert('결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setPaying(plan)
    try {
      const data = await paymentApi.prepare(plan)
      const toss = (window as Window & { TossPayments?: (key: string) => unknown }).TossPayments?.(
        data.client_key
      )
      if (!toss) {
        alert('토스 결제 모듈을 불러오지 못했습니다.')
        return
      }
      ;(
        toss as { requestPayment: (method: string, opts: Record<string, unknown>) => void }
      ).requestPayment('카드', {
        amount: data.amount,
        orderId: data.order_id,
        orderName: data.order_name,
        customerKey: data.customer_key,
        successUrl: data.success_url,
        failUrl: data.fail_url,
      })
    } catch {
      alert('결제 준비 중 오류가 발생했습니다.')
    } finally {
      setPaying(null)
    }
  }

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="lazyOnload"
        onReady={() => setSdkReady(true)}
      />
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold">구독 & 결제</h1>
          {subscription && (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              현재 플랜: <span className="font-semibold capitalize">{subscription.plan}</span>
              {subscription.plan !== 'free' && subscription.credits_remaining !== -1 && (
                <span className="ml-3">크레딧 {subscription.credits_remaining}회 남음</span>
              )}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map(plan => {
            const isCurrent = subscription?.plan === plan.plan
            const features = PLAN_FEATURES[plan.plan] ?? []
            return (
              <Card
                key={plan.plan}
                className={`relative flex flex-col ${PLAN_COLORS[plan.plan] ?? ''}`}
              >
                {plan.plan === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-violet-600 px-3 py-0.5 text-xs font-medium text-white">
                      인기
                    </span>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    {PLAN_ICONS[plan.plan]}
                    <CardTitle className="capitalize text-base">{plan.plan}</CardTitle>
                  </div>
                  <CardDescription className="text-2xl font-bold text-foreground">
                    {formatPrice(plan.price)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-1.5">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      현재 플랜
                    </Button>
                  ) : plan.plan === 'enterprise' ? (
                    <Button variant="outline" className="w-full">
                      문의하기
                    </Button>
                  ) : plan.price === 0 ? null : (
                    <Button
                      className="w-full"
                      variant={plan.plan === 'pro' ? 'default' : 'outline'}
                      disabled={paying === plan.plan}
                      onClick={() => handleSubscribe(plan.plan)}
                    >
                      {paying === plan.plan ? '처리 중...' : '구독하기'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {history.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">결제 내역</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {['날짜', '상품', '플랜', '금액', '결제 수단', '상태', '영수증'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3">{p.order_name}</td>
                      <td className="px-4 py-3 capitalize">{p.plan}</td>
                      <td className="px-4 py-3 font-medium">{formatAmount(p.amount)}</td>
                      <td className="px-4 py-3">{p.method ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {p.status === 'done' ? '완료' : p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.receipt_url ? (
                          <a
                            href={p.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            보기
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {history.length === 0 && (
          <p className="text-sm text-muted-foreground">결제 내역이 없습니다.</p>
        )}
      </main>
    </>
  )
}
