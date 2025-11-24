import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Your existing config file ---
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname, // This will now work
  serverExternalPackages: ["@supabase/supabase-js"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increase limit for photo uploads
    },
  },
  turbopack: {
    root: __dirname, // This will now work
  },
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
