import React from 'react'
import { PluginBase, type PluginManifest, type PluginContext } from '@arki/plugin-core'
import { AiDesignPanel } from './AiDesignPanel'

export default class AiDesignPlugin extends PluginBase {
  readonly manifest: PluginManifest = {
    id: 'ai-design',
    name: 'AI 디자인 어시스턴트',
    version: '1.0.0',
    description: 'Claude AI로 공간 디자인 자동 제안',
    capabilities: ['panel', 'ai-agent'],
    entry: 'src/index.ts',
    minAppVersion: '0.1.0',
    icon: 'sparkles',
    permissions: ['api:chat', 'scene:write'],
  }

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)
    // Wrap with a React component so it satisfies React.ComponentType
    const BoundPanel: React.ComponentType = () => React.createElement(AiDesignPanel, { ctx })
    ctx.ui.registerPanel('ai-design-panel', BoundPanel, {
      title: 'AI 디자인 어시스턴트',
      position: 'right',
      width: 340,
      defaultOpen: true,
    })
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('ai-design-panel')
  }
}
