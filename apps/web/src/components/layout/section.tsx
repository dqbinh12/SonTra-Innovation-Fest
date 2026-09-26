import type { ReactNode } from 'react';
import { Container } from './container';
import { ScrollReveal } from '@/components/home/scroll-reveal';
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
    <section className={cn('relative overflow-x-clip py-12', className)}>
      <Container>
        {title && (
          <ScrollReveal direction="left">
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          </ScrollReveal>
        )}
        <div className={cn(title && 'mt-8')}>{children}</div>
      </Container>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}
