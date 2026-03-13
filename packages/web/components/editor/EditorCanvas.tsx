'use client'

import dynamic from 'next/dynamic'
import { Columns2 } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { FloorPlanCanvas } from './FloorPlanCanvas'
import { useFloorPlanScene } from '@/lib/hooks/use-floor-plan-scene'

const ThreeViewer3D = dynamic(
  () => import('./ThreeViewer3D').then(m => ({ default: m.ThreeViewer3D })),
  { ssr: false }
)

export function EditorCanvas() {
  const viewMode = useEditorStore(s => s.viewMode)
  const zoom = useEditorStore(s => s.zoom)
  const panX = useEditorStore(s => s.panX)
  const panY = useEditorStore(s => s.panY)

  const { floorPlan, selectedId } = useFloorPlanScene()

  return (
    <div className="relative flex-1 overflow-hidden bg-[hsl(var(--editor-bg))]">
      {viewMode === 'split' ? (
        <div className="flex h-full">
          <div className="flex-1 border-r border-[hsl(var(--border))]">
            <FloorPlanCanvas projectId="current" />
          </div>
          <div className="flex-1">
            <ThreeViewer3D floorPlan={floorPlan} selectedId={selectedId} />
          </div>
          <div className="absolute left-1/2 top-3 -translate-x-1/2">
            <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--card))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))] shadow-sm border border-[hsl(var(--border))]">
              <Columns2 className="h-3 w-3" />
              Split View
            </div>
          </div>
        </div>
      ) : viewMode === '2d' ? (
        <FloorPlanCanvas projectId="current" className="h-full" />
      ) : (
        <ThreeViewer3D floorPlan={floorPlan} selectedId={selectedId} />
      )}

      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md bg-[hsl(var(--card))]/80 px-2 py-1 text-[10px] text-[hsl(var(--muted-foreground))] backdrop-blur-sm border border-[hsl(var(--border))]">
        <span>{(zoom * 100).toFixed(0)}%</span>
        <span className="text-[hsl(var(--border))]">|</span>
        <span>X:{panX.toFixed(0)} Y:{panY.toFixed(0)}</span>
      </div>
    </div>
  )
}
