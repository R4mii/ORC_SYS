/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['ocr-sys-u41198.vm.elestio.app'],
  },
  // Simplified configuration to ensure build works
  experimental: {
    esmExternals: 'loose',
  },
  // Ensure we're using the correct output
  output: 'standalone',
}

export default nextConfig
