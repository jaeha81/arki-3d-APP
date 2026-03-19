import { PluginBase } from '@arki/plugin-core'
import type { PluginManifest, PluginContext } from '@arki/plugin-core'
import manifest from '../plugin.json'
import AiDesignPanel from './ai-design-panel'

export default class AiDesignPlugin extends PluginBase {
  readonly manifest: PluginManifest = manifest as PluginManifest

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)

    ctx.ui.registerPanel('ai-design', AiDesignPanel, {
      title: 'AI 디자인',
      position: 'right',
      defaultOpen: false,
    })
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('ai-design')
    await super.deactivate()
  }
}
