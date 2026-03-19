'use client'

import { EditorTopbar } from './EditorTopbar'
import { EditorToolbar } from './EditorToolbar'
import { EditorCanvas } from './EditorCanvas'
import { AssetPanel } from './AssetPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { ChatPanel } from './ChatPanel'
import { EditorStatusBar } from './EditorStatusBar'
import { PluginHost } from './plugin-host'
import { usePluginStore } from '@arki/plugin-core'

interface EditorLayoutProps {
  projectId: string
}

export function EditorLayout({ projectId }: EditorLayoutProps) {
  const { installedPlugins } = usePluginStore()
  const activePlugins = Array.from(installedPlugins.values()).filter(p => p.active)
  const leftPlugins = activePlugins.filter(p => p.manifest.capabilities.includes('asset-provider'))
  const rightPlugins = activePlugins.filter(p =>
    p.manifest.capabilities.includes('panel') || p.manifest.capabilities.includes('ai-agent')
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorTopbar projectId={projectId} />

      {/* Main Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <EditorToolbar />

        {/* Left Plugin Panels (e.g., furniture library) */}
        {leftPlugins.length > 0 && (
          <div className="w-64 shrink-0 overflow-y-auto border-r bg-[hsl(var(--background))]">
            {leftPlugins.map(p => (
              <PluginHost key={p.manifest.id} pluginId={p.manifest.id} />
            ))}
          </div>
        )}

        {/* Center: Canvas + Asset Panel */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <EditorCanvas />
          <AssetPanel />
        </div>

        {/* Right: Properties Panel */}
        <PropertiesPanel />

        {/* Right Plugin Panels (e.g., AI design, estimation) */}
        {rightPlugins.length > 0 && (
          <div className="w-72 shrink-0 overflow-y-auto border-l bg-[hsl(var(--background))]">
            {rightPlugins.map(p => (
              <PluginHost key={p.manifest.id} pluginId={p.manifest.id} />
            ))}
          </div>
        )}

        {/* Chat Panel (overlay) */}
        <ChatPanel />
      </div>

      {/* Status Bar */}
      <EditorStatusBar />
    </div>
  )
}
