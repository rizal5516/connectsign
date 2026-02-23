import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  webpack: (config) => {
    config.externals.push({ canvas: "commonjs canvas" });
    return config;
  },
};

export default nextConfig;
