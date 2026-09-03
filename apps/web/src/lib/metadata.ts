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
    // Page-level `openGraph` / `twitter` replace the layout's objects rather
    // than merging into them, so the fields the layout sets are repeated here.
    openGraph: {
      type: 'website',
      title,
      description,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
