'use client'

import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import type { ViewMode } from '@/types/editor'

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: '2d', label: '2D' },
  { value: '3d', label: '3D' },
  { value: 'split', label: 'Split' },
]

export function ViewToggle() {
  const viewMode = useEditorStore(s => s.viewMode)
  const setViewMode = useEditorStore(s => s.setViewMode)

  return (
    <div className="flex items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-0.5">
      {VIEW_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setViewMode(opt.value)}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-md transition-colors',
            viewMode === opt.value
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
