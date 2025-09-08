/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed static export for MVP to allow dynamic routes
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@vercel/analytics', '@vercel/speed-insights']
  },
  // Analytics configuration
  analyticsId: process.env.VERCEL_ANALYTICS_ID,
  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          animations: {
            name: 'animations',
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          icons: {
            name: 'icons',
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            chunks: 'all',
            priority: 25,
          },
          ui: {
            name: 'ui-components',
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            chunks: 'all',
            priority: 20,
          }
        }
      }
    }
    return config
  }
}

module.exports = nextConfig