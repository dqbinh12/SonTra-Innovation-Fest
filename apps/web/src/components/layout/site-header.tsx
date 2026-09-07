'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import type { StrapiMedia } from '@sif/shared';
import { Link, usePathname } from '@/i18n/navigation';
import { Container } from './container';
import { LanguageSwitcher } from './language-switcher';
import { StrapiImage } from '@/components/strapi-image';
import { cn } from '@/lib/utils';

/** Primary nav — the 8 non-home pages from the "Sitemap & Pages" tab. */
const navItems = [
  { key: 'attend', href: '/attend' },
  { key: 'agenda', href: '/agenda' },
  { key: 'exhibition', href: '/exhibition' },
  { key: 'sponsors', href: '/sponsors' },
  { key: 'location', href: '/location' },
  { key: 'news', href: '/news' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const;

/**
 * Past this many pixels the transparent home header condenses into its solid
 * state. Deliberately short: the swap should happen as the hero copy starts to
 * leave, not halfway down the video.
 */
const CONDENSE_AT = 64;

export function SiteHeader({ siteName, logo }: { siteName: string; logo?: StrapiMedia | null }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);

  /**
   * The homepage hero is a full-viewport video, so the header floats over it
   * rather than sitting on a white band above it — the pattern every large
   * festival site uses for a video hero. Every other page keeps the solid
   * sticky bar, which is what their light page grounds need.
   */
  const isHome = pathname === '/';
  // Once the mobile sheet is open it needs an opaque ground of its own.
  const transparent = isHome && !condensed && !open;

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setCondensed(window.scrollY > CONDENSE_AT);
    onScroll(); // A reload partway down the page must not start transparent.
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  return (
    <header
      className={cn(
        'top-0 z-50 transition-colors duration-300',
        // Fixed, not sticky, on the homepage: the hero is measured against the
        // viewport and must start under the header, not below it.
        isHome ? 'fixed inset-x-0' : 'border-border bg-background/90 sticky border-b backdrop-blur',
        isHome &&
          !transparent &&
          'border-b border-white/10 bg-[color-mix(in_oklab,var(--color-brand-navy)_88%,transparent)] backdrop-blur-xl',
      )}
    >
      {/*
        Deliberately slim. The bar used to run to 128px to fit the stacked
        three-line lockup at full size — on a video hero that reads as a
        letterhead rather than event chrome. The reference festival sites all
        sit at 64–80px with the logo scaled to fit, so the footage starts at
        the top of the screen.
      */}
      <Container
        className={cn(
          'flex items-center justify-between gap-4 transition-all duration-300',
          transparent ? 'h-20 sm:h-24' : 'h-16 sm:h-20',
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={siteName}
          onClick={() => setOpen(false)}
        >
          {logo ? (
            // Height-constrained so any aspect ratio fits the bar. The asset
            // is a three-line stacked lockup — see docs/brand.md — and this is
            // the smallest it stays legible at now the bar is slim.
            //
            // On the homepage the blue lockup would sit at ~2:1 on the footage,
            // so it is knocked out to solid white instead. brightness(0) first
            // flattens every brand colour to black, invert(1) lifts it to
            // white — the standard way to reverse a raster logo without
            // shipping a second asset.
            <StrapiImage
              media={logo}
              priority
              sizes="(min-width: 640px) 208px, 144px"
              className={cn(
                'h-11 w-auto max-w-[9rem] object-contain transition-all duration-300 sm:h-14 sm:max-w-[13rem]',
                isHome && 'brightness-0 invert',
              )}
            />
          ) : (
            <span className={cn('text-lg font-bold tracking-tight', isHome && 'text-white')}>
              {siteName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t('menu')}>
          {navItems.map(({ key, href }) => {
            // Read before the isHome branch below: inside it TS narrows
            // `pathname` to '/', which can never equal a nav href.
            const active = pathname === href;

            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  // No active state on the home branch: `isHome` means the
                  // pathname is '/', and every nav href is a sub-page, so
                  // `active` is false for all of them here.
                  isHome
                    ? 'text-white/75 hover:text-white'
                    : active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher onDark={isHome} />

          {/*
            The one always-visible conversion target. Every comparable event
            site parks a single filled pill at the end of the bar — without it
            the header is eight equal-weight links and nothing to act on.
            Hidden on the smallest screens, where it would crowd the burger and
            the hero CTA is a scroll away.
          */}
          <Link
            href="/attend"
            className={cn(
              'bg-primary text-primary-foreground hidden shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all sm:inline-flex',
              // A glow reads on the video; on a white page it just looks blurry.
              isHome
                ? 'hover:shadow-[0_0_24px_color-mix(in_oklab,var(--color-brand-cyan)_55%,transparent)]'
                : 'hover:brightness-110',
            )}
          >
            {t('attend')}
          </Link>
          <button
            type="button"
            className={cn(
              'rounded-md p-2 transition-colors lg:hidden',
              isHome
                ? 'text-white/80 hover:text-white'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t('close') : t('menu')}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {open && (
        <nav
          id="mobile-nav"
          className={cn(
            'border-t lg:hidden',
            isHome
              ? 'border-white/10 bg-[color-mix(in_oklab,var(--color-brand-navy)_95%,transparent)] backdrop-blur-xl'
              : 'border-border',
          )}
          aria-label={t('menu')}
        >
          <Container className="flex flex-col py-2">
            {navItems.map(({ key, href }) => {
              const active = pathname === href;

              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-3 py-3 text-base font-medium transition-colors',
                    isHome
                      ? 'text-white/80 hover:text-white'
                      : active
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t(key)}
                </Link>
              );
            })}
          </Container>
        </nav>
      )}
    </header>
  );
}
