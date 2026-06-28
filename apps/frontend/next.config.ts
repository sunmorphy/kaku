import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rahmadwin.art',
        port: '',
        pathname: '/**',
      },
      {
        // Backend image host
        protocol: "https",
        hostname: "api.rahmadwin.art",
      },
      {
        // Allow any remaining CDN / object-storage URLs
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

export default nextConfig;
