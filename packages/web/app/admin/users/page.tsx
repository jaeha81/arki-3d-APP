'use client'

import { UserTable } from '@/components/admin/UserTable'
import { useAdminUsers } from '@/lib/hooks/use-subscription'

export default function AdminUsersPage() {
  const { data: users, isLoading, error } = useAdminUsers(50, 0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">사용자 관리</h2>
        <div className="animate-pulse">
          <div className="h-64 rounded-lg bg-[hsl(var(--muted))]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">사용자 관리</h2>
        <p className="text-[hsl(var(--destructive))]">
          사용자 목록을 불러오는 데 실패했습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">사용자 관리</h2>
      <UserTable users={users ?? []} />
    </div>
  )
}
