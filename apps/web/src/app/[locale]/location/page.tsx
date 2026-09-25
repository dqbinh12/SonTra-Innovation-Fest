import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { LocationPage, Locale } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { directionsUrl, mapEmbedUrl, mapsUrl } from '@/lib/format';
import { LocationHero } from '@/components/location/location-hero';
import { CopyAddress } from '@/components/location/copy-address';
import { GettingHere } from '@/components/location/getting-here';

type Props = { params: Promise<{ locale: string }> };

const DEFAULT_MAP_EMBED_HTML =
  '<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d711.3421468911326!2d108.2238571197455!3d16.097853318784374!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142180fe0af6541%3A0x7286a33cefda8ba!2sWyndham%20Danang%20Golden%20Bay%20Hotel!5e0!3m2!1svi!2s!4v1790305495401!5m2!1svi!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>';

function getLocationPage(locale: string) {
  return strapiFetchOptional<LocationPage>('location-page', {
    // Explicit paths rather than `populate=*`: Strapi's wildcard stops at the
    // first level, so the SEO image below would come back missing.
    locale: locale as Locale,
    query: {
      'populate[venueMap]': 'true',
      'populate[transportOptions]': 'true',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['location-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'location' }),
    getLocationPage(locale),
  ]);

  return seoMetadata(page?.seo, {
    title: page?.heroTitle ?? t('title'),
    description: page?.heroSubtitle ?? page?.address ?? t('lead'),
    locale,
    href: '/location',
  });
}

/**
 * The Location page — three blocks, not five.
 *
 * The opening block answers the whole question on the first screen: address,
 * actions, and the map with the site plan behind the same switch. What is left
 * below it is detail a visitor goes looking for only after they have decided
 * to come — how to travel and park, and what the ground looks like.
 *
 * Everything but the address is optional in the CMS and disappears cleanly
 * when an editor has not filled it in; the address is required in the schema
 * and still falls back to a translated string.
 */
export default async function Location({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('location');
  const page = await getLocationPage(locale);

  const address = page?.address?.trim() || t('addressFallback');
  const embedHtml = page?.mapEmbedHtml?.trim() || DEFAULT_MAP_EMBED_HTML;
  const embedSrc = mapEmbedUrl(null, null, address, locale, embedHtml);

  return (
    <div className="page-deep dark text-foreground">
      <LocationHero
        title={page?.heroTitle ?? t('title')}
        lead={page?.heroSubtitle ?? t('lead')}
        venueName={page?.venueName}
        address={address}
        openingHours={page?.openingHours}
        embedSrc={embedSrc}
        venueMap={page?.venueMap}
        venueMapCaption={page?.venueMapCaption}
        mapsHref={mapsUrl(null, null, address)}
        directionsHref={directionsUrl(null, null, address)}
        copyButton={
          <CopyAddress value={address} label={t('copyAddress')} copiedLabel={t('addressCopied')} />
        }
      />

      <GettingHere
        options={page?.transportOptions ?? []}
        directions={page?.directions ?? null}
        parkingNotes={page?.parkingNotes ?? null}
      />
    </div>
  );
}
