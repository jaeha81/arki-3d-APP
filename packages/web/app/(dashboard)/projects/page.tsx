'use client'

import { Suspense, useState } from 'react'
import { Plus, FolderOpen, Clock, Layers } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog'
import { Button } from '@/components/ui/button'
import { ProjectGridSkeleton } from '@/components/ui/loading-skeleton'
import { useProjects } from '@/lib/hooks/use-projects'

function ProjectsContent() {
  const [createOpen, setCreateOpen] = useState(false)
  const { projectsQuery, deleteProject } = useProjects()

  const projects = projectsQuery.data?.data ?? []

  if (projectsQuery.isError) {
    return (
      <main className="mx-auto max w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader />
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-red-500">프로젝트를 불러올 수 없습니다</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            서버 연결에 실패했습니다. 로그인 세션이 만료됐거나 네트워크 오류일 수 있습니다.
          </p>
          <a href="/login" className="rounded-lg bg-[hsl(var(--primary))] px-5 py-2 text-sm font-medium text-white hover:opacity-90">
            다시 로그인
          </a>
        </div>
      </main>
    )
  }

  const recentCount = projects.filter((p: { updatedAt?: string; updated_at?: string }) => {
    const updatedAt = p.updatedAt ?? p.updated_at
    if (!updatedAt) return false
    const diff = Date.now() - new Date(updatedAt).getTime()
    return diff < 1000 * 60 * 60 * 24 * 7
  }).length

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">내 프로젝트</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              JH-3D로 2D 도면과 3D 시각화를 동시에 작업하세요
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 프로젝트
          </Button>
        </div>

        {/* Stats Bar */}
        {!projectsQuery.isLoading && projects.length > 0 && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <FolderOpen className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <div className="text-lg font-bold">{projects.length}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">전체 프로젝트</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <div className="text-lg font-bold">{recentCount}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">최근 7일 업데이트</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <Layers className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-lg font-bold">2D/3D</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">동시 편집 지원</div>
              </div>
            </div>
          </div>
        )}

        <ProjectGrid
          projects={projects}
          isLoading={projectsQuery.isLoading}
          onDelete={id => deleteProject.mutate(id)}
          onCreateClick={() => setCreateOpen(true)}
          emptyTitle="첫 번째 프로젝트를 만들어보세요"
          emptyDescription="JH-3D로 2D 도면과 3D 시각화를 동시에 작업하세요"
        />
      </main>
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

export default function ProjectsPage() {
  return (
    <>
      <DashboardHeader />
      <Suspense fallback={<ProjectGridSkeleton count={8} />}>
        <ProjectsContent />
      </Suspense>
    </>
  )
}
