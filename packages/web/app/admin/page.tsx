'use client'

import { StatsCards } from '@/components/admin/StatsCards'
import { useAdminStats } from '@/lib/hooks/use-subscription'

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useAdminStats()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">대시보드</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg bg-[hsl(var(--muted))]"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">대시보드</h2>
        <p className="text-[hsl(var(--destructive))]">
          통계를 불러오는 데 실패했습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">대시보드</h2>
      {stats && <StatsCards stats={stats} />}
    </div>
  )
}
