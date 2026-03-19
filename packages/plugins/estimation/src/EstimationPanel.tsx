'use client'
import React, { useState, useCallback } from 'react'
import type { PluginContext } from '../../core/src/types'
import { calculateEstimate, type EstimateResult } from './estimate-engine'
import { PRICE_CATALOG } from './price-catalog'

interface Props {
  ctx: PluginContext
}

const formatKRW = (n: number): string => new Intl.NumberFormat('ko-KR').format(n) + '원'

export function EstimationPanel({ ctx }: Props) {
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [flooringId, setFlooringId] = useState('floor-vinyl')
  const [wallFinishId, setWallFinishId] = useState('wall-paint')
  const [ceilingId, setCeilingId] = useState('ceil-paint')
  const [isCalculating, setIsCalculating] = useState(false)

  const flooringOptions = PRICE_CATALOG.filter(p => p.category === 'flooring')
  const wallOptions = PRICE_CATALOG.filter(p => p.category === 'wall')
  const ceilingOptions = PRICE_CATALOG.filter(p => p.category === 'ceiling')

  const handleCalculate = useCallback(() => {
    setIsCalculating(true)
    try {
      const plan = ctx.scene.getFloorPlan()
      const estimate = calculateEstimate(plan, { flooringId, wallFinishId, ceilingId })
      setResult(estimate)
      ctx.ui.showToast('견적이 계산되었습니다', 'success')
    } catch (_err) {
      ctx.ui.showToast('견적 계산 중 오류가 발생했습니다', 'error')
    } finally {
      setIsCalculating(false)
    }
  }, [ctx, flooringId, wallFinishId, ceilingId])

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h3 className="font-semibold text-sm">자동 견적 계산</h3>

      {/* 마감재 선택 */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">바닥재</span>
          <select
            value={flooringId}
            onChange={e => setFlooringId(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1.5 bg-background"
          >
            {flooringOptions.map(o => (
              <option key={o.id} value={o.id}>
                {o.name} ({new Intl.NumberFormat('ko-KR').format(o.unitPrice)}원/m²)
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">벽 마감</span>
          <select
            value={wallFinishId}
            onChange={e => setWallFinishId(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1.5 bg-background"
          >
            {wallOptions.map(o => (
              <option key={o.id} value={o.id}>
                {o.name} ({new Intl.NumberFormat('ko-KR').format(o.unitPrice)}원/m²)
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">천장</span>
          <select
            value={ceilingId}
            onChange={e => setCeilingId(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1.5 bg-background"
          >
            {ceilingOptions.map(o => (
              <option key={o.id} value={o.id}>
                {o.name} ({new Intl.NumberFormat('ko-KR').format(o.unitPrice)}원/m²)
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isCalculating ? '계산 중...' : '견적 계산'}
      </button>

      {/* 결과 */}
      {result !== null && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            총 면적: {result.totalArea.toFixed(1)}m²
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">항목</th>
                  <th className="text-right p-2">수량</th>
                  <th className="text-right p-2">금액</th>
                </tr>
              </thead>
              <tbody>
                {result.lineItems.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className="text-right p-2">
                      {item.quantity}
                      {item.unit}
                    </td>
                    <td className="text-right p-2">{formatKRW(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 text-xs border-t pt-2">
            <div className="flex justify-between">
              <span>소계</span>
              <span>{formatKRW(result.subtotal)}</span>
            </div>
            {result.laborCost > 0 && (
              <div className="flex justify-between">
                <span>인건비</span>
                <span>{formatKRW(result.laborCost)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>부가세 (10%)</span>
              <span>{formatKRW(result.vat)}</span>
            </div>
            <div className="flex justify-between font-semibold text-sm border-t pt-1">
              <span>합계</span>
              <span className="text-primary">{formatKRW(result.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
