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
  Sparkles,
  Cpu,
  Layers,
  Users,
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
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ locale: string }> };

function getHomePage(locale: string) {
  return strapiFetchOptional<HomePage>('home-page', {
    locale: locale as Locale,
    query: {
      'populate[heroMedia]': 'true',
      'populate[heroMediaMobile]': 'true',
      'populate[eventDays]': 'true',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['home-page'],
  });
}

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

  const exploreCards = [
    {
      href: '/agenda',
      icon: CalendarDays,
      label: tNav('agenda'),
      body: home?.exploreAgenda ?? t('exploreAgenda'),
      index: '01',
      accentColor: 'text-brand-cyan',
      accentBorder: 'group-hover:border-brand-cyan/50',
      accentBg: 'bg-brand-cyan/15',
    },
    {
      href: '/exhibition',
      icon: LayoutGrid,
      label: tNav('exhibition'),
      body: home?.exploreExhibition ?? t('exploreExhibition'),
      index: '02',
      accentColor: 'text-brand-teal',
      accentBorder: 'group-hover:border-brand-mint/50',
      accentBg: 'bg-brand-mint/15',
    },
    {
      href: '/location',
      icon: MapPin,
      label: tNav('location'),
      body: home?.exploreLocation ?? t('exploreLocation'),
      index: '03',
      accentColor: 'text-brand-violet',
      accentBorder: 'group-hover:border-brand-violet/50',
      accentBg: 'bg-brand-violet/15',
    },
    {
      href: '/sponsors',
      icon: Handshake,
      label: tNav('sponsors'),
      body: home?.exploreSponsors ?? t('exploreSponsors'),
      index: '04',
      accentColor: 'text-brand-blue',
      accentBorder: 'group-hover:border-brand-blue/50',
      accentBg: 'bg-brand-blue/15',
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
  const introVideoUrl = home?.introYoutubeUrl ?? 'https://www.youtube.com/watch?v=EB2RaO8jnck';
  const introVideoEmbedUrl = getYouTubeEmbedUrl(introVideoUrl);

  const fallbackTitle =
    locale === 'vi'
      ? 'Kết nối công nghệ – Kiến tạo tương lai Sơn Trà'
      : 'Connecting Technology – Shaping the Future of Son Tra';
  const heroDisplayTitle = home?.heroTitle || fallbackTitle;

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy relative isolate flex min-h-svh items-center overflow-hidden pt-28 pb-36 text-white sm:pt-32 sm:pb-40 lg:pt-36 lg:pb-44">
        {(home?.heroMedia || home?.heroMediaMobile) && (
          <HeroMedia desktop={home.heroMedia} mobile={home.heroMediaMobile} scrim="centre" />
        )}
        <TechBackdrop />

        <Container className="relative w-full">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            {/* Live Event Telemetry Pill */}
            <div className="glass-invert mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand-cyan/30 px-4 py-1.5 text-xs font-semibold tracking-wider text-brand-cyan uppercase backdrop-blur-xl shadow-[0_0_24px_rgba(0,240,255,0.18)] sm:mb-8 sm:px-5 sm:py-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-mint opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-mint" />
              </span>
              <span>
                {[home?.eventDate || '3–4 OCT 2026', home?.venue || 'SƠN TRÀ, ĐÀ NẴNG']
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>

            {/* Main Fluid Title with typing aurora glow */}
            <h1 className="text-[clamp(1.5rem,5.6vw,5.25rem)] leading-[1.08] font-bold tracking-tight text-balance">
              <HeroTitle text={heroDisplayTitle} />
            </h1>

            {home?.heroSubtitle && (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-balance text-white/85 sm:mt-6 sm:text-base lg:text-lg">
                {home.heroSubtitle}
              </p>
            )}

            {/* Dual CTAs with glowing primary */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:mt-10 sm:gap-4">
              <HeroCta href={home?.ctaHref} label={home?.ctaLabel ?? t('heroCta')} />
              <Link
                href="/agenda"
                className="glass-invert inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/15 sm:px-8 sm:py-3.5 sm:text-sm"
              >
                {t('heroCtaSecondary')}
              </Link>
            </div>

            {/* Quick Metrics Bar at hero base */}
            <div className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-2.5 sm:mt-14 sm:grid-cols-4 sm:gap-3.5">
              <div className="glass rounded-xl border border-white/10 p-3 text-center backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:rounded-2xl sm:p-3.5">
                <span className="gradient-text-aurora block font-mono text-lg font-extrabold tracking-tight sm:text-2xl">
                  {t('statExhibitors')}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-white/70">
                  {t('statExhibitorsLabel')}
                </span>
              </div>
              <div className="glass rounded-xl border border-white/10 p-3 text-center backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:rounded-2xl sm:p-3.5">
                <span className="gradient-text-aurora block font-mono text-lg font-extrabold tracking-tight sm:text-2xl">
                  {t('statKeynotes')}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-white/70">
                  {t('statKeynotesLabel')}
                </span>
              </div>
              <div className="glass rounded-xl border border-white/10 p-3 text-center backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:rounded-2xl sm:p-3.5">
                <span className="gradient-text-aurora block font-mono text-lg font-extrabold tracking-tight sm:text-2xl">
                  {t('statAttendees')}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-white/70">
                  {t('statAttendeesLabel')}
                </span>
              </div>
              <div className="glass rounded-xl border border-white/10 p-3 text-center backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:rounded-2xl sm:p-3.5">
                <span className="gradient-text-aurora block font-mono text-lg font-extrabold tracking-tight sm:text-2xl">
                  {t('statAccess')}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-white/70">
                  {t('statAccessLabel')}
                </span>
              </div>
            </div>
          </div>
        </Container>

        {/* Ambient bottom fade */}
        <div
          aria-hidden="true"
          className="from-background absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent sm:h-40"
        />
      </section>

      {/* Floating Countdown Widget */}
      <EventCountdown
        locale={locale}
        variant="hero"
        floating
        action={<RegisterButton label={t('heroCta')} />}
      />

      {/* ─── Event Overview Dashboard ──────────────────────────────────── */}
      {eventDays.length > 0 && (
        <section className="relative z-10 -mt-12 pb-12 sm:-mt-16 sm:pb-16">
          <Container>
            <ScrollReveal className="glass relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-2xl shadow-2xl sm:rounded-3xl">
              {/* Neon top highlight */}
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-brand-cyan/60 to-transparent" />

              <div className="border-border/60 flex items-center justify-between border-b px-5 py-4 sm:px-8 sm:py-5">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-brand-cyan animate-pulse" />
                  <h2 className="text-base font-bold tracking-tight text-foreground sm:text-xl">
                    {t('highlightsTitle')}
                  </h2>
                </div>
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                  SIF 2026
                </span>
              </div>

              <dl className="grid lg:grid-cols-[0.9fr_1.6fr_0.9fr]">
                {/* Date & Location */}
                <div className="border-border/60 p-5 sm:p-7 lg:border-r">
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                    <CalendarDays aria-hidden="true" className="text-brand-blue size-4" />
                    {t('eventDaysLabel')}
                  </dt>
                  <dd className="mt-3 sm:mt-4">
                    <strong className="block text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {t('eventDuration')}
                    </strong>
                    <span className="mt-1 block text-sm font-semibold text-brand-blue sm:text-lg">
                      {t('eventDateRange')}
                    </span>
                    {home?.venue && (
                      <span className="text-muted-foreground border-border/60 mt-4 flex items-start gap-2 border-t pt-4 text-xs leading-relaxed sm:text-sm">
                        <MapPin
                          aria-hidden="true"
                          className="text-brand-blue mt-0.5 size-4 shrink-0"
                        />
                        {home.venue}
                      </span>
                    )}
                  </dd>
                </div>

                {/* Timeline */}
                <div className="border-border/60 border-t p-5 sm:p-7 lg:border-t-0 lg:border-r">
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                    <Clock3 aria-hidden="true" className="text-brand-blue size-4" />
                    {t('openingHoursLabel')}
                  </dt>
                  <dd className="mt-3 space-y-4 sm:mt-4 sm:space-y-5">
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
                          <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                            <span className="font-medium text-foreground">{day.date}</span>
                            <time
                              className="font-mono font-semibold text-brand-blue"
                              dateTime={`${start}/${end}`}
                            >
                              {start} – {end}
                            </time>
                          </div>
                          <div className="bg-muted relative mt-2 h-2 overflow-hidden rounded-full bg-[repeating-linear-gradient(90deg,transparent_0,transparent_calc(25%_-_1px),var(--border)_calc(25%_-_1px),var(--border)_25%)]">
                            <div
                              aria-hidden="true"
                              className="from-brand-cyan via-brand-blue to-brand-mint absolute h-full rounded-full bg-gradient-to-r"
                              style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                            />
                          </div>
                          <div className="text-muted-foreground mt-1 flex justify-between font-mono text-xs">
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

                {/* Admission */}
                <div className="border-border/60 border-t p-5 sm:p-7 lg:border-t-0">
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                    <Ticket aria-hidden="true" className="text-brand-blue size-4" />
                    {t('admissionLabel')}
                  </dt>
                  <dd className="text-brand-blue mt-3 text-xl font-bold tracking-tight sm:mt-4 sm:text-3xl">
                    {admission}
                  </dd>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                    {t('admissionNote')}
                  </p>
                  <p className="text-muted-foreground mt-3 flex items-center gap-2 text-xs sm:mt-4">
                    <span aria-hidden="true" className="bg-brand-mint size-2 rounded-full" />
                    {t('entryOpenToAll')}
                  </p>
                </div>
              </dl>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* ─── Video & Mission Section ───────────────────────────────────── */}
      <section className="relative py-14 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <ScrollReveal className="lg:col-span-5">
              {(home?.introBadge ?? t('introBadge')) && (
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-xs font-semibold tracking-wider text-brand-blue uppercase backdrop-blur-md mb-3">
                  <Sparkles className="size-3" />
                  <span>{home?.introBadge ?? t('introBadge')}</span>
                </div>
              )}
              <h2 className="text-lg font-bold tracking-tight text-foreground text-balance sm:text-3xl lg:text-4xl">
                {home?.introTitle ?? t('introTitle')}
              </h2>
              {(home?.introBody ?? t('introBody')) && (
                <p className="text-muted-foreground mt-4 text-xs leading-relaxed sm:mt-5 sm:text-sm sm:leading-relaxed lg:text-base">
                  {home?.introBody ?? t('introBody')}
                </p>
              )}

              {/* 3 Tech Pillars */}
              <div className="mt-6 grid gap-2.5 sm:mt-8">
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-2.5 sm:p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-blue">
                    <Cpu className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90 sm:text-sm">
                    {locale === 'vi'
                      ? 'Trình diễn công nghệ AI, Robotics & Smart City'
                      : 'AI, Robotics & Smart City demonstrations'}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-2.5 sm:p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
                    <Layers className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90 sm:text-sm">
                    {locale === 'vi'
                      ? 'Khu trải nghiệm công nghệ đa giác quan & VR/AR'
                      : 'Multisensory immersive tech & VR/AR zones'}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-2.5 sm:p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-violet/10 text-brand-violet">
                    <Users className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90 sm:text-sm">
                    {locale === 'vi'
                      ? 'Kết nối đầu tư & vườn ươm khởi nghiệp đổi mới'
                      : 'Startup investment matchmaking & networking'}
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {introVideoEmbedUrl && (
              <ScrollReveal delay={120} className="lg:col-span-7">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="from-brand-cyan/20 via-brand-blue/15 to-brand-violet/20 absolute -inset-3 rounded-3xl bg-gradient-to-tr blur-2xl opacity-75"
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

      {/* ─── Explore Festival (4 Interactive Tiles) ────────────────────── */}
      <section className="relative py-14 sm:py-20 lg:py-24">
        <SectionGlow />
        <Container>
          <ScrollReveal>
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold tracking-tight text-foreground text-balance sm:text-3xl lg:text-4xl">
                {home?.exploreTitle ?? t('exploreTitle')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:mt-3 sm:text-sm lg:text-base">
                {home?.exploreSubtitle ?? t('exploreSubtitle')}
              </p>
            </div>
          </ScrollReveal>

          <ul className="mt-8 grid gap-3.5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {exploreCards.map(
              (
                { href, icon: Icon, label, body, index, accentColor, accentBorder, accentBg },
                i,
              ) => (
                <li key={href}>
                  <ScrollReveal delay={i * 90} className="h-full">
                    <Link
                      href={href}
                      className={cn(
                        'group glass lift relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300',
                        accentBorder,
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            aria-hidden="true"
                            className={cn(
                              'inline-flex size-10 items-center justify-center rounded-xl sm:size-11',
                              accentBg,
                              accentColor,
                            )}
                          >
                            <Icon className="size-5" />
                          </span>
                          <span className="font-mono text-xs font-semibold text-muted-foreground">
                            {index}
                          </span>
                        </div>
                        <h3 className="mt-4 text-sm font-bold text-foreground transition-colors group-hover:text-brand-blue sm:mt-5 sm:text-lg">
                          {label}
                        </h3>
                        <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed sm:text-sm">
                          {body}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-blue sm:mt-6">
                        <span>{locale === 'vi' ? 'Khám phá' : 'Explore'}</span>
                        <ArrowRight
                          aria-hidden="true"
                          className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </div>
                    </Link>
                  </ScrollReveal>
                </li>
              ),
            )}
          </ul>
        </Container>
      </section>

      {/* ─── About Teaser ──────────────────────────────────────────────── */}
      {home?.aboutTeaser && (
        <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
          <Container>
            <ScrollReveal>
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground text-balance sm:text-3xl lg:text-4xl">
                    {t('aboutTeaserTitle')}
                  </h2>
                  <p className="text-muted-foreground mt-4 text-xs leading-relaxed sm:mt-5 sm:text-sm lg:text-base">
                    {home.aboutTeaser}
                  </p>
                  <Link
                    href="/about"
                    className="group text-primary hover:text-brand-blue mt-4 inline-flex items-center gap-2 py-2 text-xs font-semibold tracking-wider uppercase transition-colors sm:mt-6 sm:text-sm"
                  >
                    {t('aboutTeaserCta')}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>

                {/* Highlights Summary Card */}
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="from-brand-cyan/15 via-brand-blue/10 to-brand-violet/15 absolute -inset-4 rounded-3xl bg-gradient-to-br blur-2xl opacity-75 sm:-inset-8"
                  />
                  <div className="glass relative rounded-2xl p-5 sm:rounded-3xl sm:p-8">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <p className="text-xs font-semibold tracking-[0.2em] text-brand-blue uppercase">
                        {t('quickSummaryTitle')}
                      </p>
                      <span className="size-2 rounded-full bg-brand-mint" />
                    </div>
                    <ul className="divide-border/60 divide-y text-xs sm:text-sm">
                      <li className="flex items-baseline justify-between gap-4 py-3 sm:py-3.5">
                        <span className="text-muted-foreground">{t('timeLabel')}</span>
                        <strong className="text-foreground font-semibold">
                          {t('eventDateRange')}
                        </strong>
                      </li>
                      {home?.venue && (
                        <li className="flex items-baseline justify-between gap-4 py-3 sm:py-3.5">
                          <span className="text-muted-foreground">{t('venueLabel')}</span>
                          <span className="text-foreground max-w-[14rem] text-right font-medium">
                            {home.venue}
                          </span>
                        </li>
                      )}
                      <li className="flex items-baseline justify-between gap-4 py-3 sm:py-3.5">
                        <span className="text-muted-foreground">{t('latestClosingLabel')}</span>
                        <span className="gradient-text font-mono text-sm font-bold sm:text-lg">
                          22:00
                        </span>
                      </li>
                      <li className="flex items-baseline justify-between gap-4 py-3 sm:py-3.5">
                        <span className="text-muted-foreground">{t('admissionLabel')}</span>
                        <span className="gradient-text text-sm font-bold sm:text-lg">
                          {admission}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* ─── Sponsors Marquee ──────────────────────────────────────────── */}
      {sponsors.length > 0 && (
        <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden="true"
            className="from-secondary/30 to-secondary/30 absolute inset-0 -z-10 bg-gradient-to-b via-transparent"
          />
          <Container>
            <ScrollReveal className="text-center">
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-3xl">
                {t('sponsorsTitle')}
              </h2>
            </ScrollReveal>
            <div className="mt-8 sm:mt-10">
              <ScrollReveal delay={150}>
                <SponsorMarquee sponsors={sponsors} />
              </ScrollReveal>
            </div>
            <ScrollReveal delay={250} className="mt-8 text-center sm:mt-10">
              <Link
                href="/sponsors"
                className="text-primary hover:text-brand-blue group inline-flex items-center gap-2 py-2 text-xs font-semibold tracking-wider uppercase transition-colors sm:text-sm"
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

      {/* ─── Latest News ───────────────────────────────────────────────── */}
      {latestNews.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20">
          <Container>
            <ScrollReveal>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-3xl">
                  {t('latestNewsTitle')}
                </h2>
                <Link
                  href="/news"
                  className="border-border text-primary hover:bg-primary hover:text-primary-foreground rounded-lg border px-4 py-1.5 text-xs font-medium transition-colors sm:px-5 sm:py-2 sm:text-sm"
                >
                  {t('latestNewsCta')}
                </Link>
              </div>
            </ScrollReveal>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
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
      <section className="pb-16 sm:pb-24">
        <Container>
          <ScrollReveal>
            <div className="bg-brand-navy relative isolate overflow-hidden rounded-2xl px-5 py-12 text-center text-white sm:rounded-3xl sm:px-10 sm:py-16">
              <div aria-hidden="true" className="bg-aurora absolute inset-0 -z-10 opacity-90" />
              <div aria-hidden="true" className="bg-tech-grid absolute inset-0 -z-10" />
              <div
                aria-hidden="true"
                className="bg-brand-cyan/20 animate-float-slow absolute -top-24 -right-16 -z-10 size-72 rounded-full blur-3xl"
              />

              <h2 className="mx-auto max-w-2xl text-lg font-bold tracking-tight text-white text-balance sm:text-3xl lg:text-4xl">
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-white/85 sm:mt-4 sm:text-sm lg:text-base">
                {t('ctaBody')}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3.5 sm:mt-10 sm:gap-4">
                <Link
                  href="/attend"
                  className="btn-glow bg-primary text-primary-foreground inline-flex rounded-full px-7 py-3 text-xs font-bold tracking-wider uppercase sm:px-8 sm:py-3.5 sm:text-sm"
                >
                  {t('ctaPrimary')}
                </Link>
                <Link
                  href="/contact"
                  className="glass-invert inline-flex rounded-full border border-white/20 px-7 py-3 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-all hover:bg-white/15 sm:px-8 sm:py-3.5 sm:text-sm"
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

function RegisterButton({ label }: { label: string }) {
  return (
    <Link href="/attend" className="btn-conic w-full">
      <span className="btn-conic__label px-5 py-2.5 text-xs font-semibold text-white sm:text-sm">
        {label}
      </span>
    </Link>
  );
}

function HeroCta({ href, label }: { href?: string | null; label: string }) {
  const className =
    'btn-glow bg-primary text-primary-foreground inline-flex rounded-full px-7 py-3 text-xs font-bold tracking-wider uppercase shadow-xl shadow-brand-blue/30 sm:px-8 sm:py-3.5 sm:text-sm';
  const target = href?.trim();

  if (target && (target.startsWith('http://') || target.startsWith('https://'))) {
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
