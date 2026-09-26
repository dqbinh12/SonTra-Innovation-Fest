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
 * Uses the `.scroll-reveal` CSS class which is powered by CSS scroll-driven
 * animations where supported (Chrome 115+, Safari 26+). In Firefox or older
 * browsers the CSS rules use `opacity: 0; transform: translateY(130px)` and
 * wait for an `.is-visible` class — this component adds that via
 * IntersectionObserver.
 *
 * `delay` creates a stagger between sibling reveals by setting a CSS custom
 * property that the transition picks up.
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
