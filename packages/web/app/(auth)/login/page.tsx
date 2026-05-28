'use client'

import Link from 'next/link'
import { Box, Layers, BarChart3 } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(220,28%,9%)] p-10 text-white lg:flex lg:w-[45%]">
        {/* Blueprint grid background */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
            <pattern id="bp-grid-large" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="url(#bp-grid)" />
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="white" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bp-grid-large)" />
        </svg>

        {/* Isometric floor plan illustration */}
        <svg
          className="absolute bottom-0 right-0 h-72 w-72 translate-x-8 translate-y-8 opacity-20"
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="60,160 150,210 240,160 150,110" fill="none" stroke="white" strokeWidth="1.5" />
          <polygon points="60,80 60,160 150,210 150,130" fill="none" stroke="white" strokeWidth="1" />
          <polygon points="240,80 240,160 150,210 150,130" fill="none" stroke="white" strokeWidth="1" />
          <line x1="60" y1="80" x2="150" y2="130" stroke="white" strokeWidth="1" />
          <line x1="240" y1="80" x2="150" y2="130" stroke="white" strokeWidth="1" />
          <line x1="60" y1="80" x2="240" y2="80" stroke="white" strokeWidth="1" strokeDasharray="6 3" />
          <rect x="90" y="130" width="35" height="18" rx="2" fill="white" opacity="0.4" />
          <rect x="170" y="145" width="28" height="18" rx="2" fill="white" opacity="0.3" />
        </svg>

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Box className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">JH-3D</span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <p className="mb-6 text-3xl font-bold leading-snug tracking-tight text-white/90">
            설계의 새로운 기준을<br />경험해보세요
          </p>
          <div className="space-y-3">
            {[
              { icon: Layers, text: '2D 도면과 3D 뷰 실시간 동기화' },
              { icon: BarChart3, text: '자재·시공 견적 자동 산출' },
              { icon: Box, text: '클라이언트 3D 공유 링크' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-white/60">
                <Icon className="h-4 w-4 text-white/40" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <p className="relative text-xs text-white/30">
          © 2026 JH-3D. 건축·인테리어 전문가를 위한 B2B SaaS
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <Box className="h-6 w-6 text-[hsl(var(--primary))]" />
          <span className="text-lg font-bold">JH-3D</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              계정에 로그인하여 작업을 이어하세요
            </p>
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            계정이 없으신가요?{' '}
            <Link href="/register" className="font-medium text-[hsl(var(--primary))] hover:underline">
              무료로 시작하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
