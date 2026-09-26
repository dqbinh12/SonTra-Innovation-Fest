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

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

function isDocumentVisible() {
  return document.visibilityState === 'visible';
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
  // Ship the complete title in the initial HTML. Once the component hydrates in
  // a visible tab, the effect resets it and starts the typewriter animation.
  // This keeps previews and no-JS clients from seeing only an empty caret.
  const [typed, setTyped] = useState(text.length);

  /**
   * Read as external state rather than set from inside the effect: the setting
   * lives in the OS, and deriving it here means the finished line renders on
   * the first pass instead of after a second render. The server snapshot is
   * `false` — the markup it produces (nothing typed yet) is the same either
   * way, because the accessible copy is always present.
   */
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const visible = useSyncExternalStore(subscribeVisibility, isDocumentVisible, () => true);

  useEffect(() => {
    if (reduced || !visible) return;

    let interval: ReturnType<typeof setInterval>;

    const lead = setTimeout(() => {
      setTyped(0);
      interval = setInterval(() => {
        setTyped((current) => {
          const next = current + 1;
          if (next >= text.length) clearInterval(interval);
          return next;
        });
      }, STEP_MS);
    }, LEAD_IN_MS);

    return () => {
      clearTimeout(lead);
      clearInterval(interval);
    };
  }, [text, reduced, visible]);

  // Reduced motion and background preview tabs get the finished line
  // immediately. Browsers throttle timers in hidden tabs, otherwise leaving an
  // empty title and only the caret visible in the in-app preview.
  const shown = reduced || !visible ? text.length : typed;
  const done = shown >= text.length;

  return (
    <span className={cn('relative block whitespace-pre-line', className)}>
      {/* Reserves the final height so the page below does not jump line by
          line as the text grows. */}
      <span className="invisible whitespace-pre-line" aria-hidden="true">
        {text}
      </span>
      {/* The copy that actually counts, for screen readers and crawlers. */}
      <span className="sr-only">{text}</span>

      <span className="absolute inset-0 whitespace-pre-line" aria-hidden="true">
        {/*
          The caret is a `::after` on the text itself, not a sibling element.

          As a sibling `<span>` it is an atomic inline-level box: when the last
          headline line is nearly full the browser has nowhere to put it and
          breaks it onto a line of its own, so the title grows a phantom third
          line the moment typing finishes. As a pseudo-element it belongs to the
          inline flow of the final word, so it can never be torn away from it —
          measured height is identical with and without the caret at every
          viewport from 375px to 1600px.
        */}
        <span
          className={cn('gradient-text-aurora', done ? 'hero-caret-blink' : 'hero-caret-typing')}
        >
          {text.slice(0, shown)}
        </span>
      </span>
    </span>
  );
}
