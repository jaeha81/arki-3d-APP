'use client'

import dynamic from 'next/dynamic'
import { Columns2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/lib/stores/editor-store'
import { FloorPlanCanvas } from './FloorPlanCanvas'
import { useFloorPlanScene } from '@/lib/hooks/use-floor-plan-scene'
import { CameraPresetBar } from './CameraPresetBar'

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

  // framer-motion 뷰 전환 variants — Spline 스타일 fade + scale
  const viewVariants = {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.15, ease: 'easeIn' } },
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-[hsl(var(--editor-bg))]">
      <AnimatePresence mode="wait">
        {viewMode === 'split' ? (
          <motion.div
            key="split"
            className="flex h-full"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="flex-1 border-r border-[hsl(var(--border))]">
              <FloorPlanCanvas projectId="current" />
            </div>
            <div className="relative flex-1">
              <ThreeViewer3D floorPlan={floorPlan} selectedId={selectedId} />
              <CameraPresetBar />
            </div>
            <div className="absolute left-1/2 top-3 -translate-x-1/2">
              <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--card))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))] shadow-sm border border-[hsl(var(--border))]">
                <Columns2 className="h-3 w-3" />
                Split View
              </div>
            </div>
          </motion.div>
        ) : viewMode === '2d' ? (
          <motion.div
            key="2d"
            className="h-full"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FloorPlanCanvas projectId="current" className="h-full" />
          </motion.div>
        ) : (
          <motion.div
            key="3d"
            className="absolute inset-0"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ThreeViewer3D floorPlan={floorPlan} selectedId={selectedId} />
            <CameraPresetBar />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md bg-[hsl(var(--card))]/80 px-2 py-1 text-[10px] text-[hsl(var(--muted-foreground))] backdrop-blur-sm border border-[hsl(var(--border))]">
        <span>{(zoom * 100).toFixed(0)}%</span>
        <span className="text-[hsl(var(--border))]">|</span>
        <span>X:{panX.toFixed(0)} Y:{panY.toFixed(0)}</span>
      </div>
    </div>
  )
}
