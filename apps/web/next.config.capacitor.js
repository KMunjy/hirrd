/**
 * next.config.capacitor.js
 * Used ONLY for Capacitor builds (mobile app store submissions)
 * Run: CAPACITOR_BUILD=1 npx next build
 *
 * For normal web/Vercel deployment, use next.config.js (no static export)
 */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor — required for iOS/Android WebView
  output: isCapacitorBuild ? 'export' : undefined,

  // Disable image optimization in static export (no server-side)
  images: isCapacitorBuild ? { unoptimized: true } : {},

  // Trailing slashes for Capacitor routing
  trailingSlash: isCapacitorBuild ? true : false,

  // Keep existing web config
  experimental: {},

  async headers() {
    if (isCapacitorBuild) return [];
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
