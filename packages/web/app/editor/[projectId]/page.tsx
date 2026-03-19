'use client'

import { use, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/loading-skeleton'

const EditorLayout = dynamic(
  () => import('@/components/editor/EditorLayout').then(m => ({ default: m.EditorLayout })),
  {
    ssr: false,
    loading: () => <EditorLoadingSkeleton />,
  }
)

function EditorLoadingSkeleton() {
  return (
    <div className="flex h-screen w-full">
      <div className="w-12 border-r flex flex-col gap-2 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
      <div className="flex-1">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="w-72 border-l flex flex-col gap-3 p-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

interface EditorPageProps {
  params: Promise<{ projectId: string }>
}

export default function EditorPage({ params }: EditorPageProps) {
  const { projectId } = use(params)

  return (
    <Suspense fallback={<EditorLoadingSkeleton />}>
      <EditorLayout projectId={projectId} />
    </Suspense>
  )
}
