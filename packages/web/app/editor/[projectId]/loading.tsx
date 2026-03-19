import { SkeletonEditorPanel } from '@/components/editor/SkeletonEditorPanel'

export default function EditorLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <SkeletonEditorPanel />
        <p className="text-sm text-muted-foreground">에디터 로딩 중...</p>
      </div>
    </div>
  )
}
