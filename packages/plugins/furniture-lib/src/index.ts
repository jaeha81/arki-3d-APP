import { PluginBase } from '@arki/plugin-core'
import type { PluginManifest, PluginContext } from '@arki/plugin-core'
import manifest from '../plugin.json'
import FurniturePanel from './furniture-panel'

export default class FurnitureLibPlugin extends PluginBase {
  readonly manifest: PluginManifest = manifest as PluginManifest

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)

    ctx.ui.registerPanel('furniture-lib', FurniturePanel, {
      title: '가구 라이브러리',
      position: 'left',
      defaultOpen: false,
    })
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('furniture-lib')
    await super.deactivate()
  }
}
