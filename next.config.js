
/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  output: 'standalone',
  // Expose the public VAPID key to the client-side code.
  env: {
    NEXT_PUBLIC_FCM_VAPID_KEY: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
  },
   async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|gif|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  images: {
    // We now whitelist the final CDN domain and the specific Firebase domain.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'dreamydesk-fab2b.firebasestorage.app',
        pathname: '/v0/b/**',
      },
       {
        protocol: 'https-prod.dreamydesk.workers.dev',
        hostname: 'cdn.dreamydesk.co.in',
      },
      {
        protocol: 'https',
        hostname: 'dreamydesk-dev.vercel.app',
      },
    ],
  },
   async redirects() {
    return [
      {
        source: '/menu/privacy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/menu/terms',
        destination: '/terms',
        permanent: true,
      },
    ]
  },
   async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml/route',
      },
    ]
  },
};

module.exports = nextConfig;


