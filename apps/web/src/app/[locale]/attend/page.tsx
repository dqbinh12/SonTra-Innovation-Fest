import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Ticket } from 'lucide-react';
import type { AttendPage, AudienceSegmentKey, Locale } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { TechBackdrop, SectionGlow } from '@/components/home/tech-backdrop';
import { HeroMedia } from '@/components/hero-media';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { AUDIENCE_KEYS, AudienceCard, isAudienceKey } from '@/components/attend/audience-card';
import { RichText } from '@/components/rich-text';

type Props = { params: Promise<{ locale: string }> };

function getAttendPage(locale: string) {
  return strapiFetchOptional<AttendPage>('attend-page', {
    locale: locale as Locale,
    query: {
      'populate[heroMedia]': 'true',
      'populate[heroMediaMobile]': 'true',
      'populate[benefits]': 'true',
      'populate[audienceSegments]': 'true',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['attend-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'attend' }),
    getAttendPage(locale),
  ]);

  return seoMetadata(page?.seo, {
    title: page?.heroTitle ?? t('title'),
    description: page?.heroBody,
    locale,
    href: '/attend',
  });
}

export default async function Attend({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('attend');
  const page = await getAttendPage(locale);

  /**
   * The four visitor types. The CMS may override any of them (and reorder
   * them); anything it does not carry falls back to the translated copy, so
   * the page is complete before an editor ever opens Strapi.
   */
  const authored = (page?.audienceSegments ?? []).filter((segment) => isAudienceKey(segment.key));
  const keys: AudienceSegmentKey[] = authored.length
    ? authored.map((segment) => segment.key)
    : AUDIENCE_KEYS;

  const segments = keys.map((key) => {
    const cms = authored.find((segment) => segment.key === key);
    return {
      key,
      title: cms?.title || t(`segments.${key}.title`),
      description: cms?.description || t(`segments.${key}.description`),
      highlights: cms?.highlights || t(`segments.${key}.highlights`),
      ctaLabel: cms?.ctaLabel || t(`segments.${key}.ctaLabel`),
      ctaHref: cms?.ctaHref ?? null,
    };
  });

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy relative isolate overflow-hidden pt-24 pb-10 text-white sm:pt-28 sm:pb-14">
        {/* CMS artwork or video — sits at -z-10 with its own navy scrim. */}
        {(page?.heroMedia || page?.heroMediaMobile) && (
          <HeroMedia desktop={page.heroMedia} mobile={page.heroMediaMobile} />
        )}
        {/* Animated backdrop — sits at -z-20, so the media simply covers it. */}
        <TechBackdrop />

        <Container className="relative">
          <p className="glass-invert mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white">
            <Ticket aria-hidden="true" className="size-4" />
            {t('heroBadge')}
          </p>

          <h1 className="max-w-3xl text-xl font-bold tracking-tight text-balance sm:text-3xl lg:text-4xl">
            <span className="gradient-text-hero">{page?.heroTitle ?? t('title')}</span>
          </h1>

          {page?.heroBody && (
            <p className="mt-3 max-w-xl text-xs sm:text-sm text-white/80 leading-relaxed">
              {page.heroBody}
            </p>
          )}

          {/* Jump straight to your own card rather than reading all four. */}
          <ul className="mt-6 flex flex-wrap gap-2">
            {segments.map((segment) => (
              <li key={segment.key}>
                <a
                  href={`#audience-${segment.key}`}
                  className="glass-invert inline-flex rounded-full px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
                >
                  {segment.title}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ─── Audience segments ─────────────────────────────────────────── */}
      <section className="relative overflow-x-clip scroll-mt-24 py-10 sm:py-14" id="audience">
        <SectionGlow />
        <Container>
          <ScrollReveal direction="left">
            <h2 className="text-lg font-bold tracking-tight text-balance sm:text-3xl">
              {t('audienceTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed">
              {t('audienceLead')}
            </p>
          </ScrollReveal>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {segments.map((segment, i) => (
              <li key={segment.key} id={`audience-${segment.key}`} className="scroll-mt-24">
                <ScrollReveal direction="up" delay={i * 90} className="h-full">
                  <AudienceCard
                    segmentKey={segment.key}
                    title={segment.title}
                    description={segment.description}
                    highlights={segment.highlights}
                    highlightsLabel={t('highlightsLabel')}
                    ctaLabel={segment.ctaLabel}
                    ctaHref={segment.ctaHref}
                  />
                </ScrollReveal>
              </li>
            ))}
          </ul>

          {/* Free-form note from the CMS, kept under the cards it qualifies. */}
          {page?.audience && (
            <ScrollReveal direction="up-lg" className="glass text-muted-foreground mt-8 rounded-2xl p-6">
              <div className="max-w-3xl">
                <RichText content={page.audience} />
              </div>
            </ScrollReveal>
          )}
        </Container>
      </section>

      {/* ─── Benefits ──────────────────────────────────────────────────── */}
      {page?.benefits && page.benefits.length > 0 && (
        <Section title={t('benefitsTitle')} className="py-8 sm:py-12">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.benefits.map((benefit, i) => (
              <li key={benefit.title}>
                <ScrollReveal direction="up" delay={(i % 3) * 80} className="h-full">
                  <div className="group glass lift h-full rounded-2xl p-6">
                    <span
                      aria-hidden="true"
                      className="gradient-text text-sm font-bold tracking-[0.2em]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="group-hover:text-primary mt-3 font-semibold transition-colors">
                      {benefit.title}
                    </h3>
                    {benefit.description && (
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    )}
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ─── Entry info ────────────────────────────────────────────────── */}
      <section className="relative overflow-x-clip py-8 sm:py-12">
        <Container>
          <ScrollReveal direction="up-lg">
            <div className="glass rounded-2xl p-5 sm:rounded-3xl sm:p-7">
              <h2 className="text-lg font-bold tracking-tight">{t('entryTitle')}</h2>
              <div className="mt-6 max-w-3xl">
                {page?.entryInfo ? (
                  <RichText content={page.entryInfo} />
                ) : (
                  <p className="text-muted-foreground">{t('entryFree')}</p>
                )}
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ─── Closing CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-x-clip pb-12 sm:pb-16">
        <Container>
          <ScrollReveal direction="up-lg">
            <div className="bg-brand-navy relative isolate overflow-hidden rounded-2xl px-5 py-10 text-center text-white sm:rounded-3xl sm:px-10 sm:py-12">
              <div aria-hidden="true" className="bg-aurora absolute inset-0 -z-10 opacity-90" />
              <div aria-hidden="true" className="bg-tech-grid absolute inset-0 -z-10" />
              <div
                aria-hidden="true"
                className="bg-brand-cyan/20 animate-float-slow absolute -top-24 -left-16 -z-10 size-72 rounded-full blur-3xl"
              />

              <h2 className="mx-auto max-w-2xl text-lg font-bold tracking-tight text-balance sm:text-3xl">
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-white/85 leading-relaxed">
                {t('ctaBody')}
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="btn-glow bg-primary text-primary-foreground inline-flex rounded-lg px-8 py-4 text-sm font-semibold tracking-wide uppercase"
                >
                  {t('ctaPrimary')}
                </Link>
                <Link
                  href="/location"
                  className="glass-invert inline-flex rounded-lg px-8 py-4 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-white/15"
                >
                  {t('ctaSecondary')}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
