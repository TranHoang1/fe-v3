import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  basePath: '/luckydraw/admin',
  assetPrefix: '/luckydraw/admin'
};

export default nextConfig;
