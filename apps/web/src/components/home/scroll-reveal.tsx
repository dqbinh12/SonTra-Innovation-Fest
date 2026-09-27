'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Direction each reveal travels in. The direction carries meaning, so it is
 * chosen by role rather than applied uniformly:
 *
 *   up       body copy and cards — rise from below (the natural reading move)
 *   up-lg    heavy cards — rise further and settle from a slight scale
 *   up-zoom  closing CTA blocks — rise from below while shrinking out of a
 *            slight zoom. Used together with `scrollDriven` (see below).
 *   left     headings and CTA rows — slide in from the left edge
 *   right    the sponsor/partner marquee — slide in from the right edge
 *   focus    media — settle in from a slight zoom
 */
export type RevealDirection = 'up' | 'up-lg' | 'up-zoom' | 'left' | 'right' | 'focus';

/**
 * Scroll-reveal wrapper.
 *
 * Two modes, chosen per block:
 *
 * — One-shot (default). The `.scroll-reveal` class starts every element at
 *   `opacity: 0` plus a per-role transform, and `.is-visible` (added once, on
 *   first entry) transitions it into view. Revealing once and never re-hiding
 *   is deliberate for anything carrying text: a block that re-dims on every
 *   scroll pass costs the reader the content they already had, plus a wait
 *   before it is legible again.
 *
 * — Scroll-driven (`scrollDriven`). The block's opacity/transform are bound
 *   directly to scroll position, so it tracks the wheel in real time and in
 *   both directions: scroll down and it rises/shrinks/fades in, scroll back up
 *   and it sinks/grows/fades out in exact reverse. Set this only on closing
 *   CTA / banner blocks — the ones that carry no reading content and whose job
 *   is to catch the eye on the way past. The reveal plays out over a fixed
 *   on-screen distance (see RANGE) rather than a timer, so a slow scroll keeps
 *   the block mid-flight instead of the old behaviour of waiting for a trigger
 *   point and then playing a fixed 0.7s transition.
 *
 * `delay` (one-shot mode only) staggers sibling reveals via `transition-delay`.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  scrollDriven = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  scrollDriven?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ── Scroll-driven: bind opacity/transform to scroll position ─────────
    if (scrollDriven) {
      let ticking = false;

      const update = () => {
        ticking = false;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // The element's top, in absolute document coords. offsetTop/rect are
        // unaffected by the per-frame scale transform, so this stays stable.
        const elTop = el.getBoundingClientRect().top + window.scrollY;
        // Reveal starts the moment the block's top crosses the bottom edge of
        // the viewport, and completes over a short fixed distance — so the
        // block is fully opaque and at rest well before it reaches the middle
        // of the screen, regardless of how much page is left below it. This
        // makes a fast fling "arrive" quickly instead of only settling at the
        // very bottom of the page.
        const DIST = 260;
        const start = Math.max(0, elTop - vh);
        const end = start + DIST;
        const p = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
        el.style.setProperty('--reveal-p', String(p));
      };

      const schedule = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      };

      update();
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      return () => {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      };
    }

    // ── One-shot: reveal once on first entry ─────────────────────────────
    // Add `.is-visible` the moment ANY part of the element reaches the fold
    // (`threshold: 0`, no `rootMargin`). The previous `threshold: 0.15` made a
    // tall section wait until 15% of its own height was inside the viewport —
    // on a 800px-tall section that is 120px of scrolling before anything moved,
    // which read as content being withheld. The trigger is measured on the
    // element's transformed box, so "first pixel at the fold" is literal: the
    // block starts sliding up as it enters, not after it has already entered.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => el.classList.add('is-visible'), delay);
          } else {
            el.classList.add('is-visible');
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, scrollDriven]);

  return (
    <div
      ref={ref}
      className={cn('scroll-reveal', scrollDriven && 'scroll-reveal--driven', className)}
      data-reveal={direction}
      style={delay ? ({ transitionDelay: `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
