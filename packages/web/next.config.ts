import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@spaceplanner/engine'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
  turbopack: {},
  webpack: (config) => {
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      { canvas: 'canvas' },
    ]
    return config
  },
}

export default nextConfig
