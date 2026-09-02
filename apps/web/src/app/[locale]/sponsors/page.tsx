import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale, Sponsor, SponsorsPage } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout/page-header';
import { Section, EmptyState } from '@/components/layout/section';
import { StrapiImage } from '@/components/strapi-image';
import { SponsorForm } from '@/components/forms/sponsor-form';

type Props = { params: Promise<{ locale: string }> };

function getSponsorsPage(locale: string) {
  return strapiFetchOptional<SponsorsPage>('sponsors-page', {
    locale: locale as Locale,
    query: { 'populate[seo][populate]': 'ogImage' },
    tags: ['sponsors-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'sponsors' }),
    getSponsorsPage(locale),
  ]);

  return seoMetadata(page?.seo, { title: page?.title ?? t('title'), description: page?.intro });
}

export default async function Sponsors({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('sponsors');

  const [page, sponsors] = await Promise.all([
    getSponsorsPage(locale),
    strapiFetch<Sponsor[]>('sponsors', {
      locale: locale as Locale,
      query: {
        'sort[0]': 'order:asc',
        'sort[1]': 'name:asc',
        'pagination[pageSize]': 200,
        'populate[logo]': 'true',
      },
      tags: ['sponsors'],
    })
      .then((res) => res.data)
      .catch(() => [] as Sponsor[]),
  ]);

  return (
    <>
      <PageHeader title={page?.title ?? t('title')} lead={page?.intro} />

      <Section>
        {sponsors.length === 0 ? (
          <EmptyState>{t('empty')}</EmptyState>
        ) : (
          <ul className="flex flex-wrap items-center gap-10">
            {sponsors.map((sponsor) => {
              const logo = sponsor.logo ? (
                <StrapiImage
                  media={sponsor.logo}
                  className="max-h-16 w-auto object-contain"
                  sizes="240px"
                />
              ) : (
                <span className="text-lg font-semibold">{sponsor.name}</span>
              );

              return (
                <li key={sponsor.documentId}>
                  {sponsor.link ? (
                    <a
                      href={sponsor.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={sponsor.name}
                    >
                      {logo}
                    </a>
                  ) : (
                    logo
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>


      <Section title={t('becomeTitle')}>
        <p className="text-muted-foreground max-w-xl">
          {page?.applicationIntro ?? t('becomeIntro')}
        </p>
        <div className="mt-8">
          <SponsorForm />
        </div>
      </Section>
    </>
  );
}
