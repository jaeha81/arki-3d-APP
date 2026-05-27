'use client'

import type { EstimateDraft } from '@/types/chat'

interface Props {
  draft: EstimateDraft
}

function formatKRW(amount: number) {
  if (amount >= 10000) {
    return `${(amount / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만원`
  }
  return `${amount.toLocaleString('ko-KR')}원`
}

export function EstimateDraftCard({ draft }: Props) {
  return (
    <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          견적 초안
        </p>
        <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] mt-0.5">
          {draft.room_type}
          {draft.area_m2 ? ` · ${draft.area_m2}㎡` : ''}
        </h4>
      </div>

      {/* 항목 테이블 */}
      <div className="px-4 py-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="pb-1.5 text-left font-medium text-[hsl(var(--muted-foreground))]">항목</th>
              <th className="pb-1.5 text-right font-medium text-[hsl(var(--muted-foreground))]">수량</th>
              <th className="pb-1.5 text-right font-medium text-[hsl(var(--muted-foreground))]">금액</th>
            </tr>
          </thead>
          <tbody>
            {draft.breakdown.map((item, i) => (
              <tr key={i} className="border-b border-[hsl(var(--border)/0.5)] last:border-0">
                <td className="py-1.5 text-[hsl(var(--foreground))]">{item.category}</td>
                <td className="py-1.5 text-right text-[hsl(var(--muted-foreground))]">
                  {item.estimated_qty ?? '-'}
                </td>
                <td className="py-1.5 text-right font-medium text-[hsl(var(--foreground))]">
                  {formatKRW(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 합계 영역 */}
        <div className="mt-3 flex flex-col gap-1 border-t border-[hsl(var(--border))] pt-2">
          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>소계</span>
            <span>{formatKRW(draft.subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>마진 ({(draft.margin_rate * 100).toFixed(0)}%)</span>
            <span>{formatKRW(draft.total - draft.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-[hsl(var(--foreground))] mt-1">
            <span>합계</span>
            <span className="text-[hsl(var(--primary))]">{formatKRW(draft.total)}</span>
          </div>
        </div>

        {draft.notes && (
          <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed">
            * {draft.notes}
          </p>
        )}
      </div>
    </div>
  )
}
