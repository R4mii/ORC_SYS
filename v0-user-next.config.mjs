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
  // Increase serverless function timeout (only works on Vercel Pro plans)
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  // Add a fallback for OCR processing
  async rewrites() {
    return [
      {
        source: '/api/ocr-fallback',
        destination: process.env.N8N_WEBHOOK_URL || 'https://ocr-sys-u41198.vm.elestio.app/webhook/upload',
      },
    ]
  }
}

export default nextConfig
