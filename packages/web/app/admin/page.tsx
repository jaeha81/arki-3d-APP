'use client'

import { useState } from 'react'
import { StatsCards } from '@/components/admin/StatsCards'
import { AICostDashboard } from '@/components/admin/AICostDashboard'
import { useAdminStats, useAdminAIStats } from '@/lib/hooks/use-subscription'

type Tab = 'overview' | 'ai-cost'

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats()
  const { data: aiStats, isLoading: aiLoading } = useAdminAIStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">대시보드</h2>
        <div className="flex gap-2 rounded-lg border p-1 text-sm">
          <TabBtn active={tab === 'overview'} onClick={() => setTab('overview')}>
            전체 현황
          </TabBtn>
          <TabBtn active={tab === 'ai-cost'} onClick={() => setTab('ai-cost')}>
            AI 비용 분석
          </TabBtn>
        </div>
      </div>

      {tab === 'overview' && (
        <>
          {statsLoading && <SkeletonGrid count={9} />}
          {statsError && (
            <p className="text-[hsl(var(--destructive))]">통계를 불러오는 데 실패했습니다.</p>
          )}
          {stats && <StatsCards stats={stats} />}
        </>
      )}

      {tab === 'ai-cost' && (
        <>
          {aiLoading && <SkeletonGrid count={4} />}
          {aiStats && <AICostDashboard stats={aiStats} />}
          {!aiLoading && !aiStats && (
            <p className="text-[hsl(var(--muted-foreground))]">AI 통계 데이터를 불러올 수 없습니다.</p>
          )}
        </>
      )}
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 transition-colors ${
        active
          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
          : 'hover:bg-[hsl(var(--muted))]'
      }`}
    >
      {children}
    </button>
  )
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-[hsl(var(--muted))]" />
        ))}
      </div>
    </div>
  )
}
