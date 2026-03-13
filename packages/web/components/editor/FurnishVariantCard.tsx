'use client'

import type { FurnishVariant } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const VARIANT_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

interface Props {
  variant: FurnishVariant
  index: number
  isSelected: boolean
  onSelect: () => void
  onApply: () => void
}

export function FurnishVariantCard({ variant, index, isSelected, onSelect, onApply }: Props) {
  const label = VARIANT_LABELS[index] ?? String(index + 1)

  const formattedCost =
    variant.estimated_cost != null
      ? `${variant.estimated_cost.toLocaleString('ko-KR')}원`
      : null

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-colors',
        isSelected
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.4)]',
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
            isSelected
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
          )}
        >
          {label}
        </span>
        <span className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
          {variant.name}
        </span>
      </div>

      <p className="mb-2 line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">
        {variant.description}
      </p>

      <div className="flex items-center justify-between">
        {formattedCost && (
          <span className="text-xs font-medium text-[hsl(var(--foreground))]">{formattedCost}</span>
        )}
        {isSelected && (
          <Button
            size="sm"
            className="ml-auto h-7 px-3 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
          >
            적용
          </Button>
        )}
      </div>
    </button>
  )
}
