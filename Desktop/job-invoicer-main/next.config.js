/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimize build output
  compress: true,
  
  // Production optimizations
  poweredByHeader: false,
  
  // Image optimization (if you use next/image)
  images: {
    domains: [],
  },
}

module.exports = nextConfig