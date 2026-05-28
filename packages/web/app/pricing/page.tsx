'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { Check, X, ChevronRight, Zap, Building2, Sparkles, Box } from 'lucide-react'
import { paymentApi } from '@/lib/api/payment'

// ─────────────────────────────────────────────
// 플랜 정의
// ─────────────────────────────────────────────
const PLANS = [
  {
    id: 'studio',
    name: 'Studio',
    monthlyPrice: 49000,
    yearlyPrice: 39200, // 20% 할인
    desc: '1~3인 건축/인테리어 스튜디오',
    badge: null,
    icon: Zap,
    color: 'border-blue-300',
    btnVariant: 'outline' as const,
    features: {
      projects: '프로젝트 20개',
      members: '팀원 3명',
      storage: '50GB 저장공간',
      ai: 'AI 크레딧 50회/월',
      pdf: 'PDF 견적서',
      share: '클라이언트 공유 링크',
      priority: null,
      api: null,
      sla: null,
    },
  },
  {
    id: 'firm',
    name: 'Firm',
    monthlyPrice: 99000,
    yearlyPrice: 79200, // 20% 할인
    desc: '5~20인 전문 건축사무소',
    badge: '추천',
    icon: Sparkles,
    color: 'border-violet-400',
    btnVariant: 'primary' as const,
    features: {
      projects: '프로젝트 무제한',
      members: '팀원 무제한',
      storage: '500GB 저장공간',
      ai: 'AI 크레딧 300회/월 (공정 사용 정책)',
      pdf: 'PDF 견적서',
      share: '클라이언트 공유 링크',
      priority: '우선 지원',
      api: null,
      sla: null,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    desc: '대형 건설사 / 맞춤 계약',
    badge: null,
    icon: Building2,
    color: 'border-amber-300',
    btnVariant: 'outline' as const,
    features: {
      projects: '프로젝트 무제한',
      members: '팀원 무제한',
      storage: '전용 스토리지',
      ai: 'AI 크레딧 전용 정책 (별도 계약)',
      pdf: 'PDF 견적서',
      share: '클라이언트 공유 링크',
      priority: '전담 매니저',
      api: 'API 연동',
      sla: 'SLA 보장',
    },
  },
] as const

// ─────────────────────────────────────────────
// 비교 테이블 행 정의
// ─────────────────────────────────────────────
const FEATURE_ROWS: { label: string; key: keyof (typeof PLANS)[0]['features'] }[] = [
  { label: '프로젝트 수', key: 'projects' },
  { label: '팀원 수', key: 'members' },
  { label: '저장공간', key: 'storage' },
  { label: 'AI 크레딧', key: 'ai' },
  { label: 'PDF 견적서', key: 'pdf' },
  { label: '공유 링크', key: 'share' },
  { label: '우선/전담 지원', key: 'priority' },
  { label: 'API 연동', key: 'api' },
  { label: 'SLA 보장', key: 'sla' },
]

function formatPrice(price: number | null, billing: 'monthly' | 'yearly') {
  if (price === null) return '문의'
  return `${price.toLocaleString('ko-KR')}원`
}

function PricingCard({
  plan,
  billing,
  onSubscribe,
  paying,
}: {
  plan: (typeof PLANS)[number]
  billing: 'monthly' | 'yearly'
  onSubscribe: (id: string) => void
  paying: string | null
}) {
  const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
  const isEnterprise = plan.id === 'enterprise'
  const isPaying = paying === plan.id

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 ${plan.color} ${
        plan.badge ? 'bg-violet-50 dark:bg-violet-950/20 shadow-xl' : 'bg-[hsl(var(--card))]'
      } p-7`}
    >
      {plan.badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-1 text-xs font-bold text-white shadow">
          {plan.badge}
        </span>
      )}

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10">
          <plan.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{plan.name}</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{plan.desc}</p>
        </div>
      </div>

      <div className="mb-6">
        {isEnterprise ? (
          <span className="text-3xl font-extrabold">문의</span>
        ) : (
          <>
            <span className="text-3xl font-extrabold">{formatPrice(price, billing)}</span>
            <span className="ml-1 text-sm text-[hsl(var(--muted-foreground))]">
              /{billing === 'monthly' ? '월' : '월 (연간 결제)'}
            </span>
            {billing === 'yearly' && plan.monthlyPrice && (
              <p className="mt-1 text-xs text-emerald-600 font-medium">
                연간 결제 시 20% 할인 (
                {((plan.monthlyPrice - (plan.yearlyPrice ?? 0)) * 12).toLocaleString('ko-KR')}
                원 절약)
              </p>
            )}
          </>
        )}
      </div>

      <ul className="mb-7 flex-1 space-y-2.5">
        {Object.values(plan.features)
          .filter(Boolean)
          .map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              {f}
            </li>
          ))}
      </ul>

      {isEnterprise ? (
        <Link
          href="/contact"
          className="block rounded-xl border border-[hsl(var(--border))] py-2.5 text-center text-sm font-semibold transition hover:bg-[hsl(var(--accent))]"
        >
          영업팀 문의
        </Link>
      ) : (
        <button
          type="button"
          disabled={isPaying}
          onClick={() => onSubscribe(plan.id)}
          className={`rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
            plan.badge
              ? 'bg-[hsl(var(--primary))] text-white hover:opacity-90'
              : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
          }`}
        >
          {isPaying ? '처리 중...' : '지금 시작하기'}
        </button>
      )}
    </div>
  )
}

export default function PricingPage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [paying, setPaying] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)

  const handleSubscribe = useCallback(
    async (planId: string) => {
      if (!sdkReady) {
        alert('결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요.')
        return
      }
      // 비로그인 상태면 register로
      try {
        setPaying(planId)
        const data = await paymentApi.prepare(planId)
        const toss = (window as Window & { TossPayments?: (key: string) => unknown }).TossPayments?.(
          data.client_key
        )
        if (!toss) {
          alert('토스 결제 모듈을 불러오지 못했습니다.')
          return
        }
        ;(toss as { requestPayment: (method: string, opts: Record<string, unknown>) => void }).requestPayment(
          '카드',
          {
            amount: data.amount,
            orderId: data.order_id,
            orderName: data.order_name,
            customerKey: data.customer_key,
            successUrl: data.success_url,
            failUrl: data.fail_url,
          }
        )
      } catch (err: unknown) {
        const apiErr = err as { response?: { status?: number } }
        if (apiErr?.response?.status === 401) {
          // 미로그인 → 회원가입으로
          router.push(`/register?plan=${planId}`)
        } else {
          alert('결제 준비 중 오류가 발생했습니다.')
        }
      } finally {
        setPaying(null)
      }
    },
    [sdkReady, router]
  )

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="lazyOnload"
        onReady={() => setSdkReady(true)}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Box className="h-6 w-6 text-[hsl(var(--primary))]" />
            <span className="font-bold">JH-3D</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-[hsl(var(--accent))]"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-[hsl(var(--background))]">
        {/* Header */}
        <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
            건축/인테리어 사무소 전용 B2B 플랜
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            팀 규모에 맞는 플랜
          </h1>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
            소규모 스튜디오부터 대형 건설사까지. 언제든 업그레이드하거나 취소할 수 있습니다.
          </p>

          {/* 연간/월간 토글 */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                billing === 'monthly'
                  ? 'bg-[hsl(var(--background))] shadow text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              월간 결제
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
                billing === 'yearly'
                  ? 'bg-[hsl(var(--background))] shadow text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              연간 결제
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                20% 할인
              </span>
            </button>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PLANS.map(plan => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billing={billing}
                onSubscribe={handleSubscribe}
                paying={paying}
              />
            ))}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="bg-[hsl(var(--muted))]/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-10 text-center text-2xl font-bold">플랜별 기능 비교</h2>
            <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                    <th className="px-6 py-4 text-left font-semibold text-[hsl(var(--muted-foreground))]">
                      기능
                    </th>
                    {PLANS.map(p => (
                      <th key={p.id} className="px-6 py-4 text-center font-semibold">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {FEATURE_ROWS.map(row => (
                    <tr
                      key={row.key}
                      className="bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))]/50 transition"
                    >
                      <td className="px-6 py-4 font-medium">{row.label}</td>
                      {PLANS.map(plan => {
                        const val = plan.features[row.key]
                        return (
                          <td key={plan.id} className="px-6 py-4 text-center">
                            {val ? (
                              <span className="text-[hsl(var(--foreground))]">{val}</span>
                            ) : (
                              <X className="mx-auto h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">자주 묻는 질문</h2>
          <div className="space-y-4">
            {[
              {
                q: '언제든 플랜을 변경할 수 있나요?',
                a: '네, 언제든지 업그레이드하거나 다운그레이드할 수 있습니다. 변경 즉시 새 플랜이 적용됩니다.',
              },
              {
                q: '연간 결제 중도 해지 시 환불 정책은?',
                a: '남은 기간에 해당하는 금액을 일할 계산하여 환불해드립니다.',
              },
              {
                q: '팀원 초대는 어떻게 하나요?',
                a: '대시보드 설정 > 팀 관리에서 이메일로 초대할 수 있습니다. 초대 즉시 협업이 가능합니다.',
              },
              {
                q: 'Enterprise 플랜은 무엇이 다른가요?',
                a: '전용 서버, 커스텀 에셋 업로드, API 연동, SLA 보장, 전담 매니저가 제공됩니다. 영업팀에 문의해주세요.',
              },
            ].map(item => (
              <div
                key={item.q}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
              >
                <p className="font-semibold">{item.q}</p>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[hsl(var(--primary))] py-16">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-extrabold text-white">먼저 무료로 체험하세요</h2>
            <p className="mt-3 text-white/80">
              신용카드 없이 시작. 언제든 업그레이드 가능.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-[hsl(var(--primary))] shadow transition hover:bg-white/90"
            >
              무료로 시작하기
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
