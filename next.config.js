/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // required for react-beautiful-dnd
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

module.exports = nextConfig
