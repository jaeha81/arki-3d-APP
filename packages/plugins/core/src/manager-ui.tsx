'use client'

import React from 'react'
import { usePluginStore } from './store'
import type { InstalledPlugin } from './types'

function PluginBadge({ capability }: { capability: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
      {capability}
    </span>
  )
}

function PluginToggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
        checked ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--input))]',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

function PluginCardSkeleton() {
  return (
    <div className="rounded-lg border bg-[hsl(var(--card))] p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-[hsl(var(--muted))] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-[hsl(var(--muted))] animate-pulse" />
            <div className="h-3 w-16 rounded bg-[hsl(var(--muted))] animate-pulse" />
          </div>
        </div>
        <div className="h-5 w-9 rounded-full bg-[hsl(var(--muted))] animate-pulse" />
      </div>
      <div className="h-3 w-full rounded bg-[hsl(var(--muted))] animate-pulse" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-[hsl(var(--muted))] animate-pulse" />
        <div className="h-5 w-14 rounded-full bg-[hsl(var(--muted))] animate-pulse" />
      </div>
    </div>
  )
}

function PluginCard({ plugin }: { plugin: InstalledPlugin }) {
  const { activatePlugin, deactivatePlugin } = usePluginStore()
  const { manifest, active } = plugin

  function handleToggle(next: boolean) {
    if (next) {
      activatePlugin(manifest.id)
    } else {
      deactivatePlugin(manifest.id)
    }
  }

  return (
    <div className="rounded-lg border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--muted))] text-base">
            {manifest.icon ?? '🔌'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-none">{manifest.name}</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">v{manifest.version}</p>
          </div>
        </div>
        <PluginToggle checked={active} onChange={handleToggle} />
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
        {manifest.description}
      </p>

      {manifest.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {manifest.capabilities.map(cap => (
            <PluginBadge key={cap} capability={cap} />
          ))}
        </div>
      )}
    </div>
  )
}

interface PluginManagerProps {
  loading?: boolean
  skeletonCount?: number
}

export function PluginManager({ loading = false, skeletonCount = 4 }: PluginManagerProps) {
  const { installedPlugins } = usePluginStore()
  const plugins = Array.from(installedPlugins.values())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">플러그인</h2>
        {!loading && (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {plugins.filter(p => p.active).length}/{plugins.length} 활성
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <PluginCardSkeleton key={i} />
          ))}
        </div>
      ) : plugins.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          설치된 플러그인이 없습니다
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {plugins.map(plugin => (
            <PluginCard key={plugin.manifest.id} plugin={plugin} />
          ))}
        </div>
      )}
    </div>
  )
}
