import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['mjml', 'mjml-core'],
  images: {
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
