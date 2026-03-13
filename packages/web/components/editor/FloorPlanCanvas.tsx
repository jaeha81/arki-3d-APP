'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { FloorPlanEngine, type FloorPlanState } from '@spaceplanner/engine'
import type { WallPreview } from '@spaceplanner/engine'
import { Renderer2D, type RenderOptions } from './canvas/Renderer2D'
import { CanvasController } from './canvas/CanvasController'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'

const DEFAULT_COLORS: RenderOptions['colors'] = {
  background: '#f8f9fa',
  grid: '#e2e8f0',
  wall: '#334155',
  wallSelected: '#2563eb',
  door: '#ea580c',
  window: '#0ea5e9',
  room: 'rgba(59, 130, 246, 0.05)',
  dimension: '#94a3b8',
  dimensionText: '#64748b',
  preview: '#2563eb',
  snapIndicator: '#10b981',
}

interface FloorPlanCanvasProps {
  projectId: string
  className?: string
}

export function FloorPlanCanvas({ projectId: _projectId, className }: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<FloorPlanEngine | null>(null)
  const rendererRef = useRef<Renderer2D | null>(null)
  const controllerRef = useRef<CanvasController | null>(null)
  const rafRef = useRef<number>(0)
  const scaleRef = useRef(0.1)
  const offsetRef = useRef({ x: 0, y: 0 })

  const [engineState, setEngineState] = useState<FloorPlanState | null>(null)
  const [wallPreview, setWallPreview] = useState<WallPreview | null>(null)

  const showGrid = useEditorStore(s => s.showGrid)
  const showDimensions = useEditorStore(s => s.showDimensions)
  const setZoom = useEditorStore(s => s.setZoom)
  const setPan = useEditorStore(s => s.setPan)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new FloorPlanEngine()
    const renderer = new Renderer2D(canvas)
    const controller = new CanvasController(engine, {
      onStateChange: setEngineState,
      onPreviewChange: setWallPreview,
      getActiveTool: () => useEditorStore.getState().activeTool,
      getScale: () => scaleRef.current,
      getOffset: () => offsetRef.current,
      setOffset: (x, y) => {
        offsetRef.current = { x, y }
        setPan(x, y)
      },
      setScale: (s) => {
        scaleRef.current = s
        setZoom(s)
      },
    })

    engineRef.current = engine
    rendererRef.current = renderer
    controllerRef.current = controller

    offsetRef.current = { x: canvas.width / 2, y: canvas.height / 2 }
    setEngineState(engine.getState())

    return () => {
      controller.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const render = () => {
      const renderer = rendererRef.current
      const state = engineState
      if (!renderer || !state) {
        rafRef.current = requestAnimationFrame(render)
        return
      }

      const options: RenderOptions = {
        scale: scaleRef.current,
        offsetX: offsetRef.current.x,
        offsetY: offsetRef.current.y,
        gridSize: state.floorPlan.metadata.gridSize,
        showDimensions: showDimensions,
        showGrid: showGrid,
        selectedId: state.selectedId,
        wallPreview: wallPreview,
        colors: DEFAULT_COLORS,
      }

      renderer.render(state.floorPlan, state.dimensions, options)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [engineState, wallPreview, showGrid, showDimensions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = width
        canvas.height = height
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        rendererRef.current?.resize(width, height)
      }
    })

    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => controllerRef.current?.onKeyDown(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handler = (e: WheelEvent) => {
      const rect = canvas.getBoundingClientRect()
      controllerRef.current?.onWheel(e, rect)
    }
    canvas.addEventListener('wheel', handler, { passive: false })
    return () => canvas.removeEventListener('wheel', handler)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    controllerRef.current?.onMouseDown(e.nativeEvent, rect)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    controllerRef.current?.onMouseMove(e.nativeEvent, rect)
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    controllerRef.current?.onMouseUp(e.nativeEvent)
  }, [])

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    controllerRef.current?.onDoubleClick(e.nativeEvent, rect)
  }, [])

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-md bg-[hsl(var(--card))]/80 px-2 py-1 text-[10px] text-[hsl(var(--muted-foreground))] backdrop-blur-sm border border-[hsl(var(--border))]">
        <span>{(scaleRef.current * 1000).toFixed(0)}%</span>
        <span className="text-[hsl(var(--border))]">|</span>
        <span>Walls: {engineState?.floorPlan.walls.length ?? 0}</span>
        {engineState?.canUndo && <span className="text-[hsl(var(--primary))]">Undo</span>}
      </div>
    </div>
  )
}
