/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker
  output: 'standalone',
  
  // 프로덕션 최적화
  reactStrictMode: true,
  swcMinify: true,
  
  // 이미지 최적화
  images: {
    domains: ['localhost', 'streamlyai.store', 'd2dfhn6tge51j0.cloudfront.net'],  // ⚠️ 실제 도메인으로 변경
    formats: ['image/avif', 'image/webp'],
  },
  
  // 환경변수
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://streamlyai.store',
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
