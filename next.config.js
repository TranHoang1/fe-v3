/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set basePath to /admin to match your URL structure
  basePath: '/admin',
  // Set assetPrefix to match the static files location
  assetPrefix: '/admin',
  reactStrictMode: true,
  output: 'export', // Static HTML export
  distDir: 'out', // Output directory
  trailingSlash: true, // Add trailing slashes for better compatibility
  images: {
    unoptimized: true, // Required for static export
  },
  // Removed experimental.appDir as it's now available by default in Next.js 13.5+
};

module.exports = nextConfig;
