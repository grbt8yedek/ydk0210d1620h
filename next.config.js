/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
    dangerouslyAllowSVG: true,
  },
  // CSP'yi localhost için gevşet
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:* https:; connect-src 'self' http://localhost:* https:; img-src 'self' data: blob: http://localhost:* https:;"
          },
        ],
      },
    ]
  },
  // Sadece gerekli yapılandırmaları tut
  swcMinify: true,
  poweredByHeader: false,
  // Geliştirme sırasında daha iyi hata ayıklama için
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
