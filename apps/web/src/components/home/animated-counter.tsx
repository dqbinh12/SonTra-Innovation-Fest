'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts a stat up from 0 to its target when it scrolls into view.
 *
 * Only values that are a whole number with an optional short unit suffix are
 * animated — "3", "120+", "40k", "95%". Anything else renders immediately and
 * untouched: "Free" / "Miễn phí" has no number, and counting up an opening-
 * hours range like "10:00 – 22:00" reads as a broken clock rather than a
 * counter, since the animation walks the hour through 1:00, 4:00, 7:00 on its
 * way to 10:00.
 */
const COUNTABLE = /^(\d+)\s*([+%]|[kKmM])?$/;

export function AnimatedCounter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    // Respect reduced-motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const match = value.trim().match(COUNTABLE);
    if (!match) return; // Not a plain count — render as-is.

    const target = parseInt(match[1], 10);
    const suffix = match[2] ?? '';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        hasAnimated.current = true;
        observer.disconnect();

        const duration = 1200; // ms
        const startTime = performance.now();

        function tick(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic.
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          setDisplay(`${current}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
