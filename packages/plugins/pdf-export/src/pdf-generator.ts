import type { EstimateResult } from '../../estimation/src/estimate-engine'

// Format KRW currency
const formatKRW = (n: number): string => new Intl.NumberFormat('ko-KR').format(n) + '원'

// Generate HTML string for the PDF
export function generateEstimateHtml(
  estimate: EstimateResult,
  companyName = 'Arki 인테리어',
  companyPhone = '02-1234-5678'
): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const itemRows = estimate.lineItems
    .map(
      item => `
        <tr>
          <td>${item.category}</td>
          <td>${item.name}</td>
          <td style="text-align:right">${item.quantity}${item.unit}</td>
          <td style="text-align:right">${formatKRW(item.unitPrice)}</td>
          <td style="text-align:right">${formatKRW(item.total)}</td>
        </tr>`
    )
    .join('')

  const laborRow =
    estimate.laborCost > 0
      ? `<tr><td>인건비</td><td>${formatKRW(estimate.laborCost)}</td></tr>`
      : ''

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>견적서 - ${estimate.projectName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Malgun Gothic', sans-serif; padding: 40px; color: #111; font-size: 12px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #111; padding-bottom: 20px; }
  .company-name { font-size: 22px; font-weight: 700; }
  .doc-title { font-size: 28px; font-weight: 700; text-align: right; }
  .doc-info { text-align: right; margin-top: 8px; color: #555; }
  .project-info { background: #f5f5f5; padding: 16px; border-radius: 4px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .project-info dt { color: #666; }
  .project-info dd { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #111; color: #fff; padding: 8px 12px; text-align: left; font-size: 11px; }
  td { padding: 7px 12px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) td { background: #fafafa; }
  .totals { margin-left: auto; width: 280px; }
  .totals table { margin-bottom: 0; }
  .totals td:last-child { text-align: right; font-weight: 600; }
  .grand-total td { font-size: 15px; font-weight: 700; background: #f0f0f0; border-top: 2px solid #111; }
  .footer { margin-top: 48px; border-top: 1px solid #ddd; padding-top: 16px; color: #888; font-size: 11px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${companyName}</div>
      <div style="color:#555; margin-top:4px">${companyPhone}</div>
    </div>
    <div>
      <div class="doc-title">인테리어 견적서</div>
      <div class="doc-info">발행일: ${dateStr}</div>
    </div>
  </div>

  <dl class="project-info">
    <dt>프로젝트명</dt><dd>${estimate.projectName}</dd>
    <dt>총 면적</dt><dd>${estimate.totalArea.toFixed(1)}m²</dd>
  </dl>

  <table>
    <thead>
      <tr>
        <th>구분</th><th>항목</th><th style="text-align:right">수량</th>
        <th style="text-align:right">단가</th><th style="text-align:right">금액</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>소계</td><td>${formatKRW(estimate.subtotal)}</td></tr>
      ${laborRow}
      <tr><td>부가세 (10%)</td><td>${formatKRW(estimate.vat)}</td></tr>
      <tr class="grand-total"><td>최종 합계</td><td>${formatKRW(estimate.grandTotal)}</td></tr>
    </table>
  </div>

  <div class="footer">
    본 견적서는 발행일로부터 30일간 유효합니다. 자재 가격은 시장 상황에 따라 변동될 수 있습니다.<br>
    Arki-3D 플랫폼으로 생성된 견적서
  </div>
</body>
</html>`
}

// Print/export as PDF using browser print dialog
export function printAsPdf(htmlContent: string): void {
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (printWindow === null) {
    alert('팝업이 차단되었습니다. 팝업을 허용해주세요.')
    return
  }
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()

  // Small delay to allow render
  setTimeout(() => {
    printWindow.print()
  }, 300)
}

// Download as HTML (fallback when print not available)
export function downloadAsHtml(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
