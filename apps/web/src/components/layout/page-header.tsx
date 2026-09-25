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
    <div className="border-border border-b py-8 sm:py-12 lg:py-14">
      <Container className="flex flex-wrap items-start justify-between gap-6 sm:gap-8">
        <div className="min-w-[16rem] flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {lead && (
            <p className="text-muted-foreground mt-2.5 max-w-2xl text-xs sm:text-sm leading-relaxed">
              {lead}
            </p>
          )}
        </div>
        {aside}
      </Container>
    </div>
  );
}
