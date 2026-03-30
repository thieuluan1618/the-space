/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // Supabase Storage (primary image source)
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Catch-all for any other HTTPS image source
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
