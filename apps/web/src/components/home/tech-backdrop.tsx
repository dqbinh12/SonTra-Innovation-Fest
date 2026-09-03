import { cn } from '@/lib/utils';

/**
 * The hero's own background, used when the CMS has no hero artwork.
 *
 * Rendered *behind* <HeroMedia> (which is `-z-10`) at `-z-20`, so uploaded
 * artwork simply covers it and the measured contrast of the scrim in
 * hero-media.tsx is unaffected. Purely decorative — aria-hidden, no content.
 */
export function TechBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('absolute inset-0 -z-20 overflow-hidden', className)}>
      <div className="bg-aurora absolute inset-0 opacity-70 dark:opacity-60" />
      <div className="bg-tech-grid absolute inset-0" />

      {/* Orbit rings — the one literal "tech" motif, kept faint and off-centre
          so the headline never sits on top of a ring. */}
      <div className="absolute top-1/2 -right-40 hidden -translate-y-1/2 lg:block">
        <div className="animate-orbit size-[34rem] rounded-full border border-dashed border-[color-mix(in_oklab,var(--color-brand-blue)_28%,transparent)] dark:border-[color-mix(in_oklab,var(--color-brand-cyan)_30%,transparent)]">
          <span className="bg-brand-cyan absolute top-0 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_20px_4px_var(--color-brand-cyan)]" />
        </div>
        <div className="animate-orbit absolute inset-8 rounded-full border border-[color-mix(in_oklab,var(--color-brand-violet)_24%,transparent)] [animation-direction:reverse] [animation-duration:38s]">
          <span className="bg-brand-violet absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full shadow-[0_0_18px_4px_var(--color-brand-violet)]" />
        </div>
      </div>

      {/* Floating glow, bottom-left — balances the rings on the right. */}
      <div className="animate-float-slow bg-brand-mint/25 dark:bg-brand-teal/30 absolute -bottom-24 -left-24 size-96 rounded-full blur-3xl" />

      {/* Fade into the next section so the seam is a gradient, not a line. */}
      <div className="from-background absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent" />
    </div>
  );
}

/**
 * A tinted, grid-lined band for mid-page sections. Same vocabulary as the hero
 * at a much lower intensity, so the page reads as one surface.
 */
export function SectionGlow({
  className,
  from = 'var(--color-brand-cyan)',
  to = 'var(--color-brand-violet)',
}: {
  className?: string;
  from?: string;
  to?: string;
}) {
  return (
    /* Masked top and bottom: overflow-hidden clips the blur to a hard
       rectangle, which otherwise reads as a band edge across the page. */
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 -z-10 overflow-hidden',
        '[mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)]',
        className,
      )}
      style={
        {
          '--glow-from': from,
          '--glow-to': to,
        } as React.CSSProperties
      }
    >
      <div className="absolute -top-32 -left-20 size-[28rem] rounded-full bg-[color-mix(in_oklab,var(--glow-from)_22%,transparent)] blur-3xl" />
      <div className="absolute -right-24 -bottom-32 size-[26rem] rounded-full bg-[color-mix(in_oklab,var(--glow-to)_20%,transparent)] blur-3xl" />
    </div>
  );
}
