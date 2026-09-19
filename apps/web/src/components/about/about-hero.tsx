import { Container } from '@/components/layout/container';

/**
 * The About page's opening.
 *
 * The top padding is load-bearing: the header is `fixed` on this route, so it
 * takes up no flow space and the hero has to leave room for it. Change one and
 * the other has to move — see the immersive-route note in site-header.tsx.
 */
export function AboutHero({
  title,
  lead,
  eyebrow,
}: {
  title: string;
  lead?: string | null;
  eyebrow?: string | null;
}) {
  return (
    <header className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      {/* Grid moment 1 of 2. */}
      <div aria-hidden="true" className="grid-motif text-white" />

      {/* Two crossing streaks, warm against cool, off-centre so neither sits
          under the headline. */}
      <div
        aria-hidden="true"
        className="streak from-brand-violet to-brand-blue -top-24 -left-40 rotate-[-18deg] bg-gradient-to-r"
      />
      <div
        aria-hidden="true"
        className="streak from-brand-cyan to-brand-mint top-40 -right-56 rotate-[12deg] bg-gradient-to-r opacity-40"
      />

      <Container className="relative text-center">
        {eyebrow && (
          <p className="glass-invert mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white uppercase sm:text-sm">
            <span aria-hidden="true" className="bg-brand-mint size-1.5 rounded-full" />
            {eyebrow}
          </p>
        )}

        {/*
          The headline gradient is `.gradient-text-aurora` — white through
          cyan, mint and green. Every stop measures above 6:1 on this navy
          ground (the palette note in globals.css has the numbers), so the
          sweep never dips out of contrast mid-cycle.
        */}
        <h1 className="gradient-text-aurora text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {title}
        </h1>

        {/* Solid white, not white/80: at 20px regular this is body text by
            WCAG's reckoning, so it needs 4.5:1 and cannot lean on opacity. */}
        {lead && (
          <p className="mx-auto mt-7 max-w-2xl text-lg text-balance text-white sm:text-xl">
            {lead}
          </p>
        )}
      </Container>
    </header>
  );
}
