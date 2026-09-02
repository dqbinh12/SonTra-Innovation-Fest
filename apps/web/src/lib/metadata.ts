import type { Metadata } from 'next';
import type { Seo } from '@sif/shared';
import { mediaUrl } from './media';

/**
 * Builds page metadata from the CMS `shared.seo` component, falling back to
 * the page's own title and lead copy. Scope item 7.0 asks for a unique title
 * and meta description on every page plus a correct social preview.
 */
export function seoMetadata(
  seo: Seo | null | undefined,
  fallback: { title: string; description?: string | null },
): Metadata {
  const title = seo?.metaTitle ?? fallback.title;
  const description = seo?.metaDescription ?? fallback.description ?? undefined;
  const image = mediaUrl(seo?.ogImage);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
