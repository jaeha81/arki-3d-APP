import { cn } from '@/lib/utils'

interface Props {
  className?: string
  count?: number
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[hsl(var(--muted))]',
        className
      )}
    />
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border bg-[hsl(var(--card))] p-4 space-y-3">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function ProjectGridSkeleton({ count = 6 }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  )
}
