import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Seo } from '@sif/shared';
import { getPathname } from '@/i18n/navigation';
import { mediaUrl } from './media';

/**
 * Builds page metadata from the CMS `shared.seo` component, falling back to
 * the page's own title and lead copy. Scope item 7.0 asks for a unique title
 * and meta description on every page plus a correct social preview.
 *
 * Next replaces the layout's `openGraph` / `twitter` objects with the page's
 * rather than merging them, so everything a crawler needs is rebuilt here.
 * Zalo in particular treats `og:url` and `og:site_name` as required and drops
 * the whole card — image included — when either is missing; Facebook and X are
 * more forgiving, which is why a page can preview correctly there and not on
 * Zalo.
 */
export async function seoMetadata(
  seo: Seo | null | undefined,
  fallback: {
    title: string;
    description?: string | null;
    /** Locale segment, e.g. 'vi'. */
    locale: string;
    /**
     * The *internal* (English) route key, e.g. '/about'. It is run through
     * next-intl so the canonical and og:url carry the localised path the
     * visitor actually lands on — '/vi/ve-chung-toi', not '/vi/about', which
     * only 307-redirects there.
     */
    href: Parameters<typeof getPathname>[0]['href'];
  },
): Promise<Metadata> {
  const t = await getTranslations({ locale: fallback.locale, namespace: 'site' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const title = seo?.metaTitle ?? fallback.title;
  const description = seo?.metaDescription ?? fallback.description ?? undefined;
  const image = mediaUrl(seo?.ogImage);
  const url =
    siteUrl +
    getPathname({ href: fallback.href, locale: fallback.locale as 'en' | 'vi' });

  // Real dimensions from Strapi, not assumed ones: they save the crawler a
  // round trip to measure the file, and Zalo renders a large card rather than a
  // thumbnail once it knows the ratio. Declaring a size the file does not have
  // would be worse than declaring none.
  const images = image
    ? [
        {
          url: image,
          width: seo?.ogImage?.width ?? undefined,
          height: seo?.ogImage?.height ?? undefined,
          alt: seo?.ogImage?.alternativeText ?? title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: t('name'),
      locale: fallback.locale === 'vi' ? 'vi_VN' : 'en_US',
      title,
      description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
