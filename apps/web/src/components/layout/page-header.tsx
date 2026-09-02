import type { ReactNode } from 'react';
import { Container } from './container';

export function PageHeader({ title, lead }: { title: string; lead?: ReactNode }) {
  return (
    <div className="border-border border-b py-12 sm:py-16">
      <Container>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
        {lead && <p className="text-muted-foreground mt-4 max-w-2xl text-lg">{lead}</p>}
      </Container>
    </div>
  );
}
