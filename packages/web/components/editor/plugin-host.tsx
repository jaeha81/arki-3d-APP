'use client'

import React, { Suspense, lazy, useMemo } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SkeletonEditorPanel } from '@/components/ui/skeleton-cards'

interface PluginHostProps {
  pluginId: string
}

type LazyModule = { default: React.ComponentType }

function resolveModule(m: Record<string, unknown>): LazyModule {
  if (m.default && typeof m.default === 'function') return m as LazyModule
  const named = Object.values(m).find(v => typeof v === 'function')
  if (named) return { default: named as React.ComponentType }
  throw new Error('No component export found')
}

const pluginRegistry: Record<string, () => Promise<LazyModule>> = {
  'ai-design': () =>
    import('@arki/plugin-ai-design/src/ai-design-panel').then(resolveModule),
  'estimation': () =>
    import('@arki/plugin-estimation/src/estimation-panel').then(resolveModule),
  'pdf-export': () =>
    import('@arki/plugin-pdf-export/src/pdf-export-panel').then(resolveModule),
  'furniture-lib': () =>
    import('@arki/plugin-furniture-lib/src/furniture-panel').then(resolveModule),
}

function PluginNotFound({ pluginId }: { pluginId: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="text-sm font-medium">플러그인을 찾을 수 없습니다</p>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        ID: {pluginId}
      </p>
    </div>
  )
}

export function PluginHost({ pluginId }: PluginHostProps) {
  const LazyPlugin = useMemo(() => {
    const loader = pluginRegistry[pluginId]
    if (!loader) return null
    return lazy(loader)
  }, [pluginId])

  if (!LazyPlugin) {
    return <PluginNotFound pluginId={pluginId} />
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm font-medium">플러그인 오류</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            &quot;{pluginId}&quot; 플러그인에서 문제가 발생했습니다.
          </p>
        </div>
      }
    >
      <Suspense fallback={<SkeletonEditorPanel />}>
        <LazyPlugin />
      </Suspense>
    </ErrorBoundary>
  )
}
