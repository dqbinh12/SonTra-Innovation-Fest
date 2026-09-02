import type { StrapiMedia } from '@sif/shared';

/**
 * Strapi returns relative URLs for locally-stored uploads. This runs in both
 * server and client components, so it uses the public env var only — the
 * server-only STRAPI_URL is not available in a client bundle.
 */
const PUBLIC_STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

export function mediaUrl(media: StrapiMedia | null | undefined): string | null {
  if (!media?.url) return null;
  return media.url.startsWith('http') ? media.url : `${PUBLIC_STRAPI_URL}${media.url}`;
}
