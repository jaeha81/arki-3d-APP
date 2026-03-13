'use client'

import { use } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const ThreeViewer3D = dynamic(
  () =>
    import('@/components/editor/ThreeViewer3D').then(m => ({
      default: m.ThreeViewer3D,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
        3D 뷰어 로딩 중...
      </div>
    ),
  }
)

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default function SharePage({ params }: SharePageProps) {
  const { token } = use(params)

  return (
    <div className="flex h-screen flex-col bg-[hsl(var(--background))]">
      {/* 상단 바 */}
      <header className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-2">
        <span className="text-sm font-bold">SpacePlanner</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            공유 뷰어 ({token.slice(0, 8)}...)
          </span>
          <Link
            href="/login"
            className="rounded-md bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
          >
            로그인
          </Link>
        </div>
      </header>

      {/* 3D 뷰어 */}
      <main className="flex-1">
        <ThreeViewer3D floorPlan={null} />
      </main>

      {/* 하단 안내 */}
      <footer className="border-t border-[hsl(var(--border))] py-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
        마우스로 회전 · 스크롤로 줌 가능
      </footer>
    </div>
  )
}
