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
    <header className="relative overflow-hidden pt-20 pb-5 sm:pt-24 sm:pb-6">
      <div aria-hidden="true" className="grid-motif text-white" />

      {/* One streak only. The About hero crosses two because it opens a page;
          this one opens a tool, and a second ribbon would compete with the
          tab strip immediately below. */}
      <div
        aria-hidden="true"
        className="streak from-brand-blue to-brand-cyan -top-32 -left-32 rotate-[-14deg] bg-gradient-to-r opacity-40"
      />

      <Container className="relative">
        <p className="glass-invert inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white uppercase">
          <span aria-hidden="true" className="bg-brand-mint size-1.5 rounded-full" />
          {eyebrow}
        </p>

        <h1 className="gradient-text-aurora mt-2 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        {/* Solid white, not white/85: 18px regular is body text by WCAG's
            reckoning and needs 4.5:1, which softened white misses here. */}
        {lead && (
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/80 sm:text-sm">{lead}</p>
        )}
      </Container>
    </header>
  );
}
