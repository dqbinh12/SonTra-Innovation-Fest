'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, TimerReset } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The countdown as a floating widget, pinned to the bottom-right corner and
 * visible from the first paint.
 *
 * Deliberately not tied to the scroll position: the clock is the one piece of
 * the page that is worth the same at every scroll depth, so revealing it only
 * after the hero has gone hides it exactly when the visitor is most likely to
 * still be deciding. Nothing here observes anything — the widget is `fixed`
 * and simply stays put.
 *
 * Collapsed state is remembered for the session only — deliberately not
 * persisted. A visitor who collapses it has said "not now", not "never show me
 * this again", and a countdown that stays hidden after a reload is a countdown
 * nobody sees.
 */
export function FloatingCountdown({ children }: { children: ReactNode }) {
  const t = useTranslations('countdown');
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      {/*
        Collapsed, the widget is the button and nothing else. An earlier version
        kept the panel's title visible, which made the collapsed state *wider*
        than the open one — a "hide this" control that takes more room than the
        thing it hides.
      */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? t('collapse') : t('expand')}
          className={cn(
            'border-brand-cyan/35 bg-brand-navy inline-flex items-center justify-center rounded-full border text-white/80 transition-colors hover:text-white',
            open ? 'absolute -top-2 -right-2 z-10 size-7' : 'size-12 shadow-lg',
          )}
        >
          {open ? <Minus className="size-3.5" /> : <TimerReset className="size-5" />}
        </button>

        {open && children}
      </div>
    </div>
  );
}
