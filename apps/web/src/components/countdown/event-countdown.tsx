import type { Locale, SiteSettings } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { CountdownCard, type CountdownVariant } from './countdown-card';

/**
 * Server half of the countdown: reads the single `countdown` component off
 * Site Settings so the homepage and the Agenda page show the same clock, set
 * in one place.
 *
 * Renders nothing when the editor has not set a date or has switched the
 * countdown off — both pages can mount it unconditionally.
 */
export async function EventCountdown({
  locale,
  variant,
  className,
}: {
  locale: string;
  variant?: CountdownVariant;
  className?: string;
}) {
  const settings = await strapiFetchOptional<SiteSettings>('site-setting', {
    locale: locale as Locale,
    query: { 'populate[countdown]': 'true' },
    tags: ['site-setting'],
  });

  const countdown = settings?.countdown;
  if (!countdown?.enabled || !countdown.targetDate) return null;

  return (
    <CountdownCard
      targetDate={countdown.targetDate}
      label={countdown.label}
      variant={variant}
      className={className}
    />
  );
}
