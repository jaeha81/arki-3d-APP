'use client'

import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateEstimate } from '@/lib/hooks/use-estimate'
import { estimateApi } from '@/lib/api/estimate'
import type { Estimate, EstimateItem } from '@/types/estimate'

interface EstimatePanelProps {
  projectId: string
}

function formatCurrency(value: number): string {
  return value.toLocaleString('ko-KR') + '원'
}

function groupByCategory(items: EstimateItem[]): Record<string, EstimateItem[]> {
  const groups: Record<string, EstimateItem[]> = {}
  for (const item of items) {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
  }
  return groups
}

export function EstimatePanel({ projectId }: EstimatePanelProps) {
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const createMutation = useCreateEstimate()

  const handleCreate = async () => {
    const result = await createMutation.mutateAsync({
      project_id: projectId,
      name: '견적서',
      scene_data: {},
    })
    setEstimate(result)
  }

  const handleDownloadPdf = async () => {
    if (!estimate) return
    setIsDownloading(true)
    try {
      const blob = await estimateApi.downloadPdf(estimate.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `estimate_${estimate.id.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  const grouped = estimate ? groupByCategory(estimate.items) : {}
  const marginAmount = estimate
    ? Math.round((estimate.material_cost + estimate.labor_cost) * estimate.margin_rate)
    : 0

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
        <h3 className="text-sm font-semibold">견적서</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={handleCreate}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <FileText className="h-3 w-3" />
          )}
          견적 생성
        </Button>
      </div>

      {/* 내용 */}
      <div className="flex-1 overflow-y-auto p-4">
        {createMutation.isPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        )}

        {!estimate && !createMutation.isPending && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <FileText className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              2D 도면을 완성하고 견적을 생성하세요
            </p>
          </div>
        )}

        {estimate && (
          <div className="space-y-4">
            {/* BOM 테이블 */}
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h4 className="mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">
                  {category}
                </h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="pb-1 text-left font-medium">항목명</th>
                      <th className="pb-1 text-right font-medium">수량</th>
                      <th className="pb-1 text-right font-medium">단가</th>
                      <th className="pb-1 text-right font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b border-[hsl(var(--border))]/50">
                        <td className="py-1.5">{item.name}</td>
                        <td className="py-1.5 text-right">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-1.5 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="py-1.5 text-right">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* 합계 섹션 */}
            <div className="space-y-1.5 border-t border-[hsl(var(--border))] pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-[hsl(var(--muted-foreground))]">자재비</span>
                <span>{formatCurrency(estimate.material_cost)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[hsl(var(--muted-foreground))]">시공비</span>
                <span>{formatCurrency(estimate.labor_cost)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[hsl(var(--muted-foreground))]">
                  관리비 ({Math.round(estimate.margin_rate * 100)}%)
                </span>
                <span>{formatCurrency(marginAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2 text-sm font-bold">
                <span>총 합계</span>
                <span>{formatCurrency(estimate.total_cost)}</span>
              </div>
            </div>

            {/* PDF 다운로드 */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              PDF 다운로드
            </Button>
          </div>
        )}

        {createMutation.isError && (
          <p className="mt-2 text-xs text-red-500">
            견적 생성에 실패했습니다. 다시 시도해주세요.
          </p>
        )}
      </div>
    </div>
  )
}
