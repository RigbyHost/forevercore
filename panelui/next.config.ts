import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: '/admin',
  output: 'standalone',
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
