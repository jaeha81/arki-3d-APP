'use client'

import { useEditorStore } from '@/lib/stores/editor-store'
import type { EditorTool } from '@/types/editor'

const TOOL_LABELS: Record<EditorTool, string> = {
  select: '선택',
  wall: '벽 그리기',
  door: '문 배치',
  window: '창문 배치',
  furniture: '가구 배치',
  measure: '치수 측정',
}

export function EditorStatusBar() {
  const panX = useEditorStore(s => s.panX)
  const panY = useEditorStore(s => s.panY)
  const zoom = useEditorStore(s => s.zoom)
  const activeTool = useEditorStore(s => s.activeTool)

  return (
    <div className="flex h-6 items-center justify-between border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-[10px] text-[hsl(var(--muted-foreground))]">
      {/* 좌측: 좌표 */}
      <span>
        X: {panX.toFixed(0)} Y: {panY.toFixed(0)}
      </span>

      {/* 중앙: 현재 도구 */}
      <span className="font-medium">{TOOL_LABELS[activeTool]}</span>

      {/* 우측: 줌 + 단위 */}
      <span>
        {(zoom * 100).toFixed(0)}% | mm
      </span>
    </div>
  )
}
