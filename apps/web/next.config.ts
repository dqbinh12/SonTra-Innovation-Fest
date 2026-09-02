import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const strapiUrl = new URL(process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337');

const nextConfig: NextConfig = {
  // Self-hosted via Docker — see infra/docker-compose.yml.
  output: 'standalone',
  // fileURLToPath, not URL.pathname — the repo path contains a space, which
  // percent-encodes into a path Next cannot resolve.
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
  transpilePackages: ['@sif/shared'],
  images: {
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
