export function SkeletonProjectCard() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      {/* Mock image area */}
      <div className="h-40 w-full animate-pulse rounded-md bg-muted" />
      {/* Title line */}
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      {/* Description line */}
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      {/* Meta line */}
      <div className="flex gap-2">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function SkeletonEditorPanel() {
  return (
    <div className="flex h-full w-64 flex-col gap-3 border-r p-3">
      {/* Toolbar area */}
      <div className="flex gap-2">
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
      </div>
      {/* Divider */}
      <div className="h-px w-full bg-border" />
      {/* Content area */}
      <div className="flex-1 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function SkeletonAssetCard() {
  return (
    <div className="rounded-lg border p-2 space-y-2">
      {/* Thumbnail */}
      <div className="h-20 w-full animate-pulse rounded bg-muted" />
      {/* Name */}
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      {/* Price / meta */}
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  )
}
