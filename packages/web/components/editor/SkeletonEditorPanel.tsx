import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonEditorPanel() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-5 w-24" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonAssetCard() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md">
      <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
