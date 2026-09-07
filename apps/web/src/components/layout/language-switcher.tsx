'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, localeNames, type Locale } from '@sif/shared';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/**
 * Keeps the visitor on the same page when switching language — next-intl maps
 * the internal pathname to the localised one (e.g. /en/agenda <-> /vi/chuong-trinh).
 */
export function LanguageSwitcher({
  className,
  /** Render for a dark ground — the transparent hero header. */
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const t = useTranslations('language');
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === active) return;
    // `params` carries dynamic segments (e.g. the news [slug]) through the switch.
    router.replace({ pathname, params } as Parameters<typeof router.replace>[0], { locale: next });
  }

  return (
    /* A segmented pill rather than two loose buttons: on the transparent hero
       header the loose version read as two more nav links. */
    <div
      className={cn(
        'flex items-center rounded-full p-0.5',
        onDark ? 'border border-white/20 bg-white/5' : 'bg-secondary',
        className,
      )}
      role="group"
      aria-label={t('label')}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          aria-current={locale === active ? 'true' : undefined}
          aria-label={t('switchTo', { language: localeNames[locale] })}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors',
            locale === active
              ? onDark
                ? 'bg-white text-brand-navy'
                : 'bg-background text-foreground shadow-sm'
              : onDark
                ? 'text-white/65 hover:text-white'
                : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
