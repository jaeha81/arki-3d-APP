'use client'

import { Plus } from 'lucide-react'
import { ProjectCard } from './ProjectCard'
import { Card } from '@/components/ui/card'
import type { Project } from '@/types'

interface ProjectGridProps {
  projects: Project[]
  isLoading: boolean
  onDelete: (id: string) => void
  onCreateClick: () => void
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video animate-pulse bg-[hsl(var(--muted))]" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-[hsl(var(--muted))]" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-[hsl(var(--muted))]" />
      </div>
    </Card>
  )
}

export function ProjectGrid({ projects, isLoading, onDelete, onCreateClick }: ProjectGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <button
        onClick={onCreateClick}
        className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-[hsl(var(--border))] transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]/50"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
          <Plus className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">Create your first project</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Get started by creating a new design project
          </p>
        </div>
      </button>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  )
}
