import type { Sponsor } from '@sif/shared';
import { StrapiImage } from '@/components/strapi-image';

/** Below this many logos the duplicated track cannot fill the viewport. */
const MIN_FOR_MARQUEE = 5;

function Logo({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div className="glass lift flex h-20 w-44 shrink-0 items-center justify-center rounded-xl px-4">
      {sponsor.logo ? (
        <StrapiImage
          media={sponsor.logo}
          className="max-h-12 w-auto object-contain"
          sizes="176px"
        />
      ) : (
        <span className="text-muted-foreground text-sm font-medium">{sponsor.name}</span>
      )}
    </div>
  );
}

/**
 * Auto-scrolling marquee of sponsor logos.
 *
 * The track is duplicated so the CSS `translateX(-50%)` animation loops
 * seamlessly. Pauses on hover via `.marquee-track:hover` in globals.css.
 * Falls back to a static wrap layout when `prefers-reduced-motion` is set
 * (the CSS disables the animation).
 *
 * With only a handful of sponsors the duplicated track is narrower than the
 * viewport, so `translateX(-50%)` visibly slides the logos off one edge and
 * leaves a gap. Below `MIN_FOR_MARQUEE` we centre them instead — which is also
 * the better look for an early sponsor roster.
 */
export function SponsorMarquee({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length < MIN_FOR_MARQUEE) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6">
        {sponsors.map((sponsor) => (
          <Logo key={sponsor.documentId} sponsor={sponsor} />
        ))}
      </div>
    );
  }

  // Render the logos twice for the seamless loop.
  const logos = [...sponsors, ...sponsors];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
      />

      <div className="marquee-track flex w-max animate-marquee items-center gap-12 py-4">
        {logos.map((sponsor, i) => (
          <Logo key={`${sponsor.documentId}-${i}`} sponsor={sponsor} />
        ))}
      </div>
    </div>
  );
}
