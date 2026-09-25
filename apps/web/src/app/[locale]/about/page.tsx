import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import type { AboutPage, Locale, OrganizationRole } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { RichText } from '@/components/rich-text';
import { AboutHero } from '@/components/about/about-hero';
import { NewsBackdrop } from '@/components/news/news-backdrop';
import {
  ORGANIZATION_ROLES,
  Organizations,
  isOrganizationRole,
} from '@/components/about/organizations';

type Props = { params: Promise<{ locale: string }> };

function getAboutPage(locale: string) {
  return strapiFetchOptional<AboutPage>('about-page', {
    locale: locale as Locale,
    query: {
      'populate[organizations][populate]': 'logo',
      'populate[seo][populate]': 'ogImage',
      'populate[overview]': '*',
    },
    tags: ['about-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'about' }),
    getAboutPage(locale),
  ]);

  return seoMetadata(page?.seo, {
    title: t('title'),
    description: page?.mission,
    locale,
    href: '/about',
  });
}

/**
 * /about, on the dark palette end to end.
 *
 * The page used to alternate white bands with coloured ones, which left it
 * mostly white and mostly empty. Here the ground is dark and continuous, the
 * colour lives in the ground itself rather than in a band you scroll past, and
 * the vertical rhythm is tighter throughout — the previous 96px section
 * padding was most of the emptiness on its own.
 *
 * Order: the partners come before the story. They are the page's one piece of
 * scannable content — six logos read at a glance — and putting four paragraphs
 * of prose ahead of them buried the answer to the question the page title
 * actually asks.
 *
 * `className="dark"` is what makes this cheap: it flips the semantic tokens
 * for this subtree only, so `.glass`, `--muted-foreground` and every border
 * resolve against the dark palette without a single per-component override.
 * See the `.page-deep` note in globals.css.
 */
export default async function About({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const page = await getAboutPage(locale);

  /** Only roles the UI knows how to place; anything else is ignored. */
  const organizations = (page?.organizations ?? []).filter((organization) =>
    isOrganizationRole(organization.role),
  );

  const roleLabels = Object.fromEntries(
    ORGANIZATION_ROLES.map((role) => [role, t(`roles.${role}`)]),
  ) as Record<OrganizationRole, string>;

  const overviewDefaults = [
    { label: t('overviewDefaults.dateLabel'), value: t('overviewDefaults.dateValue') },
    { label: t('overviewDefaults.venueLabel'), value: t('overviewDefaults.venueValue') },
    { label: t('overviewDefaults.themeLabel'), value: t('overviewDefaults.themeValue') },
    { label: t('overviewDefaults.attendanceLabel'), value: t('overviewDefaults.attendanceValue') },
    { label: t('overviewDefaults.exhibitionLabel'), value: t('overviewDefaults.exhibitionValue') },
    {
      label: t('overviewDefaults.competitionsLabel'),
      value: t('overviewDefaults.competitionsValue'),
    },
  ];

  const overviewItems =
    page?.overview && page.overview.length > 0 ? page.overview : overviewDefaults;

  return (
    <div className="page-deep dark text-foreground">
      <NewsBackdrop />

      <AboutHero title={t('title')} tagline={page?.mission} badge="SIF 2026" />

      {/* ─── The story & Event Overview (2-Column Layout) ───────────────── */}
      <section className="pt-8 pb-14 sm:pt-10 sm:pb-18">
        <Container className="max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
            {/* Sidebar: Event At A Glance / Thông Tin Tổng Quan */}
            <aside className="lg:sticky lg:top-24">
              <ScrollReveal>
                <div className="glass rounded-2xl p-6 sm:p-7 border border-border/70 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="size-2 rounded-full bg-brand-cyan" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-cyan font-mono">
                      {t('overviewTitle')}
                    </h3>
                  </div>

                  <dl className="divide-y divide-border/40 text-sm">
                    {overviewItems.map((item, idx) => (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-1">
                        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd className="font-semibold text-foreground text-[14px] leading-snug">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </ScrollReveal>
            </aside>

            {/* Main Content: Story with custom rendered Blocks */}
            <div className="min-w-0">
              <ScrollReveal className="glass rounded-3xl border border-border/70 p-6 sm:p-8">
                <span aria-hidden="true" className="rule-accent mb-4" />
                {page ? (
                  <RichText content={page.story} variant="story" />
                ) : (
                  <EmptyState>{t('title')}</EmptyState>
                )}
              </ScrollReveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Who is behind the festival ────────────────────────────────── */}
      {organizations.length > 0 && (
        <section className="band-inset relative isolate overflow-hidden py-12 sm:py-16">
          <Container>
            <ScrollReveal className="group text-center">
              <h2 className="text-lg font-bold tracking-tight sm:text-3xl">
                {t('organizerTitle')}
              </h2>
              <span aria-hidden="true" className="rule-accent mx-auto mt-4" />
            </ScrollReveal>

            <div className="mt-8 sm:mt-10">
              <Organizations organizations={organizations} labels={roleLabels} />
            </div>
          </Container>
        </section>
      )}

      {/* ─── Closing CTA ───────────────────────────────────────────────── */}
      <section className="pt-8 pb-16 sm:pt-10 sm:pb-20">
        <Container className="max-w-7xl">
          <ScrollReveal>
            <div className="bg-brand-navy/55 relative isolate overflow-hidden rounded-3xl border border-white/10 px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:px-8 sm:py-8 lg:px-10">
              <div
                aria-hidden="true"
                className="from-transparent via-brand-cyan/70 to-transparent absolute inset-x-0 top-0 h-px bg-gradient-to-r"
              />

              <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
                <div className="max-w-2xl">
                  <h2 className="text-lg font-bold tracking-tight text-balance text-foreground sm:text-3xl">
                    {t('ctaTitle')}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-base">
                    {t('ctaBody')}
                  </p>
                </div>

                <Link
                  href="/contact"
                  className="group/cta bg-brand-cyan text-brand-navy hover:bg-foreground focus-visible:ring-brand-cyan inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-[background-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none active:translate-y-px"
                >
                  {t('ctaPrimary')}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
