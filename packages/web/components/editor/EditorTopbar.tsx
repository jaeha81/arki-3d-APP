'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  PanelBottom,
  Save,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/stores/editor-store'
import { ViewToggle } from './ViewToggle'
import { ShareDialog } from './ShareDialog'

interface EditorTopbarProps {
  projectId?: string
}

export function EditorTopbar({ projectId }: EditorTopbarProps) {
  const projectName = useEditorStore(s => s.projectName)
  const isDirty = useEditorStore(s => s.isDirty)
  const setProjectName = useEditorStore(s => s.setProjectName)
  const setDirty = useEditorStore(s => s.setDirty)
  const toggleChat = useEditorStore(s => s.toggleChat)
  const toggleAssetPanel = useEditorStore(s => s.toggleAssetPanel)
  const isChatOpen = useEditorStore(s => s.isChatOpen)
  const isAssetPanelOpen = useEditorStore(s => s.isAssetPanelOpen)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(projectName)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = useCallback(() => {
    // setDirty(true) → useAutosave 훅이 2초 debounce 후 자동 저장
    setDirty(true)
  }, [setDirty])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  const commitName = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== projectName) {
      setProjectName(trimmed)
      setDirty(true)
    }
    setIsEditing(false)
  }

  useEffect(() => {
    if (isEditing) inputRef.current?.select()
  }, [isEditing])

  return (
    <div className="flex h-12 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2">
      {/* 좌측 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName()
              if (e.key === 'Escape') {
                setEditValue(projectName)
                setIsEditing(false)
              }
            }}
            className="h-7 rounded border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 text-sm font-medium outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          />
        ) : (
          <button
            onClick={() => {
              setEditValue(projectName)
              setIsEditing(true)
            }}
            className="rounded px-2 py-1 text-sm font-medium hover:bg-[hsl(var(--accent))]"
          >
            {projectName}
            {isDirty && <span className="ml-1 text-[hsl(var(--muted-foreground))]">*</span>}
          </button>
        )}
      </div>

      {/* 중앙 */}
      <ViewToggle />

      {/* 우측 */}
      <div className="flex items-center gap-1">
        <Button
          variant={isAssetPanelOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={toggleAssetPanel}
          title="에셋 패널"
        >
          <PanelBottom className="h-4 w-4" />
        </Button>
        <Button
          variant={isChatOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={toggleChat}
          title="AI 채팅"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsShareOpen(true)}
          title="공유"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleSave}
          title="저장 (Ctrl+S)"
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>

      {projectId && (
        <ShareDialog
          projectId={projectId}
          open={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  )
}
