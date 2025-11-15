import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Empty turbopack config to acknowledge we're using Turbopack
  turbopack: {},
  // Use serverComponentsExternalPackages to exclude problematic packages
  serverExternalPackages: ['thread-stream'],
};

export default nextConfig;
