/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'assets.coingecko.com'], // Add 'assets.coingecko.com' here
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://192.168.18.107:8080/api/v1/:path*',
      },
    ]
  },
}

export default nextConfig
