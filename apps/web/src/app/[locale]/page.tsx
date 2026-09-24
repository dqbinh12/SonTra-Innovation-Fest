import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LayoutGrid,
  MapPin,
  Handshake,
  Ticket,
} from 'lucide-react';
import type { Article, HomePage, Locale, Sponsor } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { HeroMedia } from '@/components/hero-media';
import { HeroTitle } from '@/components/home/hero-title';
import { TechBackdrop, SectionGlow } from '@/components/home/tech-backdrop';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { NewsCard } from '@/components/home/news-card';
import { SponsorMarquee } from '@/components/home/sponsor-marquee';
import { EventCountdown } from '@/components/countdown/event-countdown';

type Props = { params: Promise<{ locale: string }> };

function getHomePage(locale: string) {
  return strapiFetchOptional<HomePage>('home-page', {
    locale: locale as Locale,
    // Components are not populated by default — event days and seo need naming.
    query: {
      'populate[heroMedia]': 'true',
      'populate[heroMediaMobile]': 'true',
      'populate[eventDays]': 'true',
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
  const [t, tNav] = await Promise.all([getTranslations('home'), getTranslations('nav')]);

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

  /** The destinations are fixed routes; editors control their localized copy. */
  const exploreCards = [
    {
      href: '/agenda',
      icon: CalendarDays,
      label: tNav('agenda'),
      body: home?.exploreAgenda ?? t('exploreAgenda'),
    },
    {
      href: '/exhibition',
      icon: LayoutGrid,
      label: tNav('exhibition'),
      body: home?.exploreExhibition ?? t('exploreExhibition'),
    },
    {
      href: '/location',
      icon: MapPin,
      label: tNav('location'),
      body: home?.exploreLocation ?? t('exploreLocation'),
    },
    {
      href: '/sponsors',
      icon: Handshake,
      label: tNav('sponsors'),
      body: home?.exploreSponsors ?? t('exploreSponsors'),
    },
  ] as const;

  const eventDays =
    home?.eventDays && home.eventDays.length > 0
      ? home.eventDays
      : [
          { date: t('defaultEventDay3'), startTime: '08:00:00', endTime: '22:00:00' },
          { date: t('defaultEventDay4'), startTime: '08:00:00', endTime: '17:00:00' },
        ];
  const admission = home?.admission || t('defaultAdmission');
  const introVideoUrl =
    home?.introYoutubeUrl ?? 'https://www.youtube.com/watch?v=EB2RaO8jnck';
  const introVideoEmbedUrl = getYouTubeEmbedUrl(introVideoUrl);

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      {/*
        A full-viewport video stage with the copy centred on it — the format
        the reference event sites use, and the one that lets the footage read
        as the subject rather than as wallpaper behind a left-aligned column.

        `min-h-svh`, not `min-h-screen`: on mobile Safari `100vh` is the
        *largest* viewport, so the CTA row would sit under the browser chrome
        on first paint. `svh` is what is actually visible.

        The heavier bottom padding below `sm` is not decorative: the countdown
        is a fixed corner widget, and on a phone it is wide enough to cover the
        secondary CTA. The padding lifts the centred copy clear of it. Adjust
        it alongside the widget's size, not on its own.
      */}
      <section className="bg-brand-navy relative isolate flex min-h-svh items-center overflow-hidden pt-32 pb-52 text-white sm:py-36">
        {/* Hero artwork from the CMS — image or video, at -z-10 with its own
            navy scrim. `centre`, not the default edge scrim: the copy on this
            page is centred on the stage, and an edge scrim leaves the middle of
            the frame open. Nothing renders until heroMedia is uploaded, and
            <TechBackdrop> below shows through. */}
        {(home?.heroMedia || home?.heroMediaMobile) && (
          <HeroMedia desktop={home.heroMedia} mobile={home.heroMediaMobile} scrim="centre" />
        )}
        {/* Animated backdrop — sits at -z-20, so artwork simply covers it. */}
        <TechBackdrop />

        <Container className="relative w-full">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            {(home?.eventDate || home?.venue) && (
              <p className="glass-invert mb-10 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase sm:text-sm">
                <span className="bg-brand-mint inline-block size-2 animate-pulse rounded-full" />
                {[home.eventDate, home.venue].filter(Boolean).join(' · ')}
              </p>
            )}

            {/*
              One fluid size rather than four breakpoint steps — a display line
              on a full-bleed stage should scale with the stage, and `clamp`
              keeps it from wrapping into four lines on a phone or stopping
              short of the video on a 27" screen. `leading-[1.02]` because
              default leading opens a visible gap between lines this large.
            */}
            <h1 className="text-[clamp(2.5rem,6.4vw,5.75rem)] leading-[1.02] font-bold tracking-tight text-balance">
              {/* Typed on load, with the full accent palette drifting through
                  it — see hero-title.tsx and `.gradient-text-aurora`. */}
              <HeroTitle text={home?.heroTitle ?? t('title')} />
            </h1>

            {home?.heroSubtitle && (
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-balance text-white sm:text-xl">
                {home.heroSubtitle}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <HeroCta href={home?.ctaHref} label={home?.ctaLabel ?? t('heroCta')} />
              <Link
                href="/agenda"
                className="glass-invert inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-white/15"
              >
                {t('heroCtaSecondary')}
              </Link>
            </div>
          </div>
        </Container>

        {/* Fade into the page ground so the seam is a gradient, not a line.
            On the section rather than inside <HeroMedia>, so it is there even
            before any artwork is uploaded. */}
        <div
          aria-hidden="true"
          className="from-background absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent"
        />
      </section>

      {/* The countdown, as a corner widget pinned for the whole page. Rendered
          once and outside the hero — it positions itself. */}
      <EventCountdown
        locale={locale}
        variant="hero"
        floating
        action={<RegisterButton label={t('heroCta')} />}
      />

      {/* ─── Event overview ────────────────────────────────────────────── */}
      {eventDays.length > 0 && (
        <section className="relative z-10 -mt-16 pb-16">
          <Container>
            <ScrollReveal className="glass overflow-hidden rounded-3xl">
              <div className="border-border/60 border-b px-6 py-5 sm:px-8">
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {t('highlightsTitle')}
                </h2>
              </div>

              <dl className="grid lg:grid-cols-[0.9fr_1.6fr_0.9fr]">
                <div className="border-border/60 p-6 sm:p-8 lg:border-r">
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                    <CalendarDays aria-hidden="true" className="text-brand-cyan size-4" />
                    {t('eventDaysLabel')}
                  </dt>
                  <dd className="mt-4">
                    <strong className="block text-3xl font-bold tracking-tight">
                      {t('eventDuration')}
                    </strong>
                    <span className="mt-2 block text-lg font-bold tracking-tight">
                      {t('eventDateRange')}
                    </span>
                    {home?.venue && (
                      <span className="text-muted-foreground border-border/60 mt-4 flex items-start gap-2 border-t pt-4 text-sm leading-relaxed">
                        <MapPin
                          aria-hidden="true"
                          className="text-brand-cyan mt-0.5 size-4 shrink-0"
                        />
                        {home.venue}
                      </span>
                    )}
                  </dd>
                </div>

                <div className="border-border/60 border-t p-6 sm:p-8 lg:border-t-0 lg:border-r">
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                    <Clock3 aria-hidden="true" className="text-brand-cyan size-4" />
                    {t('openingHoursLabel')}
                  </dt>
                  <dd className="mt-5 space-y-5">
                    {eventDays.map((day) => {
                      const start = day.startTime.slice(0, 5);
                      const end = day.endTime.slice(0, 5);
                      const [startHour, startMinute] = start.split(':').map(Number);
                      const [endHour, endMinute] = end.split(':').map(Number);
                      const startPercent = ((startHour * 60 + startMinute) / 1440) * 100;
                      const widthPercent =
                        (((endHour - startHour) * 60 + endMinute - startMinute) / 1440) * 100;

                      return (
                        <div key={`${day.date}-${start}`}>
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="font-medium">{day.date}</span>
                            <time className="font-mono font-semibold" dateTime={`${start}/${end}`}>
                              {start} – {end}
                            </time>
                          </div>
                          <div className="bg-muted relative mt-2 h-2 overflow-hidden rounded-full bg-[repeating-linear-gradient(90deg,transparent_0,transparent_calc(25%_-_1px),var(--border)_calc(25%_-_1px),var(--border)_25%)]">
                            <div
                              aria-hidden="true"
                              className="from-brand-cyan to-brand-blue absolute h-full rounded-full bg-gradient-to-r"
                              style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                            />
                          </div>
                          <div className="text-muted-foreground mt-1 flex justify-between font-mono text-[9px]">
                            <span>00h</span>
                            <span>06h</span>
                            <span>12h</span>
                            <span>18h</span>
                            <span>24h</span>
                          </div>
                        </div>
                      );
                    })}
                  </dd>
                </div>

                <div className="border-border/60 border-t p-6 sm:p-8 lg:border-t-0">
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                    <Ticket aria-hidden="true" className="text-brand-cyan size-4" />
                    {t('admissionLabel')}
                  </dt>
                  <dd className="text-primary mt-5 text-3xl font-bold tracking-tight">
                    {admission}
                  </dd>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {t('admissionNote')}
                  </p>
                  <p className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                    <span aria-hidden="true" className="bg-brand-mint size-2 rounded-full" />
                    {t('entryOpenToAll')}
                  </p>
                </div>
              </dl>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* ─── Video & Introduction ────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <ScrollReveal className="lg:col-span-5">
              {(home?.introBadge ?? t('introBadge')) && (
                <div className="text-brand-cyan mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                  <span
                    aria-hidden="true"
                    className="bg-brand-cyan inline-block size-2 rounded-full"
                  />
                  {home?.introBadge ?? t('introBadge')}
                </div>
              )}
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {home?.introTitle ?? t('introTitle')}
              </h2>
              {(home?.introBody ?? t('introBody')) && (
                <p className="text-muted-foreground mt-6 text-base leading-relaxed sm:text-lg">
                  {home?.introBody ?? t('introBody')}
                </p>
              )}
            </ScrollReveal>

            {introVideoEmbedUrl && (
              <ScrollReveal delay={120} className="lg:col-span-7">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="from-brand-cyan/20 via-brand-blue/15 to-transparent absolute -inset-3 rounded-3xl bg-gradient-to-tr blur-xl opacity-75"
                  />
                  <div className="glass border-border/70 relative overflow-hidden rounded-2xl p-2 sm:rounded-3xl sm:p-3 shadow-2xl">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                      <iframe
                        src={introVideoEmbedUrl}
                        title={t('introVideoAria')}
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </Container>
      </section>

      {/* ─── Explore ───────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <SectionGlow />
        <Container>
          <ScrollReveal>
            <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-4xl">
              {home?.exploreTitle ?? t('exploreTitle')}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-lg">
              {home?.exploreSubtitle ?? t('exploreSubtitle')}
            </p>
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

                {/* The highlights again, as a rich quick-summary card */}
                <div className="relative hidden lg:block">
                  <div
                    aria-hidden="true"
                    className="from-brand-cyan/10 via-brand-blue/8 to-brand-violet/10 absolute -inset-8 rounded-3xl bg-gradient-to-br blur-2xl"
                  />
                  <div className="glass relative rounded-3xl p-8 sm:p-10">
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                      {t('quickSummaryTitle')}
                    </p>
                    <ul className="divide-border/60 mt-6 divide-y text-sm">
                      <li className="flex items-baseline justify-between gap-6 py-3.5">
                        <span className="text-muted-foreground">{t('timeLabel')}</span>
                        <strong className="text-foreground font-semibold">
                          {t('eventDateRange')}
                        </strong>
                      </li>
                      {home?.venue && (
                        <li className="flex items-baseline justify-between gap-6 py-3.5">
                          <span className="text-muted-foreground">{t('venueLabel')}</span>
                          <span className="text-foreground max-w-[14rem] text-right font-medium">
                            {home.venue}
                          </span>
                        </li>
                      )}
                      <li className="flex items-baseline justify-between gap-6 py-3.5">
                        <span className="text-muted-foreground">{t('latestClosingLabel')}</span>
                        <span className="gradient-text font-mono text-lg font-bold">22:00</span>
                      </li>
                      <li className="flex items-baseline justify-between gap-6 py-3.5">
                        <span className="text-muted-foreground">{t('admissionLabel')}</span>
                        <span className="gradient-text text-lg font-bold">{admission}</span>
                      </li>
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
 * The pill with the travelling gradient border — see `.btn-conic` in
 * globals.css for how the spinning layer is built.
 *
 * Always points at /attend rather than honouring the CMS `ctaHref`: this one
 * sits inside the countdown, where the only sensible destination is the page
 * that tells you how to turn up.
 */
function RegisterButton({ label }: { label: string }) {
  return (
    <Link href="/attend" className="btn-conic w-full">
      <span className="btn-conic__label px-5 py-2.5 text-sm font-semibold text-white">{label}</span>
    </Link>
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
    'btn-glow bg-primary text-primary-foreground inline-flex rounded-full px-8 py-4 text-sm font-semibold tracking-wide uppercase';
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
