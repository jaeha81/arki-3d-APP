'use client'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { PlanCard } from '@/components/settings/PlanCard'
import { UsageBar } from '@/components/settings/UsageBar'
import {
  useMySubscription,
  usePlans,
  useUpgradePlan,
} from '@/lib/hooks/use-subscription'

export default function SettingsPage() {
  const { data: subscription, isLoading: subLoading } = useMySubscription()
  const { data: plans, isLoading: plansLoading } = usePlans()
  const upgradeMutation = useUpgradePlan()

  const handleUpgrade = (plan: string) => {
    upgradeMutation.mutate(plan)
  }

  if (subLoading || plansLoading) {
    return (
      <>
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-[hsl(var(--muted))]" />
            <div className="h-4 w-32 rounded bg-[hsl(var(--muted))]" />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">구독 및 요금제</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            현재 요금제를 확인하고 업그레이드할 수 있습니다.
          </p>
        </div>

        {/* Usage section */}
        {subscription && (
          <div className="mb-8 space-y-4 rounded-lg border p-6">
            <h2 className="text-lg font-semibold">사용량</h2>
            <UsageBar
              label="AI 크레딧"
              used={subscription.credits_used}
              total={
                subscription.credits_remaining === -1
                  ? -1
                  : subscription.credits_used + subscription.credits_remaining
              }
            />
            <UsageBar
              label="이미지 생성"
              used={subscription.images_used}
              total={
                subscription.images_remaining === -1
                  ? -1
                  : subscription.images_used + subscription.images_remaining
              }
            />
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans?.map((plan) => (
            <PlanCard
              key={plan.plan}
              plan={plan}
              currentPlan={subscription?.plan ?? 'free'}
              onUpgrade={handleUpgrade}
              isLoading={upgradeMutation.isPending}
            />
          ))}
        </div>
      </main>
    </>
  )
}
