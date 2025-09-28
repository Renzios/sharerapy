import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    // Ensure server components work in tests
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

export default nextConfig;
