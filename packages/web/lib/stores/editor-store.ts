import { create } from 'zustand'
import type { ViewMode, EditorTool, EditorSelection } from '@/types/editor'
import type { FurnishVariant } from '@/types/chat'

interface EditorState {
  viewMode: ViewMode
  activeTool: EditorTool
  selection: EditorSelection
  zoom: number
  panX: number
  panY: number
  isChatOpen: boolean
  isAssetPanelOpen: boolean
  activeAssetCategoryId: string | null
  projectName: string
  isDirty: boolean
  showGrid: boolean
  showDimensions: boolean
  pendingVariants: FurnishVariant[]
  selectedVariantIndex: number | null

  setViewMode: (mode: ViewMode) => void
  setActiveTool: (tool: EditorTool) => void
  setSelection: (sel: EditorSelection) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  toggleChat: () => void
  toggleAssetPanel: () => void
  setActiveAssetCategory: (id: string | null) => void
  setProjectName: (name: string) => void
  setDirty: (dirty: boolean) => void
  toggleGrid: () => void
  toggleDimensions: () => void
  setPendingVariants: (variants: FurnishVariant[]) => void
  setSelectedVariant: (index: number | null) => void
  applyVariant: (index: number) => void
}

export const useEditorStore = create<EditorState>()(set => ({
  viewMode: '2d',
  activeTool: 'select',
  selection: { type: null, id: null },
  zoom: 1,
  panX: 0,
  panY: 0,
  isChatOpen: false,
  isAssetPanelOpen: true,
  activeAssetCategoryId: null,
  projectName: '새 프로젝트',
  isDirty: false,
  showGrid: true,
  showDimensions: true,
  pendingVariants: [],
  selectedVariantIndex: null,

  setViewMode: mode => set({ viewMode: mode }),
  setActiveTool: tool => set({ activeTool: tool }),
  setSelection: sel => set({ selection: sel }),
  setZoom: zoom => set({ zoom }),
  setPan: (panX, panY) => set({ panX, panY }),
  toggleChat: () => set(s => ({ isChatOpen: !s.isChatOpen })),
  toggleAssetPanel: () => set(s => ({ isAssetPanelOpen: !s.isAssetPanelOpen })),
  setActiveAssetCategory: id => set({ activeAssetCategoryId: id }),
  setProjectName: name => set({ projectName: name }),
  setDirty: isDirty => set({ isDirty }),
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
  toggleDimensions: () => set(s => ({ showDimensions: !s.showDimensions })),
  setPendingVariants: variants => set({ pendingVariants: variants, selectedVariantIndex: null }),
  setSelectedVariant: index => set({ selectedVariantIndex: index }),
  applyVariant: index =>
    set(s => {
      const variant = s.pendingVariants[index]
      if (variant) {
        // TODO: Sprint 6 — 실제 씬에 오브젝트 배치
        console.log('[applyVariant]', variant.name, variant.objects.length, 'objects')
      }
      return { selectedVariantIndex: index, isDirty: true }
    }),
}))
