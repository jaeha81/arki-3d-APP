'use client'
import React, { useState, useMemo, useCallback, useTransition } from 'react'
import type { PluginContext } from '@arki/plugin-core'
import {
  FURNITURE_CATALOG,
  CATEGORY_LABELS,
  getByCategory,
  searchFurniture,
  type FurnitureCategory,
  type FurnitureAsset,
} from './furniture-catalog'

interface Props {
  ctx: PluginContext
}

export function FurnitureLibraryPanel({ ctx }: Props) {
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredItems = useMemo(() => {
    if (searchQuery.trim()) return searchFurniture(searchQuery)
    if (activeCategory === 'all') return FURNITURE_CATALOG
    return getByCategory(activeCategory)
  }, [activeCategory, searchQuery])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => setSearchQuery(e.target.value))
  }, [])

  const handleAddFurniture = useCallback(
    (asset: FurnitureAsset) => {
      ctx.scene.addFurniture({
        id: `furniture-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        assetId: asset.id,
        position: { x: 1000, y: 1000 },
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      })
      ctx.ui.showToast(`${asset.name}을(를) 배치했습니다`, 'success')
    },
    [ctx]
  )

  const categories: Array<FurnitureCategory | 'all'> = [
    'all',
    'living',
    'bedroom',
    'dining',
    'office',
    'storage',
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b">
        <input
          type="search"
          placeholder="가구 검색..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full text-sm border rounded px-2 py-1.5 bg-background"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-2 border-b overflow-x-auto scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            {cat === 'all' ? '전체' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className={`flex-1 overflow-y-auto p-2 space-y-1 ${isPending ? 'opacity-70' : ''}`}>
        {filteredItems.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">검색 결과 없음</p>
        ) : (
          filteredItems.map(asset => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{asset.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(asset.width / 1000).toFixed(1)}m × {(asset.depth / 1000).toFixed(1)}m
                  {asset.price != null &&
                    ` · ${new Intl.NumberFormat('ko-KR').format(asset.price)}원`}
                </p>
              </div>
              <button
                onClick={() => handleAddFurniture(asset)}
                className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                배치
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t text-xs text-muted-foreground text-center">
        {filteredItems.length}개 항목
      </div>
    </div>
  )
}
