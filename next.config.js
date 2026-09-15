/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DEMO_MODE: process.env.DEMO_MODE || 'true',
    NEXT_PUBLIC_MAP_API_KEY: process.env.NEXT_PUBLIC_MAP_API_KEY || '',
  }
};

module.exports = nextConfig;
