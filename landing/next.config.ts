import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_lp' : undefined,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
