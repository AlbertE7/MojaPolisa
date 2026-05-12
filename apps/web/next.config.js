/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aplikacja serwowana z roota (subdomena app.finvita.pl)
  // basePath/assetPrefix wyłączone — gdybyś chciał wrócić do /mojapolisa, odkomentuj:
  // basePath: '/mojapolisa',
  // assetPrefix: '/mojapolisa/',

  // Transpile workspace packages
  transpilePackages: ['@mojapolisa/shared', '@mojapolisa/ui'],

  images: {
    domains: ['finvita.pl'],
  },

  // Nagłówki bezpieczeństwa
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fcm.googleapis.com https://api.resend.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // Przekierowanie z /mojapolisa → /mojapolisa/ (trailing slash)
  trailingSlash: false,

  experimental: {
    serverActions: {
      allowedOrigins: ['app.finvita.pl', 'localhost:3000', 'finvita.pl'],
    },
  },
}

module.exports = nextConfig
