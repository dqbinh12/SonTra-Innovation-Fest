import { getTranslations } from 'next-intl/server';
import {
  ArrowUpRight,
  BookOpen,
  Download,
  FileBadge,
  Image as ImageIcon,
  Package,
  Shapes,
  Video,
} from 'lucide-react';
import type { MediaKitCategory, MediaKitItem } from '@sif/shared';
import { mediaUrl } from '@/lib/media';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { RichText } from '@/components/rich-text';

/**
 * Icon and accent per asset type, drawn from the same brand gradients as the
 * Attend page's audience cards so the two grids read as one system.
 */
const CATEGORIES: Record<MediaKitCategory, { icon: typeof Package; accent: string }> = {
  logo: { icon: Shapes, accent: 'from-brand-cyan/25 to-brand-blue/20' },
  guidelines: { icon: BookOpen, accent: 'from-brand-blue/25 to-brand-violet/20' },
  'fact-sheet': { icon: FileBadge, accent: 'from-brand-mint/25 to-brand-teal/20' },
  'key-visual': { icon: ImageIcon, accent: 'from-brand-violet/25 to-brand-purple/20' },
  video: { icon: Video, accent: 'from-brand-teal/25 to-brand-blue/20' },
  other: { icon: Package, accent: 'from-brand-cyan/25 to-brand-mint/20' },
};

function category(value: MediaKitCategory) {
  return CATEGORIES[value] ?? CATEGORIES.other;
}

/**
 * Tab 3 — the media kit: logos, guidelines, fact sheets, key visuals, b-roll.
 *
 * A card grid here rather than the list used for releases: these are parallel
 * assets picked by kind, not a sequence read by date.
 */
export async function MediaKitPanel({
  items,
  intro,
  usage,
}: {
  items: MediaKitItem[];
  intro?: string | null;
  usage?: unknown[] | null;
}) {
  const t = await getTranslations('media.mediaKit');

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <ScrollReveal className="group max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</h2>
          <span aria-hidden="true" className="rule-accent mt-5" />
          <p className="text-muted-foreground mt-6 text-lg">{intro ?? t('lead')}</p>
        </ScrollReveal>

        {items.length === 0 ? (
          <div className="mt-12">
            <EmptyState>{t('empty')}</EmptyState>
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const { icon: Icon, accent } = category(item.category);
              const file = mediaUrl(item.file);
              const href = file ?? item.externalUrl?.trim() ?? null;
              const isFile = Boolean(file);

              return (
                <li key={`${item.title}-${index}`}>
                  <ScrollReveal delay={Math.min(index, 5) * 60} className="h-full">
                    <article className="group glass lift flex h-full flex-col rounded-2xl p-6">
                      <span
                        aria-hidden="true"
                        className={`text-primary inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}
                      >
                        <Icon className="size-6" />
                      </span>

                      <p className="text-muted-foreground mt-5 text-xs font-semibold tracking-widest uppercase">
                        {t(`categories.${item.category}`)}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                      {item.description && (
                        <p className="text-muted-foreground mt-2 text-sm">{item.description}</p>
                      )}

                      {/* mt-auto pins the action to the bottom so a row of
                          cards with uneven copy still lines its buttons up. */}
                      <div className="mt-auto pt-6">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary inline-flex items-center gap-2 text-sm font-semibold"
                          >
                            {isFile ? t('download') : t('open')}
                            {isFile ? (
                              <Download aria-hidden="true" className="size-4" />
                            ) : (
                              <ArrowUpRight aria-hidden="true" className="size-4" />
                            )}
                            <span className="sr-only">— {item.title}</span>
                          </a>
                        ) : null}
                        {item.fileLabel && (
                          <p className="text-muted-foreground mt-2 text-xs">{item.fileLabel}</p>
                        )}
                      </div>
                    </article>
                  </ScrollReveal>
                </li>
              );
            })}
          </ul>
        )}

        {usage && usage.length > 0 && (
          <ScrollReveal className="mt-16">
            <div className="glass rounded-2xl p-8">
              <h3 className="text-sm font-semibold tracking-widest uppercase">{t('usageTitle')}</h3>
              <div className="text-muted-foreground mt-5 max-w-3xl text-sm">
                <RichText content={usage} />
              </div>
            </div>
          </ScrollReveal>
        )}
      </Container>
    </section>
  );
}
