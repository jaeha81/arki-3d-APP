'use client'

import Link from 'next/link'
import { Box } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/projects" className="flex items-center gap-2">
            <Box className="h-6 w-6 text-[hsl(var(--primary))]" />
            <span className="text-lg font-bold">SpacePlanner</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              href="/projects"
              className="font-medium text-[hsl(var(--foreground))] transition-colors hover:text-[hsl(var(--primary))]"
            >
              Projects
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
