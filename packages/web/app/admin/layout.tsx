import Link from 'next/link'
import { LayoutDashboard, Users } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users', label: '사용자 관리', icon: Users },
] as const

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r bg-[hsl(var(--card))]">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-bold">관리자</span>
        </div>
        <nav className="space-y-1 p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1">
        <header className="flex h-14 items-center border-b px-6">
          <h1 className="text-lg font-semibold">SpacePlanner Admin</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
