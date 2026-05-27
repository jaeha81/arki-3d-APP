'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ModelBreakdown {
  model: string
  call_count: number
  total_cost_usd: number
  total_input_tokens: number
  total_output_tokens: number
}

interface TopUser {
  user_id: string
  email: string
  credits_used: number
  cost_usd: number
}

interface DailyCall {
  date: string
  count: number
  cost_usd: number
}

interface AIStatsDetail {
  daily_calls: DailyCall[]
  model_breakdown: ModelBreakdown[]
  top_users: TopUser[]
}

const MODEL_LABELS: Record<string, string> = {
  'claude-haiku-4-5-20251001': 'Haiku (저비용)',
  'claude-sonnet-4-6':         'Sonnet (중급)',
  'claude-opus-4-7':           'Opus (고급)',
}

function usdToKrw(usd: number) {
  return Math.round(usd * 1350).toLocaleString('ko-KR')
}

function formatUsd(usd: number) {
  return usd < 0.001 ? `$${(usd * 1000).toFixed(3)}m` : `$${usd.toFixed(4)}`
}

export function AICostDashboard({ stats }: { stats: AIStatsDetail }) {
  const totalCost = stats.model_breakdown.reduce((s, m) => s + m.total_cost_usd, 0)
  const totalCalls = stats.model_breakdown.reduce((s, m) => s + m.call_count, 0)

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="30일 총 호출" value={totalCalls.toLocaleString('ko-KR')} unit="회" />
        <SummaryCard label="30일 API 비용" value={`₩${usdToKrw(totalCost)}`} unit="" />
        <SummaryCard label="평균 호출 단가" value={totalCalls ? formatUsd(totalCost / totalCalls) : '-'} unit="" />
        <SummaryCard label="사용 모델 수" value={stats.model_breakdown.length} unit="종" />
      </div>

      {/* 모델별 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">모델별 비용 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.model_breakdown.map((m) => {
              const pct = totalCost > 0 ? (m.total_cost_usd / totalCost) * 100 : 0
              return (
                <div key={m.model} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{MODEL_LABELS[m.model] ?? m.model}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {m.call_count}회 · ₩{usdToKrw(m.total_cost_usd)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-1.5 rounded-full bg-[hsl(var(--primary))]"
                      style={{ width: `${pct.toFixed(1)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    입력 {m.total_input_tokens.toLocaleString()}tok / 출력 {m.total_output_tokens.toLocaleString()}tok
                  </p>
                </div>
              )
            })}
            {stats.model_breakdown.length === 0 && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">AI 호출 기록이 없습니다.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 고비용 사용자 TOP 10 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">고사용 사용자 TOP 10 (30일)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[hsl(var(--muted-foreground))]">
                  <th className="pb-2 text-left font-medium">이메일</th>
                  <th className="pb-2 text-right font-medium">크레딧</th>
                  <th className="pb-2 text-right font-medium">비용</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_users.map((u) => (
                  <tr key={u.user_id} className="border-b last:border-0">
                    <td className="py-2 truncate max-w-[200px]">{u.email}</td>
                    <td className="py-2 text-right">{u.credits_used}회</td>
                    <td className="py-2 text-right">₩{usdToKrw(u.cost_usd)}</td>
                  </tr>
                ))}
                {stats.top_users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-[hsl(var(--muted-foreground))]">
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 일별 호출 추이 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">일별 호출 추이 (최근 30일)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {stats.daily_calls.map((d) => {
              const maxCount = Math.max(...stats.daily_calls.map((x) => x.count), 1)
              const heightPct = (d.count / maxCount) * 100
              return (
                <div
                  key={d.date}
                  className="group relative flex-1 min-w-0"
                  title={`${d.date}: ${d.count}회 / ₩${usdToKrw(d.cost_usd)}`}
                >
                  <div
                    className="w-full rounded-sm bg-[hsl(var(--primary))]/70 hover:bg-[hsl(var(--primary))] transition-colors"
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                </div>
              )
            })}
            {stats.daily_calls.length === 0 && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] w-full text-center">데이터 없음</p>
            )}
          </div>
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            막대 위에 마우스를 올리면 날짜별 상세 정보가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-bold">
          {value}
          {unit && <span className="ml-0.5 text-base font-normal">{unit}</span>}
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
      </CardContent>
    </Card>
  )
}
