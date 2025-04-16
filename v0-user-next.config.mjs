/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add environment variables that should be available to the client
  env: {
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  },
  // Expose environment variables to the browser
  publicRuntimeConfig: {
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  },
  // Increase serverless function timeout (only works on Vercel Pro plans)
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
}

export default nextConfig
