'use client'

import { useState } from 'react'
import { Search, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useEditorStore } from '@/lib/stores/editor-store'
import { AssetCard } from './AssetCard'
import { cn } from '@/lib/utils'
import type { Asset, AssetCategory } from '@/types/editor'

const MOCK_CATEGORIES: AssetCategory[] = [
  { id: '1', name: '소파', slug: 'sofa', icon: '🛋️', sortOrder: 1 },
  { id: '2', name: '테이블', slug: 'table', icon: '🪑', sortOrder: 2 },
  { id: '3', name: '침대', slug: 'bed', icon: '🛏️', sortOrder: 3 },
  { id: '4', name: '수납', slug: 'storage', icon: '🗄️', sortOrder: 4 },
  { id: '5', name: '조명', slug: 'light', icon: '💡', sortOrder: 5 },
  { id: '6', name: '욕실', slug: 'bathroom', icon: '🚿', sortOrder: 6 },
]

const MOCK_ASSETS: Asset[] = [
  { id: 'a1', categoryId: '1', name: '모던 3인 소파', slug: 'modern-sofa-3', widthMm: 2100, depthMm: 900, heightMm: 800, tags: ['모던'], isFree: true },
  { id: 'a2', categoryId: '1', name: '패브릭 2인 소파', slug: 'fabric-sofa-2', widthMm: 1500, depthMm: 850, heightMm: 780, tags: ['패브릭'], isFree: true },
  { id: 'a3', categoryId: '2', name: '원형 다이닝 테이블', slug: 'round-dining', widthMm: 1200, depthMm: 1200, heightMm: 750, tags: ['다이닝'], isFree: true },
  { id: 'a4', categoryId: '2', name: '사각 커피 테이블', slug: 'rect-coffee', widthMm: 1000, depthMm: 600, heightMm: 450, tags: ['거실'], isFree: false },
  { id: 'a5', categoryId: '3', name: '퀸 사이즈 침대', slug: 'queen-bed', widthMm: 1600, depthMm: 2000, heightMm: 400, tags: ['침실'], isFree: true },
  { id: 'a6', categoryId: '4', name: '4단 서랍장', slug: 'drawer-4', widthMm: 800, depthMm: 450, heightMm: 1000, tags: ['수납'], isFree: true },
  { id: 'a7', categoryId: '5', name: '펜던트 조명', slug: 'pendant-light', widthMm: 300, depthMm: 300, heightMm: 400, tags: ['조명'], isFree: true },
  { id: 'a8', categoryId: '6', name: '세면대', slug: 'wash-basin', widthMm: 600, depthMm: 450, heightMm: 850, tags: ['욕실'], isFree: true },
  { id: 'a9', categoryId: '1', name: '가죽 리클라이너', slug: 'leather-recliner', widthMm: 900, depthMm: 900, heightMm: 1000, tags: ['가죽'], isFree: false },
]

export function AssetPanel() {
  const isAssetPanelOpen = useEditorStore(s => s.isAssetPanelOpen)
  const activeAssetCategoryId = useEditorStore(s => s.activeAssetCategoryId)
  const setActiveAssetCategory = useEditorStore(s => s.setActiveAssetCategory)
  const [searchQuery, setSearchQuery] = useState('')

  if (!isAssetPanelOpen) return null

  const filteredAssets = MOCK_ASSETS.filter(asset => {
    const matchesCategory = !activeAssetCategoryId || asset.categoryId === activeAssetCategoryId
    const matchesSearch = !searchQuery || asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="h-64 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* 카테고리 탭 */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[hsl(var(--border))] px-2 py-1 scrollbar-none">
        <button
          onClick={() => setActiveAssetCategory(null)}
          className={cn(
            'shrink-0 rounded-md px-2 py-1 text-xs transition-colors',
            !activeAssetCategoryId
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
          )}
        >
          전체
        </button>
        {MOCK_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveAssetCategory(cat.id)}
            className={cn(
              'shrink-0 rounded-md px-2 py-1 text-xs transition-colors',
              activeAssetCategoryId === cat.id
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* 검색바 */}
      <div className="relative px-2 py-1.5">
        <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="에셋 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-7 pl-8 text-xs"
        />
      </div>

      {/* 에셋 그리드 */}
      <div className="overflow-y-auto px-2 pb-2" style={{ maxHeight: 'calc(256px - 80px)' }}>
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[hsl(var(--muted-foreground))]">
            <Package className="mb-2 h-8 w-8" />
            <p className="text-xs">에셋이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {filteredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
