import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next 15 key for native server packages
  serverExternalPackages: ['sqlite3', 'sequelize'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

export default nextConfig
