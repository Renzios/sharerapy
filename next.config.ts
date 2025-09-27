import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
