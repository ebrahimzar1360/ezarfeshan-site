import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  // The Docker runtime stage copies a self-contained server carrying only the
  // modules actually reached, rather than the whole node_modules tree.
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // the OG font is read from disk at runtime; tracing must copy it into the
  // standalone output or /api/og throws ENOENT in production
  outputFileTracingIncludes: {
    "/api/og": ["./assets/fonts/**"],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
