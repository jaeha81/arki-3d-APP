'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PlanInfo } from '@/types/subscription'

interface Props {
  plan: PlanInfo
  currentPlan: string
  onUpgrade: (plan: string) => void
  isLoading?: boolean
}

function formatNumber(n: number): string {
  if (n === -1) return '무제한'
  return n.toLocaleString('ko-KR')
}

function formatPrice(price: number): string {
  if (price === 0) return '무료'
  if (price === -1) return '협의'
  return `${price.toLocaleString('ko-KR')}원/월`
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export function PlanCard({ plan, currentPlan, onUpgrade, isLoading }: Props) {
  const isCurrent = plan.plan === currentPlan
  const isPro = plan.plan === 'pro'

  return (
    <Card
      className={cn(
        'flex flex-col',
        isPro &&
          'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 ring-1 ring-[hsl(var(--primary))]'
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn(
              'text-xl',
              isPro && 'text-[hsl(var(--primary))]'
            )}
          >
            {PLAN_LABELS[plan.plan] ?? plan.plan}
          </CardTitle>
          {isCurrent && (
            <span className="rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-medium text-[hsl(var(--primary))]">
              현재 요금제
            </span>
          )}
        </div>
        <p className="mt-2 text-3xl font-bold">{formatPrice(plan.price)}</p>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span>AI 크레딧: {formatNumber(plan.credits_per_month)}회/월</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span>이미지 생성: {formatNumber(plan.images_per_month)}회/월</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span>프로젝트: {formatNumber(plan.max_projects)}개</span>
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isPro ? 'default' : 'outline'}
          disabled={isCurrent || isLoading}
          onClick={() => onUpgrade(plan.plan)}
        >
          {isCurrent ? '사용 중' : '업그레이드'}
        </Button>
      </CardFooter>
    </Card>
  )
}
