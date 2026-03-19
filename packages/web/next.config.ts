import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const internalHost = process.env.TAURI_DEV_HOST ?? 'localhost'

const nextConfig: NextConfig = {
  // Static export for Tauri desktop app
  output: 'export',
  trailingSlash: true,

  // Fix asset prefix in dev (Tauri dev server ≠ Next.js server)
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,

  // Disable strict mode to prevent double-mount issues with Three.js canvas
  reactStrictMode: false,

  transpilePackages: ['@spaceplanner/engine'],

  images: {
    // Required for static export
    unoptimized: true,
  },

  webpack: config => {
    // Prevent canvas module bundling (Three.js uses browser canvas)
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      { canvas: 'canvas' },
    ]
    return config
  },
}

export default nextConfig
