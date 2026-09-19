import { getFormatter, getTranslations } from 'next-intl/server';
import { ExternalLink, FolderOpen, Images } from 'lucide-react';
import type { PhotoAlbum } from '@sif/shared';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { StrapiImage } from '@/components/strapi-image';

/**
 * Tab 4 — event photography.
 *
 * The photos live in Google Drive, so this tab is a set of doors rather than a
 * gallery: one primary link to the whole drive, and a card per album for the
 * desks that want a single day or session. Nothing here re-hosts the images —
 * a card's cover is the only file Strapi holds, and only when an editor sets
 * one.
 */
export async function EventPhotosPanel({
  albums,
  driveUrl,
  intro,
  credit,
}: {
  albums: PhotoAlbum[];
  driveUrl?: string | null;
  intro?: string | null;
  credit?: string | null;
}) {
  const t = await getTranslations('media.photos');
  const format = await getFormatter();

  const drive = driveUrl?.trim();
  const withLinks = albums.filter((album) => album.driveUrl?.trim());

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <ScrollReveal className="group max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</h2>
          <span aria-hidden="true" className="rule-accent mt-5" />
          <p className="text-muted-foreground mt-6 text-lg">{intro ?? t('lead')}</p>
        </ScrollReveal>

        {!drive && withLinks.length === 0 ? (
          <div className="mt-12">
            <EmptyState>{t('empty')}</EmptyState>
          </div>
        ) : (
          <>
            {drive && (
              <ScrollReveal className="mt-10">
                {/* The whole-drive link is the answer for most visitors, so it
                    gets the weight of a band rather than sitting as one card
                    among the albums. */}
                <div className="from-brand-blue to-brand-violet relative isolate flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-2xl bg-gradient-to-br px-8 py-10 text-white">
                  <div className="flex items-center gap-5">
                    <span
                      aria-hidden="true"
                      className="glass-invert hidden size-14 shrink-0 items-center justify-center rounded-2xl sm:inline-flex"
                    >
                      <Images className="size-7" />
                    </span>
                    <div>
                      <p className="text-lg font-semibold">{t('openDrive')}</p>
                      <p className="mt-1 max-w-md text-sm text-white">{t('driveNote')}</p>
                    </div>
                  </div>

                  {/* White-filled: a blue button on the blue-violet ground is invisible. */}
                  <a
                    href={drive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glow text-brand-blue inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold"
                  >
                    {t('openDrive')}
                    <ExternalLink aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </ScrollReveal>
            )}

            {withLinks.length > 0 && (
              <div className="mt-14">
                <h3 className="text-sm font-semibold tracking-widest uppercase">
                  {t('albumsTitle')}
                </h3>

                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {withLinks.map((album, index) => (
                    <li key={`${album.title}-${index}`}>
                      <ScrollReveal delay={Math.min(index, 5) * 60} className="h-full">
                        {/* The whole card is the link — an album has one
                            destination, and a card with a single small link in
                            it wastes the target area. */}
                        <a
                          href={album.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group glass lift flex h-full flex-col overflow-hidden rounded-2xl"
                        >
                          <div className="bg-muted relative aspect-[3/2] overflow-hidden">
                            {album.coverImage ? (
                              <StrapiImage
                                media={album.coverImage}
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="from-brand-blue/15 to-brand-cyan/15 text-primary absolute inset-0 flex items-center justify-center bg-gradient-to-br"
                              >
                                <FolderOpen className="size-10" />
                              </span>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col p-6">
                            <p className="text-muted-foreground text-xs">
                              {album.date && (
                                <>
                                  <time dateTime={album.date}>
                                    {format.dateTime(new Date(album.date), { dateStyle: 'long' })}
                                  </time>
                                  {album.photoCount ? ' · ' : null}
                                </>
                              )}
                              {album.photoCount
                                ? t('photoCount', { count: album.photoCount })
                                : null}
                            </p>

                            <h4 className="mt-2 text-lg font-semibold">{album.title}</h4>
                            {album.description && (
                              <p className="text-muted-foreground mt-2 text-sm">
                                {album.description}
                              </p>
                            )}

                            <span className="text-primary mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold">
                              {t('openAlbum')}
                              <ExternalLink aria-hidden="true" className="size-4" />
                            </span>
                          </div>
                        </a>
                      </ScrollReveal>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {credit && <p className="text-muted-foreground mt-12 text-xs">{credit}</p>}
      </Container>
    </section>
  );
}
