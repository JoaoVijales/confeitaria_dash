import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@tailwindcss/postcss', 'tailwindcss'],
  /* config options here */
};

export default nextConfig;
