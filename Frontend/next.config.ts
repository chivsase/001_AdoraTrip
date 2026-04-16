import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Required for the Docker multi-stage build.
  // Produces a self-contained .next/standalone/ directory with a minimal
  // server.js — no node_modules needed at runtime (~300 MB vs ~1.5 GB).
  output: 'standalone',

  basePath: process.env.BASEPATH,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      }
    ]
  }
}

export default nextConfig
