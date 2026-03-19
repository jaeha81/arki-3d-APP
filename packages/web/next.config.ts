import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Static export — Capacitor APK + Tauri 데스크탑 공용
  output: 'export',
  trailingSlash: true,
  reactStrictMode: false,

  transpilePackages: ['@spaceplanner/engine'],

  images: {
    unoptimized: true,
  },

  // Next.js 16 Turbopack (기본값) 명시
  turbopack: {},
}

export default nextConfig
