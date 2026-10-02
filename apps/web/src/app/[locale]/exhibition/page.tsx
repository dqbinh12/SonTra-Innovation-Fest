import type { Metadata } from 'next';
import { ExternalLink, Layers, MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Exhibitor, ExhibitionPage, Locale } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Container } from '@/components/layout/container';
import { FestivalBackdrop } from '@/components/layout/festival-backdrop';
import { ImmersivePageHero } from '@/components/layout/immersive-page-hero';
import { ScrollReveal } from '@/components/home/scroll-reveal';
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

  const sortedExhibitors = [...exhibitors].sort((a, b) => {
    const aHasOrder = typeof a.order === 'number';
    const bHasOrder = typeof b.order === 'number';

    if (aHasOrder && bHasOrder) {
      if (a.order !== b.order) {
        return (a.order as number) - (b.order as number);
      }
    } else if (aHasOrder) {
      return -1;
    } else if (bHasOrder) {
      return 1;
    }

    return (a.companyName ?? '').localeCompare(b.companyName ?? '', locale);
  });

  return (
    <div className="page-deep dark relative flex-1 overflow-x-clip text-foreground">
      <FestivalBackdrop variant="exhibition" />
      <ImmersivePageHero
        eyebrow={t('eyebrow')}
        title={page?.title ?? t('title')}
        lead={page?.intro ?? t('lead')}
      />

      {page?.floorPlan && (
        <section className="relative overflow-x-clip py-8 sm:py-10">
          <Container>
            <ScrollReveal direction="left" className="mb-5">
              <p className="text-xs font-bold tracking-[0.18em] text-brand-mint uppercase">
                {t('floorPlanEyebrow')}
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-3xl">
                {t('floorPlanTitle')}
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="focus" className="glass rounded-3xl border border-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-7">
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
            </ScrollReveal>
          </Container>
        </section>
      )}

      <section className="relative overflow-x-clip pt-6 pb-12 sm:pt-8 sm:pb-16">
        <Container>
          <ScrollReveal direction="left" className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-brand-cyan uppercase">
                {t('showcaseEyebrow')}
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-3xl">
                {t('exhibitorsTitle')}
              </h2>
            </div>
            {sortedExhibitors.length > 0 && (
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white/70 sm:block">
                {t('exhibitorCount', { count: sortedExhibitors.length })}
              </span>
            )}
          </ScrollReveal>

          {sortedExhibitors.length === 0 ? (
            <div className="glass rounded-3xl border border-white/10 p-12 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-brand-cyan/30 bg-brand-blue/20">
                <Layers className="size-6 text-brand-cyan" />
              </div>
              <p className="text-sm font-semibold text-white">{t('empty')}</p>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{t('emptyLead')}</p>
            </div>
          ) : (
            <ScrollReveal direction="up">
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {sortedExhibitors.map((exhibitor) => {
                const boothLabel = exhibitor.boothNumber?.trim();
                const isStation = Boolean(boothLabel && /^\d+$/.test(boothLabel));

                return (
                  <li key={exhibitor.documentId}>
                    <div className="glass lift group relative flex h-full flex-col justify-between rounded-2xl border border-white/10 p-4 sm:p-5 backdrop-blur-xl">
                      <div>
                        {/* 1. Metadata row: h-5 (20px), mb-2.5 (10px) */}
                        {isStation ? (
                          <div className="mb-2.5 flex h-5 items-center justify-between text-[10px] font-semibold tracking-[0.05em] uppercase">
                            <span className="text-brand-cyan/80">{t('booth')}</span>
                            <span className="font-mono text-xs font-bold text-brand-mint">
                              {(boothLabel ?? '').padStart(2, '0')}
                            </span>
                          </div>
                        ) : boothLabel ? (
                          <div className="mb-2.5 flex h-5 items-center">
                            <span className="inline-flex rounded-full border border-brand-mint/30 bg-brand-mint/10 px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-brand-mint uppercase">
                              {boothLabel}
                            </span>
                          </div>
                        ) : (
                          <div className="mb-2.5 h-5" aria-hidden="true" />
                        )}

                        {/* 2. Logo plate: h-13 (52px) mobile, h-14 (56px) desktop */}
                        {exhibitor.logo ? (
                          <div className="logo-plate flex h-[52px] w-full items-center justify-center overflow-hidden rounded-xl p-2 shadow-sm sm:h-14">
                            <StrapiImage
                              media={exhibitor.logo}
                              className="h-full max-h-[30px] max-w-full w-auto object-contain sm:max-h-8"
                              sizes="(min-width: 1280px) 250px, (min-width: 640px) 45vw, 100vw"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[52px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xs font-bold text-brand-cyan sm:h-14 sm:text-sm">
                            {exhibitor.companyName.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        {/* 3. Company name: mt-3 (12px), text-sm leading-snug */}
                        <h3 className="mt-3 text-xs font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-brand-cyan sm:text-sm">
                          {exhibitor.companyName}
                        </h3>

                        {exhibitor.category && (
                          <p className="mt-1 text-[11px] font-semibold tracking-wider text-brand-cyan/90 uppercase sm:text-xs">
                            {exhibitor.category}
                          </p>
                        )}

                        {exhibitor.description && (
                          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:mt-2 sm:text-xs">
                            {exhibitor.description}
                          </p>
                        )}
                      </div>

                      {/* 4. Footer link (if present) */}
                      {exhibitor.website && (
                        <div className="mt-3.5 border-t border-white/10 pt-2.5 sm:mt-4 sm:pt-3">
                          <a
                            href={exhibitor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-cyan transition-colors hover:text-white sm:text-xs"
                          >
                            <ExternalLink className="size-3" />
                            <span className="truncate">
                              {exhibitor.website.replace(/^https?:\/\/(www\.)?/, '')}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            </ScrollReveal>
          )}
        </Container>
      </section>
    </div>
  );
}
