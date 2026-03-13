'use client'

import { EditorTopbar } from './EditorTopbar'
import { EditorToolbar } from './EditorToolbar'
import { EditorCanvas } from './EditorCanvas'
import { AssetPanel } from './AssetPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { ChatPanel } from './ChatPanel'
import { EditorStatusBar } from './EditorStatusBar'

interface EditorLayoutProps {
  projectId: string
}

export function EditorLayout({ projectId }: EditorLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorTopbar projectId={projectId} />

      {/* Main Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <EditorToolbar />

        {/* Center: Canvas + Asset Panel */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <EditorCanvas />
          <AssetPanel />
        </div>

        {/* Right: Properties Panel */}
        <PropertiesPanel />

        {/* Chat Panel (overlay) */}
        <ChatPanel />
      </div>

      {/* Status Bar */}
      <EditorStatusBar />
    </div>
  )
}
