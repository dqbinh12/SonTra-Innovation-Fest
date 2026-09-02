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
export function LanguageSwitcher({ className }: { className?: string }) {
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
    <div className={cn('flex items-center gap-1', className)} role="group" aria-label={t('label')}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          aria-current={locale === active ? 'true' : undefined}
          aria-label={t('switchTo', { language: localeNames[locale] })}
          className={cn(
            'rounded-md px-2 py-1 text-sm font-medium transition-colors',
            locale === active
              ? 'bg-secondary text-secondary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
