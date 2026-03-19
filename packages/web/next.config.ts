import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Capacitor APK 빌드를 위한 정적 export
  output: 'export',
  trailingSlash: true,

  transpilePackages: ['@spaceplanner/engine'],
  images: {
    // 정적 export 시 Next.js 이미지 최적화 비활성화 (필수)
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
  turbopack: {},
  webpack: config => {
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      { canvas: 'canvas' },
    ]
    return config
  },
}

export default nextConfig
