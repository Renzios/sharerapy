import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["@supabase/supabase-js"],
  experimental: {},
  turbopack: {
    root: __dirname,
  },
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
