'use client';

import { useState } from 'react';
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

export function SiteHeader({
  siteName,
  logo,
}: {
  siteName: string;
  logo?: StrapiMedia | null;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-4 sm:h-28">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={siteName}
          onClick={() => setOpen(false)}
        >
          {logo ? (
            // Height-constrained so any aspect ratio fits the bar. The current
            // asset is a three-line stacked lockup, which needs the extra
            // height to stay legible — see docs/brand.md.
            <StrapiImage
              media={logo}
              priority
              sizes="(min-width: 640px) 360px, 240px"
              className="h-16 w-auto max-w-[11rem] object-contain sm:h-20 sm:max-w-[20rem]"
            />
          ) : (
            <span className="text-lg font-bold tracking-tight">{siteName}</span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t('menu')}>
          {navItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground rounded-md p-2 lg:hidden"
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
        <nav id="mobile-nav" className="border-border border-t lg:hidden" aria-label={t('menu')}>
          <Container className="flex flex-col py-2">
            {navItems.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={pathname === href ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-3 text-base font-medium transition-colors',
                  pathname === href ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(key)}
              </Link>
            ))}
          </Container>
        </nav>
      )}
    </header>
  );
}
