'use client'

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
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        3D 뷰어 로딩 중...
      </div>
    ),
  }
)

export function SharePageClient({ token }: { token: string }) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-bold">Arki-3D</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">공유 뷰어 ({token.slice(0, 8)}...)</span>
          <Link
            href="/login"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            로그인
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <ThreeViewer3D floorPlan={null} />
      </main>

      <footer className="border-t py-2 text-center text-xs text-muted-foreground">
        마우스로 회전 · 스크롤로 줌 가능
      </footer>
    </div>
  )
}
