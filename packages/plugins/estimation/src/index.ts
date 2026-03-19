import { PluginBase, type PluginManifest, type PluginContext } from '../../core/src/types'
import { EstimationPanel } from './EstimationPanel'

export default class EstimationPlugin extends PluginBase {
  readonly manifest: PluginManifest = {
    id: 'estimation',
    name: '자동 견적',
    version: '1.0.0',
    description: '자재+시공비 자동 견적 산출',
    capabilities: ['panel'],
    entry: 'src/index.ts',
    minAppVersion: '0.1.0',
    icon: 'calculator',
    permissions: ['api:estimate', 'scene:read'],
  }

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)
    ctx.ui.registerPanel(
      'estimation-panel',
      // zero-prop wrapper — ctx captured via closure
      () => EstimationPanel({ ctx }),
      {
        title: '자동 견적',
        position: 'right',
        width: 320,
        defaultOpen: false,
      }
    )
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('estimation-panel')
  }
}
