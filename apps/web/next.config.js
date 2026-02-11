/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@life-quest/ui', '@life-quest/utils', '@life-quest/types'],
  experimental: {
    // Disable tracing to avoid OneDrive EPERM file lock errors
    instrumentationHook: false,
    // Allow server-side Node.js modules in API routes
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken', 'groq-sdk'],
  },
};
module.exports = nextConfig;
