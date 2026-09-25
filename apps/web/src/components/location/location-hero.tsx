import { getTranslations } from 'next-intl/server';
import { Clock, Compass, MapPin, Navigation } from 'lucide-react';
import type { StrapiMedia } from '@sif/shared';
import { Container } from '@/components/layout/container';
import { LightboxFigure } from './image-lightbox';
import { LocationBackdrop } from './location-backdrop';
import { cn } from '@/lib/utils';

/**
 * The whole answer, on the first screen.
 *
 * Three earlier shapes are folded into this one. It was a full-height hero
 * with the map a scroll below; then the map moved up beside the copy; then the
 * site plan hid behind a switch on that map. Each step traded a scroll for a
 * click, and the last one still cost a click: a visitor comparing "where in
 * the city" with "where inside the ground" had to flip between two views to do
 * it. So both are on screen at once, side by side, and the copy is a band
 * above them rather than a column beside them — that is the only arrangement
 * where two wide rectangles both stay big enough to read.
 *
 * No ScrollReveal anywhere in here. Everything is above the fold by design,
 * and content that fades in on load is content the visitor waits for.
 *
 * The ground behind all of it is `<LocationBackdrop>` — the Han River and the
 * streets around the venue, drawn from map data rather than from a gradient.
 * It replaced the grid motif and the two blurred streaks this page used to
 * share with About, which were abstract and said nothing about the place. See
 * that component for the artwork and globals.css for the two masks that keep
 * the copy clear of it.
 *
 * The top padding is load-bearing: the header is `fixed` on this route, so it
 * takes up no flow space and this block has to leave room for it. Change one
 * and the other has to move — see the immersive-route note in site-header.tsx.
 */
export async function LocationHero({
  title,
  lead,
  venueName,
  address,
  openingHours,
  latitude,
  longitude,
  embedSrc,
  venueMap,
  venueMapCaption,
  mapsHref,
  directionsHref,
  copyButton,
}: {
  title: string;
  lead?: string | null;
  venueName?: string | null;
  address: string;
  openingHours?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  embedSrc: string;
  venueMap?: StrapiMedia | null;
  venueMapCaption?: string | null;
  mapsHref: string;
  directionsHref: string;
  copyButton?: React.ReactNode;
}) {
  const t = await getTranslations('location');

  const coordinates =
    latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : null;

  // One height for both frames so the row reads as a pair rather than two
  // unrelated boxes. Deliberately shorter than when the map had the column to
  // itself — two frames plus the copy band have to share one viewport.
  const frameHeight = 'h-[clamp(14rem,32vh,22rem)]';

  return (
    <header className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-36">
      <LocationBackdrop />

      <Container className="relative">
        {/* ─── The copy band ───────────────────────────────────────────────
            Title on the left, the address and its two actions on the right.
            They sit on one line at `items-end` so the buttons and the last
            line of the address share a baseline instead of floating. */}
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <div className="max-w-xl">
            <p className="glass-invert inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white uppercase">
              <span aria-hidden="true" className="bg-brand-mint size-1.5 rounded-full" />
              {t('eyebrow')}
            </p>

            {/* A step smaller than the About hero's: this headline shares a
                screen with two map frames instead of owning one. */}
            <h1 className="gradient-text-aurora mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {title}
            </h1>

            {/* Solid white, not white/85: 16px regular is body text by WCAG's
                reckoning and needs 4.5:1, which softened white misses here. */}
            {lead && <p className="mt-5 text-base text-white">{lead}</p>}
          </div>

          <div>
            <address className="flex gap-4 not-italic">
              <MapPin aria-hidden="true" className="text-brand-cyan mt-1 size-6 shrink-0" />
              <span>
                {venueName && <span className="block text-xl font-semibold">{venueName}</span>}
                <span className="mt-1 block max-w-xs whitespace-pre-line text-white">
                  {address}
                </span>
                {copyButton && <span className="mt-3 block">{copyButton}</span>}
              </span>
            </address>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                <Navigation aria-hidden="true" className="size-4" />
                {t('getDirections')}
              </a>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-invert lift inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
              >
                <MapPin aria-hidden="true" className="size-4" />
                {t('openInMaps')}
              </a>
            </div>
          </div>
        </div>

        {/* ─── The two views, together ─────────────────────────────────────
            The same place at two zoom levels. With no site plan uploaded the
            map takes the full width rather than sitting in half of an empty
            row. */}
        <div className={cn('mt-8 grid gap-5', venueMap && 'lg:grid-cols-2')}>
          <figure>
            <figcaption className="text-brand-cyan mb-3 text-xs font-semibold tracking-widest uppercase">
              {t('map.labels.map')}
            </figcaption>
            {/* The frame is padded glass rather than a bare iframe: Google's
                embed is a light-themed rectangle, and dropped straight onto
                this navy ground it reads as a hole in the page. */}
            <div className="glass overflow-hidden rounded-2xl p-2 sm:p-3">
              <iframe
                src={embedSrc}
                title={t('map.frameTitle')}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className={cn('w-full rounded-xl border-0', frameHeight)}
              />
            </div>
          </figure>

          {venueMap && (
            <figure>
              <figcaption className="text-brand-cyan mb-3 text-xs font-semibold tracking-widest uppercase">
                {t('map.labels.plan')}
              </figcaption>
              <div className="glass overflow-hidden rounded-2xl p-2 sm:p-3">
                {/* `object-contain` inside the shared height: the plan is a
                    wide drawing and cropping it to the map's box would cut off
                    the gates at either end. Half a column is not enough to
                    read booth numbers at — hence the lightbox. */}
                <LightboxFigure
                  media={venueMap}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="rounded-xl"
                  imageClassName={cn('rounded-xl object-contain', frameHeight)}
                  labels={{ open: t('plan.open'), close: t('lightbox.close') }}
                />
              </div>
              <p className="mt-3 text-sm text-white/80">{venueMapCaption ?? t('plan.caption')}</p>
            </figure>
          )}
        </div>

        {/* Hours and coordinates are reference, not action — a thin rule at
            the foot of the block rather than a card competing with the two
            frames above it. */}
        {(openingHours || coordinates) && (
          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-5 text-sm">
            {openingHours && (
              <div className="flex gap-3">
                <Clock aria-hidden="true" className="text-brand-cyan mt-0.5 size-4 shrink-0" />
                <div>
                  <dt className="text-xs font-semibold tracking-widest uppercase">{t('hours')}</dt>
                  <dd className="mt-1 whitespace-pre-line">{openingHours}</dd>
                </div>
              </div>
            )}

            {coordinates && (
              <div className="flex gap-3">
                <Compass aria-hidden="true" className="text-brand-cyan mt-0.5 size-4 shrink-0" />
                <div>
                  <dt className="text-xs font-semibold tracking-widest uppercase">
                    {t('map.coordinates')}
                  </dt>
                  <dd className="mt-1 font-mono text-xs">{coordinates}</dd>
                </div>
              </div>
            )}
          </dl>
        )}
      </Container>
    </header>
  );
}
