import { PluginBase } from '@arki/plugin-core'
import type { PluginManifest, PluginContext } from '@arki/plugin-core'
import manifest from '../plugin.json'
import { PdfExportPanel, setPluginContext } from './pdf-export-panel'

export default class PdfExportPlugin extends PluginBase {
  readonly manifest: PluginManifest = manifest as PluginManifest

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)

    setPluginContext(ctx)

    ctx.ui.registerPanel('pdf-export', PdfExportPanel, {
      title: 'PDF 내보내기',
      position: 'right',
      width: 320,
      defaultOpen: false,
    })
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('pdf-export')
    setPluginContext(null)
    await super.deactivate()
  }
}
