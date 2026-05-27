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
}

export default nextConfig
