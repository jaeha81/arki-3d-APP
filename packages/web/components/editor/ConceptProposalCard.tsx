'use client'

import type { ConceptProposal } from '@/types/chat'

interface Props {
  concept: ConceptProposal
}

export function ConceptProposalCard({ concept }: Props) {
  const budgetRange = concept.budget_range
    ? `${(concept.budget_range.min / 10000).toFixed(0)}만 ~ ${(concept.budget_range.max / 10000).toFixed(0)}만원`
    : null

  return (
    <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          디자인 컨셉 제안
        </p>
        <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] mt-0.5">
          {concept.concept_name}
        </h4>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">
        {/* 분위기 */}
        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
          {concept.mood}
        </p>

        {/* 색상 팔레트 */}
        {concept.color_palette.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5">색상 팔레트</p>
            <div className="flex gap-2 flex-wrap">
              {concept.color_palette.map((swatch, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="h-5 w-5 rounded-full border border-[hsl(var(--border))] shrink-0"
                    style={{ backgroundColor: swatch.hex }}
                    title={swatch.hex}
                  />
                  <div>
                    <p className="text-[10px] font-medium text-[hsl(var(--foreground))] leading-none">
                      {swatch.name}
                    </p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] leading-none mt-0.5">
                      {swatch.usage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 키워드 */}
        {concept.style_keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {concept.style_keywords.map((kw, i) => (
              <span
                key={i}
                className="rounded-full bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* 주요 가구 */}
        {concept.key_furniture.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[hsl(var(--foreground))] mb-1">추천 가구</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {concept.key_furniture.join(' · ')}
            </p>
          </div>
        )}

        {/* 예산 범위 */}
        {budgetRange && (
          <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--muted))] px-3 py-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">예상 예산</p>
            <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{budgetRange}</p>
          </div>
        )}
      </div>
    </div>
  )
}
