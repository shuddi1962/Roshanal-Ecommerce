import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'bcryptjs'],
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.insforge.app',
      },
      {
        protocol: 'https',
        hostname: 'roshanalglobal.com',
      },
    ],
    minimumCacheTTL: 60,
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
  // Redirect /admin → /admin/dashboard
  redirects: async () => [
    {
      source: '/admin',
      destination: '/admin/dashboard',
      permanent: false,
    },
    {
      source: '/vendor',
      destination: '/vendor/dashboard',
      permanent: false,
    },
    {
      source: '/account',
      destination: '/account/dashboard',
      permanent: false,
    },
  ],
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
