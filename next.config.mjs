/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:5000'
    return [
      { source: '/api/categories', destination: `${apiBaseUrl}/api/categories` },
      { source: '/api/products', destination: `${apiBaseUrl}/api/products` },
      { source: '/api/media/:path*', destination: `${apiBaseUrl}/api/media/:path*` },
      { source: '/api/contact', destination: `${apiBaseUrl}/api/contact` },
    ]
  },
}

export default nextConfig
