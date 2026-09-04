'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * `hero` is the card sitting on the navy homepage hero, `panel` the one on the
 * Agenda page's white header band.
 */
export type CountdownVariant = 'hero' | 'panel';

/** Whole seconds left, floored at 0. */
function secondsUntil(target: number): number {
  return Math.max(0, Math.floor((target - Date.now()) / 1000));
}

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

/**
 * The countdown to the opening, as a small card in the corner of the hero.
 *
 * Always on: no dismiss button and nothing remembered about the visitor. Once
 * the date has passed it takes itself off both pages instead of sitting at
 * zero.
 */
export function CountdownCard({
  targetDate,
  label,
  variant = 'hero',
  className,
}: {
  /** ISO datetime from the CMS. */
  targetDate: string;
  label?: string | null;
  variant?: CountdownVariant;
  className?: string;
}) {
  const t = useTranslations('countdown');
  const target = new Date(targetDate).getTime();

  /**
   * An external store rather than state-plus-effect, because the pages are
   * statically rendered: the HTML carries whatever was left at build or
   * revalidate time, which can be hours old. The store's snapshot is read
   * again right after hydration, so the digits correct themselves on the first
   * paint instead of waiting a second — and the render stays pure.
   *
   * The snapshot is a plain number so repeated reads within the same second
   * are referentially equal and React can bail out of the re-render.
   */
  const getSnapshot = useCallback(() => secondsUntil(target), [target]);
  const total = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Nothing to count down to any more — the festival has started.
  if (Number.isNaN(target) || total <= 0) return null;

  const remaining = {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
  };

  /**
   * Days / hours / minutes only. A seconds tile flickering once a second pulls
   * the eye off the headline beside it, and says nothing useful about an event
   * that is weeks away — the clock still ticks every second underneath, so the
   * minute rolls over on time.
   */
  const units = [
    { key: 'days' as const, value: remaining.days, pad: false },
    { key: 'hours' as const, value: remaining.hours, pad: true },
    { key: 'minutes' as const, value: remaining.minutes, pad: true },
  ];

  const onHero = variant === 'hero';

  return (
    <aside
      className={cn('w-fit rounded-2xl px-4 py-3', onHero ? 'glass-invert' : 'glass', className)}
    >
      <p
        className={cn(
          'max-w-[12rem] text-[0.65rem] font-semibold tracking-[0.15em] uppercase',
          onHero ? 'text-white/70' : 'text-muted-foreground',
        )}
      >
        {label?.trim() || t('label')}
      </p>

      <ol
        className="mt-2 flex items-baseline gap-4"
        // `aria-live` stays off: a live region that updates on its own would
        // interrupt a screen reader. `role="timer"` lets one read it on demand.
        role="timer"
        aria-live="off"
        aria-label={t('ariaLabel', {
          days: remaining.days,
          hours: remaining.hours,
          minutes: remaining.minutes,
        })}
      >
        {units.map(({ key, value, pad }) => (
          <li key={key} className="text-center">
            <span
              // Tabular figures plus a min-width stop the row shifting sideways
              // as 9 rolls over to 10.
              suppressHydrationWarning
              className={cn(
                'block min-w-[2ch] text-2xl font-bold tabular-nums',
                onHero ? 'gradient-text-hero' : 'gradient-text',
              )}
            >
              {pad ? String(value).padStart(2, '0') : value}
            </span>
            <span
              className={cn(
                'mt-0.5 block text-[0.6rem] font-medium tracking-wider uppercase',
                onHero ? 'text-white/60' : 'text-muted-foreground',
              )}
            >
              {t(key)}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
