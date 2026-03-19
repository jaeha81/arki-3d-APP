import { PluginBase } from '@arki/plugin-core'
import type { PluginManifest, PluginContext } from '@arki/plugin-core'
import manifest from '../plugin.json'
import EstimationPanel from './estimation-panel'

export default class EstimationPlugin extends PluginBase {
  readonly manifest: PluginManifest = manifest as PluginManifest

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)

    ctx.ui.registerPanel('estimation', EstimationPanel, {
      title: '자동 견적',
      position: 'right',
      defaultOpen: false,
    })
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('estimation')
    await super.deactivate()
  }
}
