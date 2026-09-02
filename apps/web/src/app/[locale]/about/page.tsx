import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AboutPage, Locale } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout/page-header';
import { Section, EmptyState } from '@/components/layout/section';
import { RichText } from '@/components/rich-text';
import { StrapiImage } from '@/components/strapi-image';

type Props = { params: Promise<{ locale: string }> };

function getAboutPage(locale: string) {
  return strapiFetchOptional<AboutPage>('about-page', {
    locale: locale as Locale,
    query: { 'populate[organizerLogo]': 'true', 'populate[seo][populate]': 'ogImage' },
    tags: ['about-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'about' }),
    getAboutPage(locale),
  ]);

  return seoMetadata(page?.seo, { title: t('title'), description: page?.mission });
}

export default async function About({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const page = await getAboutPage(locale);

  return (
    <>
      <PageHeader title={t('title')} />

      <Section>
        <div className="max-w-3xl">
          {page ? <RichText content={page.story} /> : <EmptyState>{t('title')}</EmptyState>}
        </div>
      </Section>

      {page?.mission && (
        <Section title={t('missionTitle')}>
          <p className="max-w-3xl text-lg">{page.mission}</p>
        </Section>
      )}

      {(page?.organizerName || page?.organizerLogo) && (
        <Section title={t('organizerTitle')}>
          <div className="flex items-center gap-6">
            {page.organizerLogo && (
              <StrapiImage
                media={page.organizerLogo}
                className="max-h-16 w-auto object-contain"
                sizes="240px"
              />
            )}
            {page.organizerName && <p className="font-semibold">{page.organizerName}</p>}
          </div>
        </Section>
      )}
    </>
  );
}
