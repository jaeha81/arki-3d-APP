'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { AdminStats } from '@/types/subscription'

interface Props {
  stats: AdminStats
}

interface StatItem {
  label: string
  value: string | number
  highlight?: boolean
}

export function StatsCards({ stats }: Props) {
  const aiCostKrw = stats.ai_cost_this_month_krw ?? 0
  const items: StatItem[] = [
    { label: '총 사용자', value: stats.total_users },
    { label: '활성 구독', value: stats.active_subscriptions },
    { label: 'Pro 사용자', value: stats.pro_users },
    { label: 'Starter 사용자', value: stats.starter_users },
    { label: '총 프로젝트', value: stats.total_projects },
    { label: '총 견적서', value: stats.total_estimates },
    { label: '오늘 AI 호출', value: stats.ai_calls_today ?? 0 },
    { label: '이번 달 AI 호출', value: stats.ai_calls_this_month ?? 0 },
    {
      label: '이번 달 AI 비용',
      value: `₩${aiCostKrw.toLocaleString('ko-KR')}`,
      highlight: aiCostKrw > 50000,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className={item.highlight ? 'border-amber-400' : undefined}>
          <CardContent className="p-4">
            <p className={`text-3xl font-bold ${item.highlight ? 'text-amber-500' : ''}`}>
              {typeof item.value === 'number'
                ? item.value.toLocaleString('ko-KR')
                : item.value}
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {item.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
