import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Exhibitor, ExhibitionPage, Locale } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout/page-header';
import { Section, EmptyState } from '@/components/layout/section';
import { StrapiImage } from '@/components/strapi-image';

type Props = { params: Promise<{ locale: string }> };

function getExhibitionPage(locale: string) {
  return strapiFetchOptional<ExhibitionPage>('exhibition-page', {
    locale: locale as Locale,
    query: { 'populate[floorPlan]': 'true', 'populate[seo][populate]': 'ogImage' },
    tags: ['exhibition-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'exhibition' }),
    getExhibitionPage(locale),
  ]);

  return seoMetadata(page?.seo, { title: page?.title ?? t('title'), description: page?.intro });
}

export default async function Exhibition({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('exhibition');

  const [page, exhibitors] = await Promise.all([
    getExhibitionPage(locale),
    strapiFetch<Exhibitor[]>('exhibitors', {
      locale: locale as Locale,
      query: {
        'sort[0]': 'companyName:asc',
        'pagination[pageSize]': 200,
        'populate[logo]': 'true',
      },
      tags: ['exhibitors'],
    })
      .then((res) => res.data)
      .catch(() => [] as Exhibitor[]),
  ]);

  return (
    <>
      <PageHeader title={page?.title ?? t('title')} lead={page?.intro} />

      {page?.floorPlan && (
        <Section title={t('floorPlanTitle')}>
          <figure>
            <StrapiImage
              media={page.floorPlan}
              className="border-border rounded-lg border"
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
            {page.floorPlanCaption && (
              <figcaption className="text-muted-foreground mt-3 text-sm">
                {page.floorPlanCaption}
              </figcaption>
            )}
          </figure>
        </Section>
      )}

      <Section title={t('exhibitorsTitle')}>
        {exhibitors.length === 0 ? (
          <EmptyState>{t('empty')}</EmptyState>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exhibitors.map((exhibitor) => (
              <li
                key={exhibitor.documentId}
                className="border-border flex flex-col rounded-lg border p-6"
              >
                {exhibitor.logo && (
                  <StrapiImage
                    media={exhibitor.logo}
                    className="mb-4 max-h-12 w-auto object-contain"
                    sizes="200px"
                  />
                )}
                <h3 className="font-semibold">{exhibitor.companyName}</h3>
                <dl className="text-muted-foreground mt-2 space-y-1 text-sm">
                  {exhibitor.boothNumber && (
                    <div className="flex gap-1">
                      <dt>{t('booth')}:</dt>
                      <dd>{exhibitor.boothNumber}</dd>
                    </div>
                  )}
                  {exhibitor.category && (
                    <div className="flex gap-1">
                      <dt>{t('category')}:</dt>
                      <dd>{exhibitor.category}</dd>
                    </div>
                  )}
                </dl>
                {exhibitor.description && (
                  <p className="text-muted-foreground mt-3 text-sm">{exhibitor.description}</p>
                )}
                {exhibitor.website && (
                  <a
                    href={exhibitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-4 text-sm font-medium"
                  >
                    {exhibitor.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
