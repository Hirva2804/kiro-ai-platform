/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // required for react-beautiful-dnd
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
