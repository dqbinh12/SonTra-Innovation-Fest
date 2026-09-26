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

    // Pause when the video is offscreen so decoding does not compete with
    // page scroll and reveal transitions further down the page.
    let isIntersecting = true;
    const updatePlayState = () => {
      if (media.matches || !isIntersecting) {
        video.pause();
      } else {
        void video.play().catch(() => {});
      }
    };

    updatePlayState();
    media.addEventListener('change', updatePlayState);

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      updatePlayState();
    });
    observer.observe(video);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', updatePlayState);
    };
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
