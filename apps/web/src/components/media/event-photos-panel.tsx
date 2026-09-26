import { getFormatter, getTranslations } from 'next-intl/server';
import { ExternalLink, FolderOpen, Images, QrCode } from 'lucide-react';
import type { PhotoAlbum } from '@sif/shared';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { StrapiImage } from '@/components/strapi-image';
import { QrCodeSvg } from '@/components/ui/qr-code';

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
    <section className="relative overflow-x-clip py-16 sm:py-20">
      <Container>
        <ScrollReveal direction="left" className="group max-w-2xl">
          <h2 className="text-lg font-bold tracking-tight sm:text-3xl">{t('title')}</h2>
          <span aria-hidden="true" className="rule-accent mt-5" />
          <p className="text-muted-foreground mt-6 text-base">{intro ?? t('lead')}</p>
        </ScrollReveal>

        {!drive && withLinks.length === 0 ? (
          <div className="mt-12">
            <EmptyState>{t('empty')}</EmptyState>
          </div>
        ) : (
          <>
            {drive && (
              <ScrollReveal direction="up-lg" className="mt-10">
                {/* The whole-drive link is the answer for most visitors, so it
                    gets the weight of a band rather than sitting as one card
                    among the albums. */}
                <div className="from-brand-blue to-brand-violet relative isolate flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8 text-white shadow-xl">
                  {/* Left content: Icon, Title, Description, Button */}
                  <div className="flex flex-1 flex-col items-start justify-center max-w-xl">
                    <div className="flex items-center gap-3.5">
                      <span
                        aria-hidden="true"
                        className="glass-invert flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-inner"
                      >
                        <Images className="size-6" />
                      </span>
                      <div>
                        <span className="text-xs font-bold tracking-widest text-brand-cyan uppercase">
                          Google Drive
                        </span>
                        <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
                          {t('openDrive')}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-white/85">
                      {t('driveNote')}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <a
                        href={drive}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-glow text-brand-blue inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold shadow-lg hover:bg-white/95 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {t('openDrive')}
                        <ExternalLink aria-hidden="true" className="size-4" />
                      </a>
                    </div>
                  </div>

                  {/* Right content: prominent dedicated QR code card */}
                  <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl self-center md:self-auto">
                    <QrCodeSvg
                      value={drive}
                      size={196}
                      className="rounded-xl shadow-md p-2 transition-transform duration-300 hover:scale-105"
                    />
                    <div className="mt-2 flex flex-col items-center text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-cyan">
                        <QrCode className="size-3.5" />
                        QR Code
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-white/85 max-w-[190px] leading-tight">
                        {t('scanDriveQr')}
                      </p>
                    </div>
                  </div>
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
                      <ScrollReveal direction="up" delay={Math.min(index, 5) * 60} className="h-full">
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

                            <h4 className="mt-2 text-base font-semibold">{album.title}</h4>
                            {album.description && (
                              <p className="text-muted-foreground mt-2 text-sm">
                                {album.description}
                              </p>
                            )}

                            <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                              <span className="text-primary inline-flex items-center gap-2 text-sm font-semibold">
                                {t('openAlbum')}
                                <ExternalLink aria-hidden="true" className="size-4" />
                              </span>
                              <div
                                title={t('scanQr')}
                                className="shrink-0 rounded-lg bg-black/5 dark:bg-white/10 p-1.5 transition-transform duration-200 group-hover:scale-105"
                              >
                                <QrCodeSvg value={album.driveUrl} size={54} />
                              </div>
                            </div>
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
