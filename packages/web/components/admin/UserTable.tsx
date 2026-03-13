'use client'

import { cn } from '@/lib/utils'
import type { AdminUser } from '@/types/subscription'

interface Props {
  users: AdminUser[]
}

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function UserTable({ users }: Props) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-[hsl(var(--muted-foreground))]">
        등록된 사용자가 없습니다.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-[hsl(var(--muted))]/50">
          <tr>
            <th className="px-4 py-3 font-medium">이메일</th>
            <th className="px-4 py-3 font-medium">이름</th>
            <th className="px-4 py-3 font-medium">요금제</th>
            <th className="px-4 py-3 font-medium">가입일</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr
              key={user.id}
              className="transition-colors hover:bg-[hsl(var(--muted))]/30"
            >
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.full_name}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                    PLAN_BADGE_STYLES[user.plan] ?? PLAN_BADGE_STYLES.free
                  )}
                >
                  {user.plan}
                </span>
              </td>
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                {formatDate(user.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
