/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental features that require canary version
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;