import type { ReactNode } from 'react';
import { Container } from './container';
import { cn } from '@/lib/utils';

export function Section({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('py-12', className)}>
      <Container>
        {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
        <div className={cn(title && 'mt-8')}>{children}</div>
      </Container>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}
