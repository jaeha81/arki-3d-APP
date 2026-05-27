'use client'

import dynamic from 'next/dynamic'

const HeroScene3D = dynamic(
  () => import('./HeroScene3D').then(m => ({ default: m.HeroScene3D })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-[hsl(var(--muted))]/30 rounded-md" />
    ),
  }
)

export function HeroScene3DLoader() {
  return <HeroScene3D />
}
