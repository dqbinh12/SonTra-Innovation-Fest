import type { ReactNode } from 'react';
import { Container } from './container';

export function ImmersivePageHero({
  eyebrow,
  title,
  lead,
  aside,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-white/10 pt-20 pb-4 sm:pt-24 sm:pb-5 lg:pb-6">
      <Container
        className={
          aside
            ? 'relative grid items-center gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8'
            : 'relative max-w-4xl'
        }
      >
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-brand-mint uppercase sm:text-xs">
            <span className="h-px w-5 sm:w-6 bg-brand-mint" />
            {eyebrow}
          </p>
          <h1 className="gradient-text-aurora mt-1.5 sm:mt-2 max-w-4xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              {lead}
            </p>
          )}
        </div>
        {aside && <div>{aside}</div>}
      </Container>
    </header>
  );
}
