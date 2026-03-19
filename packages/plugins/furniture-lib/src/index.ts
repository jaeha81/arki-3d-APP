import React from 'react'
import { PluginBase, type PluginManifest, type PluginContext } from '@arki/plugin-core'
import { FurnitureLibraryPanel } from './FurnitureLibraryPanel'

export default class FurnitureLibPlugin extends PluginBase {
  readonly manifest: PluginManifest = {
    id: 'furniture-lib',
    name: '가구 라이브러리',
    version: '1.0.0',
    description: '3D 가구 에셋 확장 카탈로그',
    capabilities: ['asset-provider', 'panel'],
    entry: 'src/index.ts',
    minAppVersion: '0.1.0',
    icon: 'sofa',
    permissions: ['api:asset', 'scene:write'],
  }

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)
    // Wrap with a React component so it satisfies React.ComponentType
    const BoundPanel: React.ComponentType = () =>
      React.createElement(FurnitureLibraryPanel, { ctx })
    ctx.ui.registerPanel('furniture-lib-panel', BoundPanel, {
      title: '가구 라이브러리',
      position: 'left',
      width: 280,
      defaultOpen: true,
    })
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('furniture-lib-panel')
  }
}
