import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@hirrd/ui', '@hirrd/db'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', 'hirrd.com'] },
  },
}

export default nextConfig
