'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * One video layer of the hero background.
 *
 * Exists as its own client component for a single reason: a looping background
 * video is exactly the motion `prefers-reduced-motion` is about, CSS cannot
 * pause a video, and <HeroMedia> around it is a server component. Everything
 * else about the layer is plain markup.
 */
export function HeroVideoLayer({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      // Pausing leaves the current frame on screen, which is the still hero we
      // want — there is no poster to fall back to, since the CMS media field
      // carries only the video itself.
      if (media.matches) video.pause();
      else void video.play().catch(() => {});
    };

    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      // Decorative background: never controls, never in the tab order.
      tabIndex={-1}
      aria-hidden="true"
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
    />
  );
}
