'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * A soft glow that follows the cursor across the page.
 *
 * Listens on `window` rather than on a container: this layer is
 * `pointer-events: none` and lives behind the page, so it never receives a
 * pointer event of its own, and any link the cursor happens to be over would
 * otherwise swallow the move and freeze the glow.
 *
 * Position is written as a `transform` on this element (`--sx` / `--sy` in
 * pixels), not as the centre of a gradient — see globals.css for why that
 * distinction decides whether the effect costs a full-screen repaint per
 * pointer sample or nothing at all.
 *
 * Skipped entirely where it would be noise or nuisance:
 *  - coarse pointers, where there is no cursor to follow;
 *  - `prefers-reduced-motion`, where a light chasing the hand is exactly the
 *    incidental movement the setting asks us to drop (the CSS hides it there
 *    too, so it stays hidden even if this check is ever relaxed).
 */
export function PointerSpotlight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || still.matches) return;

    /* One rAF in flight at a time: pointermove fires per input sample, which
       on a 120Hz trackpad runs well ahead of the frames we can paint. */
    let frame = 0;
    let point: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!point) return;
      el.style.setProperty('--sx', `${point.x}px`);
      el.style.setProperty('--sy', `${point.y}px`);
      el.style.setProperty('--spot', '1');
    };

    const onMove = (event: PointerEvent) => {
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    /* Fade out when the pointer leaves the window entirely, so a parked
       cursor outside the viewport does not leave a glow stuck at the edge. */
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) el.style.setProperty('--spot', '0');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onOut);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onOut);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className={cn(className)} />;
}
