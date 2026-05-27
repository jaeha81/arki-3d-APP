'use client'

import Link from 'next/link'
import { Box, CheckCircle2 } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(220,28%,9%)] p-10 text-white lg:flex lg:w-[45%]">
        {/* Blueprint grid background */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bp-grid-r" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
            <pattern id="bp-grid-large-r" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="url(#bp-grid-r)" />
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="white" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bp-grid-large-r)" />
        </svg>

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Box className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">SpacePlanner</span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">
            14일 무료 체험
          </p>
          <p className="mb-8 text-3xl font-bold leading-snug tracking-tight text-white/90">
            지금 시작하면<br />14일간 무료입니다
          </p>
          <div className="space-y-3">
            {[
              '신용카드 없이 즉시 시작',
              '프로젝트 20개 무료 제공',
              '2D/3D 동시 편집 전부 이용 가능',
              '팀원 3명까지 무료 초대',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-white/70">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/30">
          © 2026 SpacePlanner. 건축·인테리어 전문가를 위한 B2B SaaS
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <Box className="h-6 w-6 text-[hsl(var(--primary))]" />
          <span className="text-lg font-bold">SpacePlanner</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">계정 만들기</h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              14일 무료 체험을 시작하세요. 신용카드 불필요.
            </p>
          </div>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium text-[hsl(var(--primary))] hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
