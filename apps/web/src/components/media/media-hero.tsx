import { Container } from '@/components/layout/container';

/**
 * The Media Center's opening.
 *
 * Deliberately shorter than the About hero: the four tabs sit directly under
 * it and have to be reachable without scrolling — a press room whose sections
 * are below the fold is one a reporter on deadline gives up on. That is also
 * why the headline is left-aligned rather than centred; the tab strip below is
 * left-aligned, and a centred title above it reads as a different page.
 *
 * The top padding is load-bearing: the header is `fixed` on this route, so it
 * takes up no flow space and the hero has to leave room for it. Change one and
 * the other has to move — see the immersive-route note in site-header.tsx.
 */
export function MediaHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string | null;
}) {
  return (
    <header className="relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16">
      <div aria-hidden="true" className="grid-motif text-white" />

      {/* One streak only. The About hero crosses two because it opens a page;
          this one opens a tool, and a second ribbon would compete with the
          tab strip immediately below. */}
      <div
        aria-hidden="true"
        className="streak from-brand-blue to-brand-cyan -top-32 -left-32 rotate-[-14deg] bg-gradient-to-r opacity-40"
      />

      <Container className="relative">
        <p className="glass-invert inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white uppercase">
          <span aria-hidden="true" className="bg-brand-mint size-1.5 rounded-full" />
          {eyebrow}
        </p>

        <h1 className="gradient-text-aurora mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {/* Solid white, not white/85: 18px regular is body text by WCAG's
            reckoning and needs 4.5:1, which softened white misses here. */}
        {lead && <p className="mt-6 max-w-2xl text-lg text-white">{lead}</p>}
      </Container>
    </header>
  );
}
