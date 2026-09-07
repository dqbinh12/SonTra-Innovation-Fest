'use client';

import { useCallback, useSyncExternalStore, type ReactNode } from 'react';
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
  action,
  compact = false,
}: {
  /** ISO datetime from the CMS. */
  targetDate: string;
  label?: string | null;
  variant?: CountdownVariant;
  className?: string;
  /** Call to action rendered under the clock. The Agenda panel passes none. */
  action?: ReactNode;
  /**
   * Trims the hero card for the floating corner widget. Same layout, one step
   * down in every dimension — a corner widget that takes a third of a phone
   * screen stops being a widget and starts being a dialog.
   */
  compact?: boolean;
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
    seconds: total % 60,
  };

  const onHero = variant === 'hero';

  /**
   * The hero panel runs a seconds tile; the Agenda panel does not.
   *
   * Seconds were left off both to begin with — a digit flickering once a
   * second beside body copy is a distraction, and it says nothing useful about
   * an event weeks away. For the floating widget the trade flips: it is a
   * small card sitting on its own over the page, and a clock whose digits
   * never move reads as a static graphic rather than as a countdown.
   */
  const units = [
    { key: 'days' as const, value: remaining.days, pad: false },
    { key: 'hours' as const, value: remaining.hours, pad: true },
    { key: 'minutes' as const, value: remaining.minutes, pad: true },
    ...(onHero ? [{ key: 'seconds' as const, value: remaining.seconds, pad: true }] : []),
  ];

  return (
    <aside
      className={cn(
        'relative rounded-2xl',
        onHero
          ? cn(
              'border-brand-cyan/35 glass-invert w-fit overflow-hidden border',
              compact ? 'px-3 py-3' : 'px-5 py-4',
            )
          : 'glass w-fit px-4 py-3',
        className,
      )}
    >
      {/* Travelling light along the top edge — the panel's own motif, and the
          reason it does not need a heavier border to separate from the video
          behind it. Decorative, so it stays out of the tree. */}
      {onHero && (
        <span
          aria-hidden="true"
          className="animate-sheen absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-brand-cyan),var(--color-brand-mint),transparent)] bg-[length:200%_100%]"
        />
      )}

      <p
        className={cn(
          'font-semibold uppercase',
          onHero
            ? cn('text-center tracking-[0.12em] text-white', compact ? 'text-xs' : 'text-sm')
            : 'text-muted-foreground text-[0.65rem] tracking-[0.18em]',
        )}
      >
        {label?.trim() || t('label')}
      </p>

      <ol
        className={cn(
          'mt-3',
          // Equal-width columns rather than a flex row: the days tile goes from
          // one digit to two and back, and on a flex row that resizes every
          // tile beside it.
          onHero
            ? cn('grid grid-cols-4', compact ? 'gap-1.5' : 'gap-2.5')
            : 'flex items-baseline gap-4',
        )}
        // `aria-live` stays off: a live region that updates on its own would
        // interrupt a screen reader. `role="timer"` lets one read it on demand.
        //
        // The label stops at minutes even when a seconds tile is on screen —
        // a value already stale by the time the sentence finishes helps nobody
        // — and carries `suppressHydrationWarning` for the same reason the
        // digits do: it is baked into the prerendered HTML at build time.
        role="timer"
        aria-live="off"
        suppressHydrationWarning
        aria-label={t('ariaLabel', {
          days: remaining.days,
          hours: remaining.hours,
          minutes: remaining.minutes,
        })}
      >
        {units.map(({ key, value, pad }) => (
          <li
            key={key}
            className={cn(
              'text-center',
              // A solid tile, not glass on glass: the panel already sits over
              // moving footage, and a translucent tile inside a translucent
              // panel gives the digits no edge to sit against.
              onHero &&
                'rounded-xl bg-[color-mix(in_oklab,var(--color-brand-blue)_26%,var(--color-brand-navy))] ring-1 ring-inset ring-white/10',
              onHero && (compact ? 'px-1.5 py-2' : 'px-2 py-3'),
            )}
          >
            <span
              // Tabular figures plus a min-width stop the row shifting sideways
              // as 9 rolls over to 10.
              //
              // Keyed on the value: React remounts the span whenever the digit
              // changes, which is what restarts the CSS animation — and only
              // when it changes, so the days tile is still for hours at a time
              // while the seconds tile ticks. The animation has to live on this
              // element rather than on a child: `gradient-text-hero` clips its
              // background to the text of this box, and a nested block child
              // breaks that clip, which renders the digit invisible.
              key={value}
              suppressHydrationWarning
              className={cn(
                'block min-w-[2ch] font-bold tabular-nums',
                onHero
                  ? cn('gradient-text-hero animate-tick-in', compact ? 'text-xl' : 'text-3xl')
                  : 'gradient-text text-2xl',
              )}
            >
              {pad ? String(value).padStart(2, '0') : value}
            </span>
            <span
              className={cn(
                'block tracking-wider uppercase',
                onHero
                  ? cn(
                      'mt-1 font-semibold text-white/65',
                      compact ? 'text-[0.55rem]' : 'text-[0.6rem]',
                    )
                  : 'text-muted-foreground mt-0.5 text-[0.6rem] font-medium',
              )}
            >
              {t(key)}
            </span>
          </li>
        ))}
      </ol>

      {action && <div className="mt-3">{action}</div>}
    </aside>
  );
}
