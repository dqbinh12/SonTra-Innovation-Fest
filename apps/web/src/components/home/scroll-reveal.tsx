'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Direction each reveal travels in. The direction carries meaning, so it is
 * chosen by role rather than applied uniformly:
 *
 *   up      body copy and cards — rise from below (the natural reading move)
 *   up-lg   heavy cards — rise further and settle from a slight scale
 *   left    headings and CTA rows — slide in from the left edge
 *   right   the sponsor/partner marquee — slide in from the right edge
 *   focus   media — settle in from a slight zoom
 */
export type RevealDirection = 'up' | 'up-lg' | 'left' | 'right' | 'focus';

/**
 * Scroll-reveal wrapper.
 *
 * The `.scroll-reveal` class starts every element at `opacity: 0` plus a
 * per-role transform, and `.is-visible` (added here, once, on first entry)
 * transitions it into view. Revealing once and never re-hiding is deliberate:
 * a scroll-linked timeline would play the transition in reverse when the user
 * scrolls back up, which reads as the section flashing/janking.
 *
 * `delay` creates a stagger between sibling reveals via `transition-delay`.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Add `.is-visible` when the element scrolls into view. The scroll-driven
    // CSS animation (where supported) does not need this, but the session bars
    // inside the reveal rely on it as a trigger for their timed wipe, so we
    // always run the observer instead of early-returning on
    // `CSS.supports('animation-timeline: view()')`.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay the class addition for staggered siblings.
          if (delay > 0) {
            setTimeout(() => el.classList.add('is-visible'), delay);
          } else {
            el.classList.add('is-visible');
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn('scroll-reveal', className)}
      data-reveal={direction}
      style={delay ? ({ transitionDelay: `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
