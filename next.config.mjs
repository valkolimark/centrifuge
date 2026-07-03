import { securityHeaders } from './src/lib/security-headers.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Every canonical URL on this site uses a trailing slash (nav, brand, service
  // paths). Making that the framework default keeps legacy 301s a single hop.
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Vercel Blob storage (Cycle 1+). Token-gated; public read URLs.
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
