'use client'

import {
  MousePointer,
  Square,
  DoorOpen,
  RectangleHorizontal,
  Sofa,
  Ruler,
  Grid3x3,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import type { EditorTool } from '@/types/editor'

const TOOLS: { tool: EditorTool; icon: typeof MousePointer; label: string }[] = [
  { tool: 'select', icon: MousePointer, label: '선택 (V)' },
  { tool: 'wall', icon: Square, label: '벽 그리기 (W)' },
  { tool: 'door', icon: DoorOpen, label: '문 배치 (D)' },
  { tool: 'window', icon: RectangleHorizontal, label: '창문 배치 (N)' },
  { tool: 'furniture', icon: Sofa, label: '가구 배치 (F)' },
  { tool: 'measure', icon: Ruler, label: '치수 측정 (M)' },
]

export function EditorToolbar() {
  const activeTool = useEditorStore(s => s.activeTool)
  const setActiveTool = useEditorStore(s => s.setActiveTool)
  const showGrid = useEditorStore(s => s.showGrid)
  const toggleGrid = useEditorStore(s => s.toggleGrid)
  const zoom = useEditorStore(s => s.zoom)
  const setZoom = useEditorStore(s => s.setZoom)

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.2))

  return (
    <div className="flex w-12 flex-col items-center border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2">
      {/* 도구 버튼 */}
      <div className="flex flex-col gap-1">
        {TOOLS.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            title={label}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
              activeTool === tool
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* 구분선 */}
      <div className="my-2 h-px w-6 bg-[hsl(var(--border))]" />

      {/* 유틸 버튼 */}
      <div className="flex flex-col gap-1">
        <button
          onClick={toggleGrid}
          title="그리드 토글"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
            showGrid
              ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]'
              : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
          )}
        >
          <Grid3x3 className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomIn}
          title="확대"
          className="flex h-9 w-9 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="축소"
          className="flex h-9 w-9 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
