import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { PluginContext } from '@arki/plugin-core'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Asset {
  id: string
  name: string
  category: string
  width: number
  depth: number
  height: number
  glb_url: string
}

interface AssetsResponse {
  data: Asset[]
  meta: { total: number; page: number; pageSize: number }
}

type Category = '소파' | '침대' | '테이블' | '의자' | '수납' | '조명'

const CATEGORIES: Category[] = ['소파', '침대', '테이블', '의자', '수납', '조명']
const PAGE_SIZE = 20

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard(): React.ReactElement {
  return (
    <div
      style={{
        background: '#f0f0f0',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          background: '#e0e0e0',
          borderRadius: 6,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div style={{ height: 14, background: '#e0e0e0', borderRadius: 4, width: '70%' }} />
      <div style={{ height: 12, background: '#e0e0e0', borderRadius: 4, width: '50%' }} />
    </div>
  )
}

function SkeletonGrid(): React.ReactElement {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        padding: '0 4px',
      }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// ─── Furniture Item Card ─────────────────────────────────────────────────────

interface FurnitureCardProps {
  asset: Asset
  onSelect: (asset: Asset) => void
}

function FurnitureCard({ asset, onSelect }: FurnitureCardProps): React.ReactElement {
  const handleClick = useCallback(() => {
    onSelect(asset)
  }, [asset, onSelect])

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 8,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        textAlign: 'left',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#6366f1'
        e.currentTarget.style.boxShadow = '0 0 0 1px #6366f1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Thumbnail placeholder */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          background: '#f3f4f6',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: 12,
        }}
      >
        3D
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937', lineHeight: 1.3 }}>
        {asset.name}
      </span>
      <span style={{ fontSize: 11, color: '#6b7280' }}>
        {asset.width} x {asset.depth} x {asset.height} mm
      </span>
    </button>
  )
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export default function FurniturePanel(): React.ReactElement {
  const [category, setCategory] = useState<Category>('소파')
  const [search, setSearch] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const ctxRef = useRef<PluginContext | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Access context injected by host via data attribute or global
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-plugin-ctx="furniture-lib"]')
    if (el) {
      const ctx = (el as unknown as { __pluginCtx?: PluginContext }).__pluginCtx
      if (ctx) ctxRef.current = ctx
    }
  }, [])

  // Fetch assets when category or search changes
  const fetchAssets = useCallback(
    async (pageNum: number, append: boolean) => {
      const ctx = ctxRef.current
      if (!ctx) return

      setLoading(true)
      try {
        const params = new URLSearchParams({
          category,
          search,
          page: String(pageNum),
          pageSize: String(PAGE_SIZE),
        })
        const response = await ctx.api.get<AssetsResponse>(`/assets?${params.toString()}`)
        const newAssets = response.data

        setAssets((prev) => (append ? [...prev, ...newAssets] : newAssets))
        setHasMore(newAssets.length === PAGE_SIZE)
      } catch {
        // Silently fail, keep existing data
      } finally {
        setLoading(false)
      }
    },
    [category, search],
  )

  // Reset and fetch on category/search change
  useEffect(() => {
    setPage(1)
    setAssets([])
    setHasMore(true)
    void fetchAssets(1, false)
  }, [fetchAssets])

  // Virtual scroll: load more when scrolled near bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || loading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight - scrollTop - clientHeight < 100) {
      const nextPage = page + 1
      setPage(nextPage)
      void fetchAssets(nextPage, true)
    }
  }, [loading, hasMore, page, fetchAssets])

  // Handle furniture selection
  const handleSelect = useCallback((asset: Asset) => {
    const ctx = ctxRef.current
    if (!ctx) return

    ctx.scene.addFurniture({
      id: crypto.randomUUID(),
      assetId: asset.id,
      position: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    })

    ctx.ui.showToast(`${asset.name} 배치됨`, 'success')
  }, [])

  // Debounced search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value)
    }, 300)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search */}
      <div style={{ padding: '8px 12px' }}>
        <input
          type="text"
          placeholder="가구 검색..."
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '6px 10px',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '0 12px 8px',
          flexWrap: 'wrap',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            style={{
              padding: '4px 10px',
              borderRadius: 14,
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              background: cat === category ? '#6366f1' : '#f3f4f6',
              color: cat === category ? '#ffffff' : '#4b5563',
              fontWeight: cat === category ? 600 : 400,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid (scrollable) */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 12px 12px',
        }}
      >
        {loading && assets.length === 0 ? (
          <SkeletonGrid />
        ) : assets.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 24,
              color: '#9ca3af',
              fontSize: 13,
            }}
          >
            검색 결과가 없습니다
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
            }}
          >
            {assets.map((asset) => (
              <FurnitureCard key={asset.id} asset={asset} onSelect={handleSelect} />
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {loading && assets.length > 0 && (
          <div style={{ textAlign: 'center', padding: 12, color: '#9ca3af', fontSize: 12 }}>
            로딩 중...
          </div>
        )}
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
