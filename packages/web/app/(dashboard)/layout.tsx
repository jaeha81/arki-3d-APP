'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isAuthenticated } = useAuthStore()
  // Zustand persist 수화(hydration) 완료 전까지 리다이렉트 차단
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!token && !isAuthenticated) {
      router.replace('/login')
    }
  }, [hydrated, token, isAuthenticated, router])

  if (!hydrated || (!token && !isAuthenticated)) {
    return null
  }

  return <div className="min-h-screen">{children}</div>
}
