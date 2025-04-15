/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  typescript: {
    // During deployment we'll type check with a separate command
    ignoreBuildErrors: true,
  },
  eslint: {
    // During deployment we'll lint with a separate command
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
