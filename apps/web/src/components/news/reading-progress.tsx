'use client';

import { useEffect, useState } from 'react';

/**
 * A thin ambient progress bar fixed to the top of the viewport
 * to indicate scroll depth across long articles.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      setProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-mint shadow-[0_0_10px_rgba(78,226,255,0.75)] transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
