import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MapPin } from 'lucide-react';
import type { LocationPage, Locale } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { mapsUrl } from '@/lib/format';
import { PageHeader } from '@/components/layout/page-header';
import { Section, EmptyState } from '@/components/layout/section';
import { RichText } from '@/components/rich-text';
import { StrapiImage } from '@/components/strapi-image';

type Props = { params: Promise<{ locale: string }> };

function getLocationPage(locale: string) {
  return strapiFetchOptional<LocationPage>('location-page', {
    locale: locale as Locale,
    query: { 'populate[images]': 'true', 'populate[seo][populate]': 'ogImage' },
    tags: ['location-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'location' }),
    getLocationPage(locale),
  ]);

  return seoMetadata(page?.seo, { title: t('title'), description: page?.address });
}

export default async function Location({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('location');
  const page = await getLocationPage(locale);

  if (!page) {
    return (
      <>
        <PageHeader title={t('title')} />
        <Section>
          <EmptyState>{t('address')}</EmptyState>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('title')} />

      <Section title={t('address')}>
        <address className="text-lg not-italic whitespace-pre-line">{page.address}</address>
        <a
          href={mapsUrl(page.mapLatitude, page.mapLongitude, page.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium"
        >
          <MapPin className="size-4" />
          {t('openInMaps')}
        </a>
      </Section>

      {page.directions && (
        <Section title={t('directions')}>
          <div className="max-w-3xl">
            <RichText content={page.directions} />
          </div>
        </Section>
      )}

      {page.parkingNotes && (
        <Section title={t('parking')}>
          <div className="max-w-3xl">
            <RichText content={page.parkingNotes} />
          </div>
        </Section>
      )}

      {page.images.length > 0 && (
        <Section>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page.images.map((image) => (
              <li key={image.id}>
                <StrapiImage
                  media={image}
                  className="rounded-lg"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
