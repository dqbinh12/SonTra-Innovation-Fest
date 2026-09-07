'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

/** Milliseconds per character. Fast enough not to hold the page hostage. */
const STEP_MS = 55;
/** Beat before the first character, so the line does not start mid-fade. */
const LEAD_IN_MS = 450;

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The hero display line, typed out on load with a blinking caret.
 *
 * Two copies of the text ship: an `aria-hidden` animated one, and the full
 * string in an `sr-only` span. Without the second, a screen reader would
 * announce a half-typed sentence and the headline would be worth nothing to a
 * crawler — the animated span is decoration over content that is always there.
 *
 * The wrapper reserves the full height up front (the hidden copy is in normal
 * flow, the typed copy is positioned over it), so the page below does not jump
 * line by line as the text grows. That reflow is what makes most typewriter
 * heroes feel broken.
 */
export function HeroTitle({ text, className }: { text: string; className?: string }) {
  const [typed, setTyped] = useState(0);

  /**
   * Read as external state rather than set from inside the effect: the setting
   * lives in the OS, and deriving it here means the finished line renders on
   * the first pass instead of after a second render. The server snapshot is
   * `false` — the markup it produces (nothing typed yet) is the same either
   * way, because the accessible copy is always present.
   */
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);

  useEffect(() => {
    if (reduced) return;

    let index = 0;
    let interval: ReturnType<typeof setInterval>;

    const lead = setTimeout(() => {
      interval = setInterval(() => {
        index += 1;
        setTyped(index);
        if (index >= text.length) clearInterval(interval);
      }, STEP_MS);
    }, LEAD_IN_MS);

    return () => {
      clearTimeout(lead);
      clearInterval(interval);
    };
  }, [text, reduced]);

  // Reduced motion gets the finished line immediately — a caret marching
  // across the screen is exactly the kind of motion the setting turns off.
  const shown = reduced ? text.length : typed;
  const done = shown >= text.length;

  return (
    <span className={cn('relative block', className)}>
      {/* Reserves the final height so the page below does not jump line by
          line as the text grows. */}
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      {/* The copy that actually counts, for screen readers and crawlers. */}
      <span className="sr-only">{text}</span>

      <span className="absolute inset-0" aria-hidden="true">
        <span className="gradient-text-aurora">{text.slice(0, shown)}</span>
        <span
          className={cn(
            'bg-brand-cyan ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] align-middle',
            // Blinks only once the line is finished: a caret that blinks while
            // it types reads as two competing animations.
            done ? 'animate-caret' : 'opacity-90',
          )}
        />
      </span>
    </span>
  );
}
