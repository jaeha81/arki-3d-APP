import { PluginBase, type PluginManifest, type PluginContext } from '../../core/src/types'
import { PdfExportPanel } from './PdfExportPanel'

export default class PdfExportPlugin extends PluginBase {
  readonly manifest: PluginManifest = {
    id: 'pdf-export',
    name: 'PDF 내보내기',
    version: '1.0.0',
    description: '견적서 + 도면 PDF 생성',
    capabilities: ['export'],
    entry: 'src/index.ts',
    minAppVersion: '0.1.0',
    icon: 'file-text',
    permissions: ['api:estimate', 'scene:read'],
  }

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)
    ctx.ui.registerPanel(
      'pdf-export-panel',
      // zero-prop wrapper — ctx captured via closure
      () => PdfExportPanel({ ctx }),
      {
        title: 'PDF 내보내기',
        position: 'right',
        width: 280,
        defaultOpen: false,
      }
    )
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('pdf-export-panel')
  }
}
