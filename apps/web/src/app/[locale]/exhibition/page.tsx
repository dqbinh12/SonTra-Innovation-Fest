import type { Metadata } from 'next';
import { ExternalLink, Layers, MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Exhibitor, ExhibitionPage, Locale } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Container } from '@/components/layout/container';
import { FestivalBackdrop } from '@/components/layout/festival-backdrop';
import { ImmersivePageHero } from '@/components/layout/immersive-page-hero';
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
  return seoMetadata(page?.seo, {
    title: page?.title ?? t('title'),
    description: page?.intro,
    locale,
    href: '/exhibition',
  });
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
        'sort[0]': 'order:asc',
        'sort[1]': 'companyName:asc',
        'pagination[pageSize]': 200,
        'populate[logo]': 'true',
      },
      tags: ['exhibitors'],
    })
      .then((res) => res.data)
      .catch(() => [] as Exhibitor[]),
  ]);

  return (
    <div className="page-deep dark relative flex-1 overflow-hidden text-foreground">
      <FestivalBackdrop variant="exhibition" />
      <ImmersivePageHero
        eyebrow={t('eyebrow')}
        title={page?.title ?? t('title')}
        lead={page?.intro ?? t('lead')}
      />

      {page?.floorPlan && (
        <section className="relative py-8 sm:py-10">
          <Container>
            <div className="mb-5">
              <p className="text-xs font-bold tracking-[0.18em] text-brand-mint uppercase">
                {t('floorPlanEyebrow')}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {t('floorPlanTitle')}
              </h2>
            </div>

            <div className="glass rounded-3xl border border-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-7">
              <figure className="relative">
                <StrapiImage
                  media={page.floorPlan}
                  className="w-full rounded-2xl border border-white/10 bg-brand-navy/60 object-contain shadow-inner"
                  sizes="(min-width: 1024px) 1024px, 100vw"
                />
                {page.floorPlanCaption && (
                  <figcaption className="mt-3 flex items-center gap-2 text-xs font-medium text-white/70 sm:text-sm">
                    <MapPin className="size-3.5 shrink-0 text-brand-cyan" />
                    <span>{page.floorPlanCaption}</span>
                  </figcaption>
                )}
              </figure>
            </div>
          </Container>
        </section>
      )}

      <section className="relative pt-6 pb-12 sm:pt-8 sm:pb-16">
        <Container>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-brand-cyan uppercase">
                {t('showcaseEyebrow')}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {t('exhibitorsTitle')}
              </h2>
            </div>
            {exhibitors.length > 0 && (
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white/70 sm:block">
                {t('exhibitorCount', { count: exhibitors.length })}
              </span>
            )}
          </div>

          {exhibitors.length === 0 ? (
            <div className="glass rounded-3xl border border-white/10 p-12 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-brand-cyan/30 bg-brand-blue/20">
                <Layers className="size-6 text-brand-cyan" />
              </div>
              <p className="text-base font-semibold text-white">{t('empty')}</p>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{t('emptyLead')}</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {exhibitors.map((exhibitor) => (
                <li
                  key={exhibitor.documentId}
                  className="glass lift group relative flex flex-col justify-between rounded-2xl border border-white/10 p-5 backdrop-blur-xl"
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      {exhibitor.logo ? (
                        <div className="logo-plate flex h-12 w-24 shrink-0 items-center justify-center rounded-xl p-1.5 shadow-sm">
                          <StrapiImage
                            media={exhibitor.logo}
                            className="max-h-8 w-auto object-contain"
                            sizes="100px"
                          />
                        </div>
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xs font-bold text-brand-cyan">
                          {exhibitor.companyName.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      {exhibitor.boothNumber && (
                        <div className="inline-flex items-center gap-1 rounded-full border border-brand-mint/30 bg-brand-mint/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-brand-mint">
                          <span>{t('booth')}</span>
                          <span className="text-white font-bold">{exhibitor.boothNumber}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold tracking-tight text-white transition-colors group-hover:text-brand-cyan">
                      {exhibitor.companyName}
                    </h3>

                    {exhibitor.category && (
                      <p className="mt-0.5 text-xs font-semibold text-brand-cyan/90 uppercase tracking-wider">
                        {exhibitor.category}
                      </p>
                    )}

                    {exhibitor.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {exhibitor.description}
                      </p>
                    )}
                  </div>

                  {exhibitor.website && (
                    <div className="mt-4 border-t border-white/10 pt-3">
                      <a
                        href={exhibitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cyan transition-colors hover:text-white"
                      >
                        <ExternalLink className="size-3" />
                        <span className="truncate">
                          {exhibitor.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </span>
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </div>
  );
}
