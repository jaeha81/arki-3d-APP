'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, Link2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShareLink } from '@/lib/hooks/use-estimate'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ShareLink } from '@/types/estimate'

interface ShareDialogProps {
  projectId: string
  open: boolean
  onClose: () => void
}

export function ShareDialog({ projectId, open, onClose }: ShareDialogProps) {
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [copied, setCopied] = useState(false)
  const shareMutation = useShareLink()

  const handleCreate = useCallback(async () => {
    const result = await shareMutation.mutateAsync(projectId)
    setShareLink(result)
  }, [projectId, shareMutation])

  const handleCopy = useCallback(async () => {
    if (!shareLink) return
    await navigator.clipboard.writeText(shareLink.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [shareLink])

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose()
        // 닫을 때 상태 초기화
        setShareLink(null)
        setCopied(false)
      }
    },
    [onClose]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로젝트 공유</DialogTitle>
          <DialogDescription>
            이 링크는 로그인 없이 3D 뷰어로 접근 가능합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareLink ? (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleCreate}
              disabled={shareMutation.isPending}
            >
              {shareMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              공유 링크 생성
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareLink.url}
                  className="flex-1 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600">복사됨</p>
              )}
            </div>
          )}

          {shareMutation.isError && (
            <p className="text-xs text-red-500">
              공유 링크 생성에 실패했습니다. 다시 시도해주세요.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
