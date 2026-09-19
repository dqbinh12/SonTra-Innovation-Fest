import { getFormatter, getTranslations } from 'next-intl/server';
import { ArrowUpRight, Download, FileText } from 'lucide-react';
import type { PressRelease } from '@sif/shared';
import { mediaUrl } from '@/lib/media';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';

/**
 * Tab 2 — the press release kit.
 *
 * One row per release, newest first, each ending in a single action. Rows
 * rather than a card grid: releases are read as a chronological list, and a
 * grid of three-line cards makes the newest one no easier to find than the
 * oldest.
 */
export async function PressReleasesPanel({
  releases,
  intro,
}: {
  releases: PressRelease[];
  intro?: string | null;
}) {
  const t = await getTranslations('media.pressReleases');
  const format = await getFormatter();

  // The CMS list is in whatever order the editor dragged it into; the page
  // guarantees newest first.
  const sorted = [...releases].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <ScrollReveal className="group max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</h2>
          <span aria-hidden="true" className="rule-accent mt-5" />
          <p className="text-muted-foreground mt-6 text-lg">{intro ?? t('lead')}</p>
        </ScrollReveal>

        {sorted.length === 0 ? (
          <div className="mt-12">
            <EmptyState>{t('empty')}</EmptyState>
          </div>
        ) : (
          <ul className="border-border mt-12 border-t">
            {sorted.map((release, index) => {
              const file = mediaUrl(release.file);
              const href = file ?? release.externalUrl?.trim() ?? null;
              const isFile = Boolean(file);

              return (
                <li key={`${release.title}-${index}`}>
                  <ScrollReveal delay={Math.min(index, 5) * 60}>
                    <article className="border-border hover:bg-secondary/40 flex flex-wrap items-start gap-x-8 gap-y-4 border-b px-2 py-8 transition-colors sm:flex-nowrap">
                      <span
                        aria-hidden="true"
                        className="text-primary bg-primary/10 hidden size-11 shrink-0 items-center justify-center rounded-xl sm:inline-flex"
                      >
                        <FileText className="size-5" />
                      </span>

                      <div className="min-w-[14rem] flex-1">
                        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                          <time dateTime={release.date}>
                            {format.dateTime(new Date(release.date), { dateStyle: 'long' })}
                          </time>
                          {release.category && (
                            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 font-semibold tracking-wide uppercase">
                              {release.category}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-balance">{release.title}</h3>
                        {release.summary && (
                          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                            {release.summary}
                          </p>
                        )}
                      </div>

                      {href && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-border hover:border-primary hover:text-primary inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
                        >
                          {isFile ? t('download') : t('read')}
                          {isFile ? (
                            <Download aria-hidden="true" className="size-4" />
                          ) : (
                            <ArrowUpRight aria-hidden="true" className="size-4" />
                          )}
                          {/* The link text repeats across every row, so the
                              accessible name carries the release it belongs to. */}
                          <span className="sr-only">— {release.title}</span>
                        </a>
                      )}
                    </article>
                  </ScrollReveal>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
