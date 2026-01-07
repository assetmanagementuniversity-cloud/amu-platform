/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@amu/shared'],
  // Enable standalone output for Docker deployment
  output: 'standalone',
  images: {
    domains: ['firebasestorage.googleapis.com'],
    // For standalone mode
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Temporarily ignore TypeScript and ESLint errors during build
  // TODO: Fix these errors and remove these options
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Handle useSearchParams without Suspense boundary
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
