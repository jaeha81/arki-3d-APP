'use client'

import { Package } from 'lucide-react'
import type { Asset } from '@/types/editor'

interface AssetCardProps {
  asset: Asset
}

export function AssetCard({ asset }: AssetCardProps) {
  const dimensions =
    asset.widthMm && asset.depthMm
      ? `${asset.widthMm} × ${asset.depthMm} mm`
      : null

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('application/json', JSON.stringify({ assetId: asset.id }))
        e.dataTransfer.effectAllowed = 'copy'
      }}
      className="group relative cursor-grab rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-shadow hover:shadow-md hover:ring-2 hover:ring-[hsl(var(--ring))]"
    >
      {/* 썸네일 */}
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-t-lg bg-[hsl(var(--muted))]">
        {asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        )}
      </div>

      {/* 정보 */}
      <div className="p-1.5">
        <p className="truncate text-xs font-medium text-[hsl(var(--foreground))]">
          {asset.name}
        </p>
        {dimensions && (
          <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">
            {dimensions}
          </p>
        )}
      </div>

      {/* Hover 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="rounded-md bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))]">
          배치
        </span>
      </div>
    </div>
  )
}
