'use client'
import React, { useState } from 'react'
import type { PluginContext } from '../../core/src/types'
import { calculateEstimate } from '../../estimation/src/estimate-engine'
import { generateEstimateHtml, printAsPdf, downloadAsHtml } from './pdf-generator'

interface Props {
  ctx: PluginContext
}

export function PdfExportPanel({ ctx }: Props) {
  const [companyName, setCompanyName] = useState('Arki 인테리어')
  const [companyPhone, setCompanyPhone] = useState('02-1234-5678')
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePrint = async (): Promise<void> => {
    setIsGenerating(true)
    try {
      const plan = ctx.scene.getFloorPlan()
      const estimate = calculateEstimate(plan)
      const html = generateEstimateHtml(estimate, companyName, companyPhone)
      printAsPdf(html)
      ctx.ui.showToast('PDF 인쇄 창이 열렸습니다', 'success')
    } catch (_err) {
      ctx.ui.showToast('PDF 생성 중 오류가 발생했습니다', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (): Promise<void> => {
    setIsGenerating(true)
    try {
      const plan = ctx.scene.getFloorPlan()
      const estimate = calculateEstimate(plan)
      const html = generateEstimateHtml(estimate, companyName, companyPhone)
      const datePart = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')
      const filename = `견적서_${plan.metadata.name}_${datePart}.html`
      downloadAsHtml(html, filename)
      ctx.ui.showToast('견적서가 다운로드되었습니다', 'success')
    } catch (_err) {
      ctx.ui.showToast('다운로드 중 오류가 발생했습니다', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="font-semibold text-sm">PDF 견적서 내보내기</h3>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">업체명</span>
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1.5 bg-background"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">연락처</span>
          <input
            type="text"
            value={companyPhone}
            onChange={e => setCompanyPhone(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1.5 bg-background"
          />
        </label>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {
            void handlePrint()
          }}
          disabled={isGenerating}
          className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          🖨️ PDF 인쇄
        </button>
        <button
          onClick={() => {
            void handleDownload()
          }}
          disabled={isGenerating}
          className="w-full py-2 text-sm font-medium border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
        >
          ⬇️ HTML 다운로드
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        PDF 인쇄: 브라우저 인쇄 기능으로 PDF 저장
        <br />
        HTML 다운로드: 브라우저에서 열어 인쇄 가능
      </p>
    </div>
  )
}
