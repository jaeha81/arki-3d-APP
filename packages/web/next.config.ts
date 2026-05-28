import type { NextConfig } from 'next'

const isVercel = process.env.VERCEL === '1'

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: 'export', trailingSlash: true }),
  reactStrictMode: false,
  images: { unoptimized: true },

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    resolveAlias: {
      '@spaceplanner/engine': './lib/engine',
    },
  },

  experimental: {
    // drei/fiber named exports tree-shaking — 번들 크기 축소
    optimizePackageImports: ['@react-three/drei', '@react-three/fiber'],
  },
}

export default nextConfig
