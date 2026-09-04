import type { ReactNode } from 'react';
import { Container } from './container';

/** `aside` sits to the right of the title on wide screens, under it on narrow. */
export function PageHeader({
  title,
  lead,
  aside,
}: {
  title: string;
  lead?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="border-border border-b py-12 sm:py-16">
      <Container className="flex flex-wrap items-start justify-between gap-8">
        {/* A min width, not `min-w-0`: without it the title column shrinks to
            fit the aside beside it on a phone instead of wrapping under it. */}
        <div className="min-w-[16rem] flex-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
          {lead && <p className="text-muted-foreground mt-4 max-w-2xl text-lg">{lead}</p>}
        </div>
        {aside}
      </Container>
    </div>
  );
}
