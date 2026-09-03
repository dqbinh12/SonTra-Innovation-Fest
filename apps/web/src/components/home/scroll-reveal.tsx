'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Scroll-reveal wrapper.
 *
 * Uses the `.scroll-reveal` CSS class which is powered by CSS scroll-driven
 * animations where supported (Chrome 115+, Safari 26+). In Firefox or older
 * browsers the CSS rules use `opacity: 0; transform: translateY(24px)` and
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
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the browser supports scroll-driven animations natively, the CSS
    // handles everything — no JS needed.
    if (CSS.supports('animation-timeline: view()')) return;

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
      style={delay ? ({ transitionDelay: `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
