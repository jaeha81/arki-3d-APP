'use client'

import { Trash2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEditorStore } from '@/lib/stores/editor-store'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
        <svg
          className="h-6 w-6 text-[hsl(var(--muted-foreground))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
        아무것도 선택하지 않았습니다
      </p>
      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        요소를 클릭하여 속성을 편집하세요
      </p>
    </div>
  )
}

function PropertyGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[hsl(var(--border))] px-3 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      {children}
    </div>
  )
}

function SelectedProperties() {
  const selection = useEditorStore(s => s.selection)
  const typeLabelMap: Record<string, string> = {
    wall: '벽',
    door: '문',
    window: '창문',
    furniture: '가구',
    room: '방',
  }
  const typeLabel = selection.type ? typeLabelMap[selection.type] ?? selection.type : ''

  return (
    <>
      {/* 선택된 요소 헤더 */}
      <div className="border-b border-[hsl(var(--border))] px-3 py-2">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">선택됨</p>
        <p className="text-sm font-medium">{typeLabel} ({selection.id})</p>
      </div>

      {/* 위치 */}
      <PropertyGroup label="위치">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">X</Label>
            <Input disabled placeholder="0" className="mt-0.5 h-7 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">Y</Label>
            <Input disabled placeholder="0" className="mt-0.5 h-7 text-xs" />
          </div>
        </div>
      </PropertyGroup>

      {/* 크기 */}
      <PropertyGroup label="크기">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-[10px]">W</Label>
            <Input disabled placeholder="0" className="mt-0.5 h-7 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">H</Label>
            <Input disabled placeholder="0" className="mt-0.5 h-7 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">깊이</Label>
            <Input disabled placeholder="0" className="mt-0.5 h-7 text-xs" />
          </div>
        </div>
      </PropertyGroup>

      {/* 회전 */}
      <PropertyGroup label="회전">
        <div className="flex items-center gap-2">
          <RotateCw className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          <Input disabled type="range" min="0" max="360" defaultValue="0" className="h-7 flex-1" />
          <span className="w-8 text-right text-xs text-[hsl(var(--muted-foreground))]">0°</span>
        </div>
      </PropertyGroup>

      {/* 재질 */}
      <PropertyGroup label="재질">
        <select
          disabled
          className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 py-1.5 text-xs text-[hsl(var(--foreground))] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option>마감재 선택...</option>
        </select>
      </PropertyGroup>

      {/* 삭제 */}
      <div className="px-3 py-3">
        <Button variant="destructive" size="sm" className="w-full text-xs" disabled>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          삭제
        </Button>
      </div>
    </>
  )
}

export function PropertiesPanel() {
  const selection = useEditorStore(s => s.selection)

  return (
    <div className="flex w-72 flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* 헤더 */}
      <div className="border-b border-[hsl(var(--border))] px-3 py-2">
        <h3 className="text-sm font-semibold">속성</h3>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {selection.type === null ? <EmptyState /> : <SelectedProperties />}
      </div>
    </div>
  )
}
