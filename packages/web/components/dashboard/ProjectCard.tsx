'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const formattedDate = new Date(project.updatedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card
      className="group relative overflow-hidden transition-shadow hover:shadow-md"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <Link href={`/editor/${project.id}`}>
        <div className="relative aspect-video bg-[hsl(var(--muted))]">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="relative h-full w-full overflow-hidden bg-[hsl(var(--muted))]/60">
              {/* Blueprint grid */}
              <svg className="absolute inset-0 h-full w-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`grid-${project.id}`} width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${project.id})`} />
              </svg>
              {/* Simple floor plan lines */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet">
                <rect x="30" y="15" width="100" height="70" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.5" />
                <line x1="30" y1="55" x2="90" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.4" />
                <line x1="90" y1="15" x2="90" y2="85" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.4" />
                <path d="M 90 55 A 18 18 0 0 1 72 55" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.5" strokeDasharray="3 2" />
              </svg>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{project.name}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{formattedDate}</p>
          </div>
          <div className={`transition-opacity ${showMenu ? 'opacity-100' : 'opacity-0'}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[hsl(var(--destructive))]"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
