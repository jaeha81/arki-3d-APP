import React, { useState, useCallback } from 'react'
import type { PluginContext, Room } from '@arki/plugin-core'

// ─── Response Types ──────────────────────────────────────────────────────────

interface RoomEstimate {
  roomId: string
  roomName: string
  materialCost: number
  laborCost: number
  total: number
}

interface EstimateResponse {
  data: {
    items: RoomEstimate[]
    grandTotal: number
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface EstimationPanelProps {
  ctx: PluginContext
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatKRW(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}

// ─── Skeleton Rows ───────────────────────────────────────────────────────────

function SkeletonRow(): React.ReactElement {
  return (
    <tr>
      <td style={cellStyle}>
        <div style={skeletonBlock} />
      </td>
      <td style={cellStyle}>
        <div style={skeletonBlock} />
      </td>
      <td style={cellStyle}>
        <div style={skeletonBlock} />
      </td>
      <td style={cellStyle}>
        <div style={skeletonBlock} />
      </td>
    </tr>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: 16,
  fontFamily: 'Pretendard, sans-serif',
  fontSize: 14,
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 12,
}

const headerCellStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  borderBottom: '2px solid #e2e8f0',
  fontWeight: 600,
  fontSize: 12,
  color: '#64748b',
}

const cellStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid #f1f5f9',
}

const totalRowStyle: React.CSSProperties = {
  padding: '10px 10px',
  fontWeight: 700,
  borderTop: '2px solid #e2e8f0',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 0',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const disabledButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#94a3b8',
  cursor: 'not-allowed',
}

const skeletonBlock: React.CSSProperties = {
  height: 16,
  borderRadius: 4,
  backgroundColor: '#e2e8f0',
}

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#94a3b8',
  padding: '24px 0',
}

const errorStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: 13,
  marginTop: 8,
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EstimationPanel({ ctx }: EstimationPanelProps): React.ReactElement {
  const [estimates, setEstimates] = useState<RoomEstimate[] | null>(null)
  const [grandTotal, setGrandTotal] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rooms: Room[] = ctx.scene.getFloorPlan().rooms

  const handleCalculate = useCallback(async () => {
    if (rooms.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await ctx.api.post<EstimateResponse>('/estimates/calculate', {
        rooms: rooms.map((r) => ({
          id: r.id,
          name: r.name,
          area: r.area,
          wallIds: r.wallIds,
        })),
      })

      setEstimates(response.data.items)
      setGrandTotal(response.data.grandTotal)
      ctx.ui.showToast('견적 계산이 완료되었습니다.', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '견적 계산에 실패했습니다.'
      setError(message)
      ctx.ui.showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [rooms, ctx])

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>견적 산출</h3>

      {rooms.length === 0 ? (
        <p style={emptyStyle}>도면에 방이 없습니다. 방을 추가해 주세요.</p>
      ) : (
        <>
          <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13 }}>
            {rooms.length}개 방이 감지되었습니다.
          </p>

          <button
            type="button"
            style={loading ? disabledButtonStyle : buttonStyle}
            disabled={loading}
            onClick={handleCalculate}
          >
            {loading ? '계산 중...' : '견적 계산'}
          </button>

          {error && <p style={errorStyle}>{error}</p>}

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>방</th>
                <th style={headerCellStyle}>자재비</th>
                <th style={headerCellStyle}>시공비</th>
                <th style={headerCellStyle}>소계</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}

              {!loading && estimates !== null && estimates.length > 0 && (
                <>
                  {estimates.map((item) => (
                    <tr key={item.roomId}>
                      <td style={cellStyle}>{item.roomName}</td>
                      <td style={cellStyle}>{formatKRW(item.materialCost)}</td>
                      <td style={cellStyle}>{formatKRW(item.laborCost)}</td>
                      <td style={cellStyle}>{formatKRW(item.total)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={totalRowStyle} colSpan={3}>
                      총 합계
                    </td>
                    <td style={totalRowStyle}>{formatKRW(grandTotal)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
