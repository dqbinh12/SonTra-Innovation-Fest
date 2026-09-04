import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const strapiUrl = new URL(process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337');

const nextConfig: NextConfig = {
  // Self-hosted via Docker — see infra/docker-compose.yml.
  output: 'standalone',
  // `next dev` blocks cross-origin requests to /_next/* (chunks, HMR socket).
  // Tunnelling the dev server (serveo, ngrok, Cloudflare) serves the app from a
  // host that isn't localhost, so lazy route chunks 404 and client navigation —
  // e.g. the language switcher — silently dies. Dev-only; ignored by `next build`.
  allowedDevOrigins: [
    '*.serveousercontent.com',
    '*.serveo.net',
    '*.ngrok-free.app',
    '*.trycloudflare.com',
  ],
  // fileURLToPath, not URL.pathname — the repo path contains a space, which
  // percent-encodes into a path Next cannot resolve.
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
  transpilePackages: ['@sif/shared'],
  images: {
    // Next 16 refuses to optimize images whose host resolves to a private IP,
    // as SSRF protection. In development Strapi is on localhost, which trips
    // it — so allow it in dev only. In production NEXT_PUBLIC_STRAPI_URL is the
    // public CMS domain and this stays off.
    //
    // Deploying with a private NEXT_PUBLIC_STRAPI_URL (an internal hostname or
    // LAN address) would hit the same block. That variable must be the URL a
    // browser can reach; the server-side STRAPI_URL is the internal one.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: strapiUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: strapiUrl.hostname,
        port: strapiUrl.port,
        pathname: '/uploads/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
