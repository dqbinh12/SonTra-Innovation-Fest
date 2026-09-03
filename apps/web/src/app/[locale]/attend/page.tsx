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
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { AUDIENCE_KEYS, AudienceCard, isAudienceKey } from '@/components/attend/audience-card';
import { RichText } from '@/components/rich-text';

type Props = { params: Promise<{ locale: string }> };

function getAttendPage(locale: string) {
  return strapiFetchOptional<AttendPage>('attend-page', {
    locale: locale as Locale,
    query: {
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
      <section className="bg-brand-navy relative isolate overflow-hidden py-20 text-white sm:py-28">
        <TechBackdrop />

        <Container className="relative">
          <p className="glass-invert mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white">
            <Ticket aria-hidden="true" className="size-4" />
            {t('heroBadge')}
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            <span className="gradient-text-hero">{page?.heroTitle ?? t('title')}</span>
          </h1>

          {page?.heroBody && (
            <p className="mt-6 max-w-xl text-lg text-white/85">{page.heroBody}</p>
          )}

          {/* Jump straight to your own card rather than reading all four. */}
          <ul className="mt-10 flex flex-wrap gap-3">
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
      <section className="relative scroll-mt-24 py-24" id="audience">
        <SectionGlow />
        <Container>
          <ScrollReveal>
            <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-4xl">
              {t('audienceTitle')}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg">{t('audienceLead')}</p>
          </ScrollReveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {segments.map((segment, i) => (
              <li key={segment.key} id={`audience-${segment.key}`} className="scroll-mt-24">
                <ScrollReveal delay={i * 90} className="h-full">
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
            <ScrollReveal className="glass text-muted-foreground mt-8 rounded-2xl p-6">
              <div className="max-w-3xl">
                <RichText content={page.audience} />
              </div>
            </ScrollReveal>
          )}
        </Container>
      </section>

      {/* ─── Benefits ──────────────────────────────────────────────────── */}
      {page?.benefits && page.benefits.length > 0 && (
        <Section title={t('benefitsTitle')} className="py-12 sm:py-16">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.benefits.map((benefit, i) => (
              <li key={benefit.title}>
                <ScrollReveal delay={i * 80} className="h-full">
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
      <section className="relative py-16">
        <Container>
          <ScrollReveal>
            <div className="glass rounded-3xl p-8 sm:p-10">
              <h2 className="text-2xl font-bold tracking-tight">{t('entryTitle')}</h2>
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
      <section className="pb-24">
        <Container>
          <ScrollReveal>
            <div className="bg-brand-navy relative isolate overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
              <div aria-hidden="true" className="bg-aurora absolute inset-0 -z-10 opacity-90" />
              <div aria-hidden="true" className="bg-tech-grid absolute inset-0 -z-10" />
              <div
                aria-hidden="true"
                className="bg-brand-cyan/20 animate-float-slow absolute -top-24 -left-16 -z-10 size-72 rounded-full blur-3xl"
              />

              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-balance">
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{t('ctaBody')}</p>

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
