import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
  ignoreDuringBuilds: true, // skip eslint during docker build
  },
  typescript: {
  ignoreBuildErrors: true, // skip ts errors during docker build
  },
  output: "standalone",
  reactStrictMode: true, 
};

export default nextConfig;
