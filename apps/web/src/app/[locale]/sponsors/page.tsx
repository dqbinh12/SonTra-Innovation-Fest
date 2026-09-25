import type { Metadata } from 'next';
import { ArrowUpRight, Handshake } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale, Sponsor, SponsorsPage } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Container } from '@/components/layout/container';
import { FestivalBackdrop } from '@/components/layout/festival-backdrop';
import { ImmersivePageHero } from '@/components/layout/immersive-page-hero';
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
  return seoMetadata(page?.seo, {
    title: page?.title ?? t('title'),
    description: page?.intro,
    locale,
    href: '/sponsors',
  });
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
    <div className="page-deep dark relative flex-1 overflow-hidden text-foreground">
      <FestivalBackdrop variant="sponsors" />
      <ImmersivePageHero
        eyebrow={t('eyebrow')}
        title={page?.title ?? t('title')}
        lead={page?.intro ?? t('lead')}
      />

      <section className="relative py-8 sm:py-10">
        <Container>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-brand-cyan uppercase">
                {t('networkEyebrow')}
              </p>
              <h2 className="mt-3 text-lg font-bold tracking-tight sm:text-3xl">
                {t('networkTitle')}
              </h2>
            </div>
            <span className="hidden font-mono text-xs text-muted-foreground sm:block">
              {t('partnerCount', { count: sponsors.length })}
            </span>
          </div>

          {sponsors.length === 0 ? (
            <div className="glass rounded-3xl border border-white/10 p-10 text-center text-muted-foreground">
              {t('empty')}
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sponsors.map((sponsor) => (
                <li key={sponsor.documentId}>
                  <a
                    href={sponsor.link || undefined}
                    target={sponsor.link ? '_blank' : undefined}
                    rel={sponsor.link ? 'noopener noreferrer' : undefined}
                    className={`group logo-plate relative flex min-h-28 sm:min-h-32 items-center justify-center rounded-2xl p-5 sm:p-6 transition-all duration-300 ${sponsor.link ? 'hover:-translate-y-1 hover:shadow-xl' : 'pointer-events-none'}`}
                    aria-label={sponsor.name}
                  >
                    {sponsor.logo ? (
                      <StrapiImage
                        media={sponsor.logo}
                        className="max-h-14 sm:max-h-16 w-auto max-w-[11rem] object-contain transition-transform duration-300 group-hover:scale-105"
                        sizes="240px"
                      />
                    ) : (
                      <span className="text-center text-base font-bold text-brand-navy">
                        {sponsor.name}
                      </span>
                    )}
                    {sponsor.link && (
                      <ArrowUpRight className="absolute top-3 right-3 size-3.5 text-brand-blue opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="band-inset relative py-8 sm:py-10">
        <Container className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:gap-10">
          <div className="lg:pt-6">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-brand-mint/30 bg-brand-mint/10">
              <Handshake className="size-6 text-brand-mint" />
            </div>
            <p className="mt-6 text-xs font-bold tracking-[0.18em] text-brand-mint uppercase">
              {t('joinEyebrow')}
            </p>
            <h2 className="mt-3 text-lg font-bold tracking-tight sm:text-3xl">
              {t('becomeTitle')}
            </h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">
              {page?.applicationIntro ?? t('becomeIntro')}
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/10 p-4.5 sm:rounded-3xl sm:p-6 lg:p-7">
            <SponsorForm />
          </div>
        </Container>
      </section>
    </div>
  );
}
