/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'assets.coingecko.com',
      's2.coinmarketcap.com',
      'images.pexels.com',
      'ui-avatars.com',
      'coin-images.coingecko.com'
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'X-DNS-Prefetch-Control', value: 'false' },
      ],
    },
  ],
};

module.exports = nextConfig;
