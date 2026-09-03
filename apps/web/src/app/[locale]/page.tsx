import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, CalendarDays, LayoutGrid, MapPin, Handshake } from 'lucide-react';
import type { Article, HomePage, Locale, Sponsor } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { HeroMedia } from '@/components/hero-media';
import { TechBackdrop, SectionGlow } from '@/components/home/tech-backdrop';
import { AnimatedCounter } from '@/components/home/animated-counter';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { NewsCard } from '@/components/home/news-card';
import { SponsorMarquee } from '@/components/home/sponsor-marquee';

type Props = { params: Promise<{ locale: string }> };

function getHomePage(locale: string) {
  return strapiFetchOptional<HomePage>('home-page', {
    locale: locale as Locale,
    // Components are not populated by default — stats and seo need naming.
    query: {
      'populate[heroMedia]': 'true',
      'populate[heroMediaMobile]': 'true',
      'populate[stats]': 'true',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['home-page'],
  });
}

/**
 * The homepage carries the CMS `seo` component like every other page — without
 * this the uploaded ogImage never reaches the document head, and the page falls
 * back to the layout defaults (which have no image at all).
 *
 * The title is marked absolute so the homepage keeps the bare site name rather
 * than picking up the layout's `%s — SIF` template.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [tSite, page] = await Promise.all([
    getTranslations({ locale, namespace: 'site' }),
    getHomePage(locale),
  ]);

  const meta = await seoMetadata(page?.seo, {
    title: tSite('name'),
    description: tSite('description'),
    locale,
    href: '/',
  });

  return { ...meta, title: { absolute: meta.title as string } };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav] = await Promise.all([
    getTranslations('home'),
    getTranslations('nav'),
  ]);

  const [home, latestNews, sponsors] = await Promise.all([
    getHomePage(locale),
    strapiFetch<Article[]>('articles', {
      locale: locale as Locale,
      query: {
        'sort[0]': 'date:desc',
        'pagination[pageSize]': 3,
        'populate[coverImage]': 'true',
      },
      tags: ['articles'],
    })
      .then((res) => res.data)
      .catch(() => [] as Article[]),
    strapiFetch<Sponsor[]>('sponsors', {
      locale: locale as Locale,
      query: {
        'sort[0]': 'order:asc',
        'pagination[pageSize]': 24,
        'populate[logo]': 'true',
      },
      tags: ['sponsors'],
    })
      .then((res) => res.data)
      .catch(() => [] as Sponsor[]),
  ]);

  /**
   * The four pages a first-time visitor actually needs. Kept here rather than
   * in the CMS: they are fixed routes, and the copy is UI text like the nav
   * labels beside them.
   */
  const exploreCards = [
    { href: '/agenda', icon: CalendarDays, label: tNav('agenda'), body: t('exploreAgenda') },
    { href: '/exhibition', icon: LayoutGrid, label: tNav('exhibition'), body: t('exploreExhibition') },
    { href: '/location', icon: MapPin, label: tNav('location'), body: t('exploreLocation') },
    { href: '/sponsors', icon: Handshake, label: tNav('sponsors'), body: t('exploreSponsors') },
  ] as const;

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy relative isolate overflow-hidden py-28 text-white sm:py-36 lg:py-44">
        {/* CMS artwork — sits at -z-10 with its own navy scrim. */}
        {(home?.heroMedia || home?.heroMediaMobile) && (
          <HeroMedia desktop={home.heroMedia} mobile={home.heroMediaMobile} />
        )}
        {/* Animated backdrop — sits at -z-20, so artwork simply covers it. */}
        <TechBackdrop />

        <Container className="relative">
          {(home?.eventDate || home?.venue) && (
            <p className="glass-invert mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white">
              <span className="bg-brand-mint inline-block size-2 animate-pulse rounded-full" />
              {[home.eventDate, home.venue].filter(Boolean).join(' · ')}
            </p>
          )}

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-7xl">
            {/* Cyan/mint/white only — see `.gradient-text-hero` in globals.css. */}
            <span className="gradient-text-hero">{home?.heroTitle ?? t('title')}</span>
          </h1>

          {/* max-w-xl, not 2xl: keeps the subtitle inside the dense part of the
              hero scrim so it clears WCAG AA over the image. */}
          {home?.heroSubtitle && (
            <p className="mt-6 max-w-xl text-lg text-white/85">{home.heroSubtitle}</p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <HeroCta href={home?.ctaHref} label={home?.ctaLabel ?? t('heroCta')} />
            <Link
              href="/agenda"
              className="glass-invert inline-flex items-center gap-2 rounded-lg px-6 py-4 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-white/15"
            >
              {t('heroCtaSecondary')}
            </Link>
          </div>
        </Container>

        {/* Fade into the page ground so the seam is a gradient, not a line. */}
        <div
          aria-hidden="true"
          className="from-background absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
        />
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────── */}
      {home?.stats && home.stats.length > 0 && (
        <section className="relative z-10 -mt-16 pb-16">
          <Container>
            <h2 className="sr-only">{t('highlightsTitle')}</h2>
            {/* A `div` per term/description pair is the spec-sanctioned way to
                group inside a `dl`; ScrollReveal renders that div. */}
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {home.stats.map((stat, i) => (
                <ScrollReveal key={stat.label} delay={i * 100} className="group glass lift rounded-2xl p-6 text-center">
                  <dt className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    {stat.label}
                  </dt>
                  <dd className="text-foreground mt-2 text-4xl font-bold tracking-tight">
                    <AnimatedCounter value={stat.value} />
                  </dd>
                  <div
                    aria-hidden="true"
                    className="from-brand-cyan to-brand-blue mx-auto mt-4 h-0.5 w-12 rounded-full bg-gradient-to-r opacity-60 transition-all duration-300 group-hover:w-20 group-hover:opacity-100"
                  />
                </ScrollReveal>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {/* ─── Explore ───────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <SectionGlow />
        <Container>
          <ScrollReveal>
            <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-4xl">
              {t('exploreTitle')}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-lg">{t('exploreSubtitle')}</p>
          </ScrollReveal>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exploreCards.map(({ href, icon: Icon, label, body }, i) => (
              <li key={href}>
                <ScrollReveal delay={i * 90} className="h-full">
                  <Link
                    href={href}
                    className="group glass lift flex h-full flex-col rounded-2xl p-6"
                  >
                    <span
                      aria-hidden="true"
                      className="from-brand-cyan/20 to-brand-blue/20 text-primary inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br"
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="group-hover:text-primary mt-5 font-semibold transition-colors">
                      {label}
                    </span>
                    <span className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {body}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="text-primary mt-4 size-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ─── About teaser ──────────────────────────────────────────────── */}
      {home?.aboutTeaser && (
        <section className="relative py-24">
          <Container>
            <ScrollReveal>
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                    {t('aboutTeaserTitle')}
                  </h2>
                  <p className="text-muted-foreground mt-6 max-w-lg text-lg leading-relaxed">
                    {home.aboutTeaser}
                  </p>
                  <Link
                    href="/about"
                    className="group text-primary hover:text-brand-blue mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                  >
                    {t('aboutTeaserCta')}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>

                {/* The stats again, as a portrait card — the panel used to hold
                    a static "SIF 2026" placeholder, which said nothing. Hidden
                    below lg, where the stats grid above is already in view. */}
                <div className="relative hidden lg:block">
                  <div
                    aria-hidden="true"
                    className="from-brand-cyan/10 via-brand-blue/8 to-brand-violet/10 absolute -inset-8 rounded-3xl bg-gradient-to-br blur-2xl"
                  />
                  <div className="glass relative rounded-3xl p-10">
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                      {t('highlightsTitle')}
                    </p>
                    <ul className="divide-border/60 mt-6 divide-y">
                      {(home.stats ?? []).slice(0, 4).map((stat) => (
                        <li key={stat.label} className="flex items-baseline justify-between gap-6 py-4">
                          <span className="text-muted-foreground text-sm">{stat.label}</span>
                          <span className="gradient-text text-2xl font-bold tracking-tight">
                            {stat.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* ─── Sponsors ──────────────────────────────────────────────────── */}
      {sponsors.length > 0 && (
        <section className="relative overflow-hidden py-24">
          <div
            aria-hidden="true"
            className="from-secondary/30 to-secondary/30 absolute inset-0 -z-10 bg-gradient-to-b via-transparent"
          />
          <Container>
            <ScrollReveal className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">{t('sponsorsTitle')}</h2>
            </ScrollReveal>
            <div className="mt-12">
              <ScrollReveal delay={150}>
                <SponsorMarquee sponsors={sponsors} />
              </ScrollReveal>
            </div>
            <ScrollReveal delay={250} className="mt-10 text-center">
              <Link
                href="/sponsors"
                className="text-primary hover:text-brand-blue group inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              >
                {t('sponsorsCta')}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* ─── Latest news ───────────────────────────────────────────────── */}
      {latestNews.length > 0 && (
        <section className="py-24">
          <Container>
            <ScrollReveal>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">{t('latestNewsTitle')}</h2>
                <Link
                  href="/news"
                  className="border-border text-primary hover:bg-primary hover:text-primary-foreground rounded-lg border px-5 py-2 text-sm font-medium transition-colors"
                >
                  {t('latestNewsCta')}
                </Link>
              </div>
            </ScrollReveal>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((article, i) => (
                <li key={article.documentId}>
                  <ScrollReveal delay={i * 120}>
                    <NewsCard article={article} />
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ─── Closing CTA ───────────────────────────────────────────────── */}
      <section className="pb-24">
        <Container>
          <ScrollReveal>
            <div className="bg-brand-navy relative isolate overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:px-12">
              <div aria-hidden="true" className="bg-aurora absolute inset-0 -z-10 opacity-90" />
              <div aria-hidden="true" className="bg-tech-grid absolute inset-0 -z-10" />
              <div
                aria-hidden="true"
                className="bg-brand-cyan/20 animate-float-slow absolute -top-24 -right-16 -z-10 size-72 rounded-full blur-3xl"
              />

              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{t('ctaBody')}</p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/attend"
                  className="btn-glow bg-primary text-primary-foreground inline-flex rounded-lg px-8 py-4 text-sm font-semibold tracking-wide uppercase"
                >
                  {t('ctaPrimary')}
                </Link>
                <Link
                  href="/contact"
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

/**
 * The hero button, honouring the CMS `ctaHref`.
 *
 * `Link` from `@/i18n/navigation` only accepts the typed pathnames in
 * `i18n/routing`, so an absolute URL from the CMS has to go through a plain
 * anchor — it is off-site anyway and should not be locale-prefixed. Anything
 * else falls back to `/attend`, which is what the button meant before the
 * field existed.
 */
function HeroCta({ href, label }: { href?: string | null; label: string }) {
  const className =
    'btn-glow bg-primary text-primary-foreground inline-flex rounded-lg px-8 py-4 text-sm font-semibold tracking-wide uppercase';
  const target = href?.trim();

  if (target && /^https?:\/\//i.test(target)) {
    return (
      <a href={target} className={className} rel="noopener noreferrer" target="_blank">
        {label}
      </a>
    );
  }

  return (
    <Link href="/attend" className={className}>
      {label}
    </Link>
  );
}
