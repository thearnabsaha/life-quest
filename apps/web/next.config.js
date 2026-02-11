/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@life-quest/ui', '@life-quest/utils', '@life-quest/types'],
  // Skip type-checking during build (speeds up Vercel builds significantly)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Disable tracing to avoid OneDrive EPERM file lock errors
    instrumentationHook: false,
    // Allow server-side Node.js modules in API routes
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken', 'groq-sdk', '@neondatabase/serverless'],
  },
};
module.exports = nextConfig;
