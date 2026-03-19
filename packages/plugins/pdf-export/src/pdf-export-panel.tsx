import React, { useState, useCallback } from 'react'
import type { PluginContext } from '../../core/src/types'

// ─── Module-level context (set by plugin on activate/deactivate) ─────────────

let pluginCtx: PluginContext | null = null

export function setPluginContext(ctx: PluginContext | null): void {
  pluginCtx = ctx
}

// ─── Types ───────────────────────────────────────────────────────────────────

type PdfType = 'estimate' | 'floor-plan' | 'full-report'

interface PdfOption {
  type: PdfType
  label: string
  description: string
}

interface PdfGenerationResult {
  url: string
  filename: string
}

type ExportStatus = 'idle' | 'loading' | 'success' | 'error'

interface ExportState {
  status: ExportStatus
  downloadUrl: string | null
  filename: string | null
  errorMessage: string | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PDF_OPTIONS: readonly PdfOption[] = [
  {
    type: 'estimate',
    label: '견적서 PDF',
    description: '자재 및 시공비 견적서를 PDF로 내보냅니다.',
  },
  {
    type: 'floor-plan',
    label: '도면 PDF',
    description: '현재 도면을 치수 포함 PDF로 내보냅니다.',
  },
  {
    type: 'full-report',
    label: '전체 보고서',
    description: '견적서 + 도면 + 3D 렌더를 포함한 종합 보고서입니다.',
  },
] as const

const INITIAL_STATE: ExportState = {
  status: 'idle',
  downloadUrl: null,
  filename: null,
  errorMessage: null,
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '16px',
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '14px',
    color: '#1a1a1a',
  },
  heading: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600 as const,
    color: '#111',
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '12px',
    border: '1px solid #e2e2e2',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  label: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 500 as const,
  },
  description: {
    margin: 0,
    fontSize: '12px',
    color: '#666',
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 500 as const,
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  retryButton: {
    padding: '8px 16px',
    border: '1px solid #dc2626',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: 500 as const,
    cursor: 'pointer',
  },
  downloadLink: {
    display: 'inline-block',
    padding: '8px 16px',
    border: '1px solid #16a34a',
    borderRadius: '6px',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    fontSize: '13px',
    fontWeight: 500 as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  errorBox: {
    padding: '10px 12px',
    borderRadius: '6px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    fontSize: '12px',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #e2e2e2',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    verticalAlign: 'middle',
    marginRight: '8px',
  },
  spinnerKeyframes: `
    @keyframes arki-pdf-spin {
      to { transform: rotate(360deg); }
    }
  `,
} as const

// ─── Component ───────────────────────────────────────────────────────────────

export function PdfExportPanel(): React.JSX.Element {
  const [exportStates, setExportStates] = useState<Record<PdfType, ExportState>>({
    estimate: { ...INITIAL_STATE },
    'floor-plan': { ...INITIAL_STATE },
    'full-report': { ...INITIAL_STATE },
  })

  const handleExport = useCallback(async (pdfType: PdfType) => {
    if (!pluginCtx) return

    setExportStates((prev) => ({
      ...prev,
      [pdfType]: {
        status: 'loading' as const,
        downloadUrl: null,
        filename: null,
        errorMessage: null,
      },
    }))

    try {
      const params = new URLSearchParams(window.location.search)
      const estimateId = params.get('estimateId') ?? 'current'

      const result = await pluginCtx.api.post<PdfGenerationResult>(
        `/estimates/${estimateId}/pdf`,
        { type: pdfType },
      )

      setExportStates((prev) => ({
        ...prev,
        [pdfType]: {
          status: 'success' as const,
          downloadUrl: result.url,
          filename: result.filename,
          errorMessage: null,
        },
      }))

      pluginCtx.ui.showToast(`${pdfType} PDF가 생성되었습니다.`, 'success')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'PDF 생성에 실패했습니다.'

      setExportStates((prev) => ({
        ...prev,
        [pdfType]: {
          status: 'error' as const,
          downloadUrl: null,
          filename: null,
          errorMessage: message,
        },
      }))

      pluginCtx.ui.showToast('PDF 생성에 실패했습니다.', 'error')
    }
  }, [])

  return (
    <div style={styles.container}>
      <style>{styles.spinnerKeyframes}</style>
      <h3 style={styles.heading}>PDF 내보내기</h3>

      {PDF_OPTIONS.map((option) => {
        const state = exportStates[option.type]

        return (
          <div key={option.type} style={styles.card}>
            <p style={styles.label}>{option.label}</p>
            <p style={styles.description}>{option.description}</p>

            {state.status === 'idle' && (
              <button
                type="button"
                style={styles.button}
                onClick={() => void handleExport(option.type)}
              >
                내보내기
              </button>
            )}

            {state.status === 'loading' && (
              <button
                type="button"
                style={{ ...styles.button, ...styles.buttonDisabled }}
                disabled
              >
                <span
                  style={{
                    ...styles.spinner,
                    animation: 'arki-pdf-spin 0.6s linear infinite',
                  }}
                />
                생성 중...
              </button>
            )}

            {state.status === 'success' && state.downloadUrl !== null && (
              <a
                href={state.downloadUrl}
                download={state.filename ?? 'export.pdf'}
                style={styles.downloadLink}
              >
                {state.filename ?? 'export.pdf'} 다운로드
              </a>
            )}

            {state.status === 'error' && (
              <>
                <div style={styles.errorBox}>
                  {state.errorMessage}
                </div>
                <button
                  type="button"
                  style={styles.retryButton}
                  onClick={() => void handleExport(option.type)}
                >
                  다시 시도
                </button>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
