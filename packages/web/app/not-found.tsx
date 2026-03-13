import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-[hsl(var(--muted-foreground))]">
        404
      </h1>
      <p className="text-lg">페이지를 찾을 수 없습니다</p>
      <Button asChild>
        <Link href="/projects">대시보드로 돌아가기</Link>
      </Button>
    </div>
  )
}
