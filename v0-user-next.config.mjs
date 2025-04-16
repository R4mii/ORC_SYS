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
// Increase serverless function timeout (only works on Vercel Pro plans)
transpilePackages: ['@/lib/env.config.ts'], // Add transpilePackages to include lib/env.config.ts
}

export default nextConfig
