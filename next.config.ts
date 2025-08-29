import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
  experimental: {
    optimizePackageImports: ['framer-motion', 'lottie-react', '@phosphor-icons/web'],
    optimizeCss: true,
    webpackBuildWorker: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  output: 'standalone',
  // Modern browser targeting to reduce polyfills
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Target modern browsers only - use more specific targeting
      config.target = ['web', 'es2020'];
      
      // Remove unnecessary Node.js polyfills for client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  }
};

export default nextConfig;
