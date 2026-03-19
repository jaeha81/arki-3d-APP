'use client'

import { Suspense, useState } from 'react'
import { Plus } from 'lucide-react'
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

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Manage your interior design projects
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        <ProjectGrid
          projects={projects}
          isLoading={projectsQuery.isLoading}
          onDelete={id => deleteProject.mutate(id)}
          onCreateClick={() => setCreateOpen(true)}
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
