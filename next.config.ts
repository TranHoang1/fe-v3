import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  basePath: '/luckydraw',
  assetPrefix: '/luckydraw'
};

export default nextConfig;
