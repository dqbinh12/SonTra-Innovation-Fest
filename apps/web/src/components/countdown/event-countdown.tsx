import type { ReactNode } from 'react';
import type { Locale, SiteSettings } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { CountdownCard, type CountdownVariant } from './countdown-card';
import { FloatingCountdown } from './floating-countdown';

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
  action,
  floating = false,
}: {
  locale: string;
  variant?: CountdownVariant;
  className?: string;
  /** Call to action rendered inside the card. */
  action?: ReactNode;
  /**
   * Render as the pinned corner widget rather than in the flow of the page.
   *
   * The check for whether there is a countdown at all happens above, before
   * the shell is built — otherwise a countdown disabled in the CMS would still
   * leave an empty floating frame with a collapse button on the page.
   */
  floating?: boolean;
}) {
  const settings = await strapiFetchOptional<SiteSettings>('site-setting', {
    locale: locale as Locale,
    query: { 'populate[countdown]': 'true' },
    tags: ['site-setting'],
  });

  const countdown = settings?.countdown;
  if (!countdown?.enabled || !countdown.targetDate) return null;

  const card = (
    <CountdownCard
      targetDate={countdown.targetDate}
      label={countdown.label}
      variant={variant}
      className={className}
      action={action}
      compact={floating}
    />
  );

  return floating ? <FloatingCountdown>{card}</FloatingCountdown> : card;
}
