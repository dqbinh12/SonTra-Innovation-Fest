import { Container } from '@/components/layout/container';

/**
 * Ultra-compact About page header (Option 3).
 *
 * Keeps vertical height minimal so the core content (Event at a glance and
 * story) appears immediately above the fold. Top padding accounts for the
 * fixed site header.
 */
export function AboutHero({
  title,
  tagline,
  badge = 'SIF 2026',
}: {
  title: string;
  tagline?: string | null;
  badge?: string | null;
}) {
  return (
    <header className="relative border-b border-border/40 bg-background/25 pt-24 pb-5 sm:pt-28 sm:pb-6">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2.5 sm:gap-3.5">
          {badge && (
            <span className="glass-invert inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wider text-brand-cyan uppercase shrink-0">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-mint" />
              {badge}
            </span>
          )}

          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span>{title}</span>
            {tagline && (
              <span className="text-sm sm:text-base font-normal text-muted-foreground">
                <span aria-hidden="true">/ </span>
                {tagline}
              </span>
            )}
          </h1>
        </div>
      </Container>
    </header>
  );
}
