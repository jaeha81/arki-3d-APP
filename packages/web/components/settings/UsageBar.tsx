'use client'

import { cn } from '@/lib/utils'

interface Props {
  used: number
  total: number // -1 = unlimited
  label: string
}

export function UsageBar({ used, total, label }: Props) {
  const isUnlimited = total === -1
  const percentage = isUnlimited ? 0 : total > 0 ? (used / total) * 100 : 0
  const clampedPct = Math.min(percentage, 100)

  const barColor =
    percentage >= 100
      ? 'bg-red-500'
      : percentage >= 80
        ? 'bg-amber-500'
        : 'bg-[hsl(var(--primary))]'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-[hsl(var(--muted-foreground))]">
          {isUnlimited
            ? `${used.toLocaleString('ko-KR')}회 사용 / 무제한`
            : `${used.toLocaleString('ko-KR')} / ${total.toLocaleString('ko-KR')}회`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-in-out',
            barColor
          )}
          style={{ width: isUnlimited ? '0%' : `${clampedPct}%` }}
        />
      </div>
    </div>
  )
}
