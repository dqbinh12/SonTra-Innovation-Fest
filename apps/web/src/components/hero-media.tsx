import { getImageProps } from 'next/image';
import type { StrapiMedia } from '@sif/shared';
import { mediaUrl } from '@/lib/media';
import { StrapiImage } from './strapi-image';
import { HeroVideoLayer } from './hero-video-layer';
import { cn } from '@/lib/utils';

/** Below this the phone artwork is used. Matches Tailwind's `sm`. */
const MOBILE_MAX = 639;

/**
 * Which scrim the hero copy needs.
 *
 * `edge` fades from the top and, above `xl`, from the left — it protects a
 * left-aligned column (the Attend page). `centre` darkens the middle of the
 * frame instead, for copy centred on a full-bleed stage (the homepage). They
 * are not interchangeable: an edge scrim leaves the middle of the frame open,
 * which is exactly where centred copy sits.
 */
type HeroScrim = 'edge' | 'centre';

interface HeroMediaProps {
  /** Wide / desktop artwork. */
  desktop: StrapiMedia | null | undefined;
  /** Portrait crop for phones. Falls back to `desktop` when unset. */
  mobile?: StrapiMedia | null;
  /** Defaults to `edge`, which is what the left-aligned page heroes want. */
  scrim?: HeroScrim;
}

const isVideo = (media: StrapiMedia) => Boolean(media.mime?.startsWith('video/'));

/**
 * The hero background, art-directed: a portrait crop on phones and the wide
 * artwork above 640px.
 *
 * Images go through one <picture> with two <source> elements, which is the
 * pattern next/image documents for art direction — the browser downloads only
 * the source it picks. Rendering two <Image> elements and hiding one with CSS
 * would make phones pay for the desktop artwork too.
 *
 * The scrim over the artwork is load-bearing, not decoration. The hero is a
 * dark navy band in both themes and its copy is white, so the scrim is built
 * from `--color-brand-navy` rather than `--background` — a light-mode scrim
 * would put white text on a white wash. Which one you get depends on where the
 * copy sits; see `HeroScrim`.
 *
 * `edge` runs top-to-bottom below `xl` and left-to-right above it, because a
 * horizontal fade only works once the text occupies the left third — at tablet
 * widths the text spans most of the viewport and a horizontal scrim cannot
 * cover it. Its stops are lighter than the ones that protected the old
 * dark-grey hero copy: white text needs far less cover than #526785 did, and
 * at the old 0.92 the artwork was a navy smear. Re-measured worst-case with
 * the method in docs/brand.md — headline 6.59 / 5.95 / 4.12 and subtitle
 * 7.22 / 6.36 / 6.80 at 390 / 768 / 1280.
 *
 * `centre` is `.hero-scrim` in globals.css, with its own measurements recorded
 * there.
 *
 * Any new artwork must be re-measured against the scrim it will sit under;
 * docs/brand.md records the method.
 */
export function HeroMedia({ desktop, mobile, scrim = 'edge' }: HeroMediaProps) {
  const wide = desktop ?? mobile ?? null;
  const small = mobile ?? desktop ?? null;
  if (!wide || !small) return null;

  return (
    <div className="absolute inset-0 -z-10">
      {isVideo(wide) || isVideo(small) ? (
        <HeroLayers wide={wide} small={small} hasDedicatedMobile={Boolean(mobile)} scrim={scrim} />
      ) : (
        <HeroPicture wide={wide} small={small} hasDedicatedMobile={Boolean(mobile)} scrim={scrim} />
      )}

      {scrim === 'centre' ? (
        <div aria-hidden="true" className="hero-scrim absolute inset-0" />
      ) : (
        <div
          aria-hidden="true"
          className="from-brand-navy/95 via-brand-navy/78 to-brand-navy/45 via-60% xl:from-brand-navy/92 xl:via-brand-navy/70 xl:via-50% xl:to-brand-navy/15 absolute inset-0 bg-gradient-to-b xl:bg-gradient-to-r"
        />
      )}
    </div>
  );
}

/**
 * `object-position` per breakpoint.
 *
 * Under the `centre` scrim the crop has to come off both sides evenly —
 * anchoring to one edge takes the whole of it off the other and slides the
 * subject out from under the centred copy.
 *
 * Under `edge`, with a dedicated phone crop the subject is already centred for
 * portrait. With only the wide artwork to work with, phones use `object-left`:
 * on the supplied image that lands the text over pale sky instead of tree
 * shadow, which needs a 0.66 scrim rather than 0.88 — the difference between a
 * visible photo and a white smear.
 */
function objectPosition(hasDedicatedMobile: boolean, scrim: HeroScrim) {
  if (scrim === 'centre') return 'object-center';

  return cn(
    hasDedicatedMobile ? 'object-center' : 'object-left',
    'sm:object-left xl:object-right',
  );
}

function HeroPicture({
  wide,
  small,
  hasDedicatedMobile,
  scrim,
}: {
  wide: StrapiMedia;
  small: StrapiMedia;
  hasDedicatedMobile: boolean;
  scrim: HeroScrim;
}) {
  // `priority` matters: getImageProps defaults to loading="lazy", and this is
  // the LCP element. Without it the hero is deferred and the page paints empty.
  //
  // No `quality` override: Next 16 only permits the values in
  // `images.qualities`, which defaults to [75]. Anything else 400s at the
  // optimizer, and the prop is silently dropped from the srcSet.
  const common = { alt: '', sizes: '100vw', priority: true } as const;

  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({
    ...common,
    src: mediaUrl(wide)!,
    width: wide.width ?? 1920,
    height: wide.height ?? 1080,
  });

  const {
    props: { srcSet: smallSrcSet, ...rest },
  } = getImageProps({
    ...common,
    src: mediaUrl(small)!,
    width: small.width ?? 828,
    height: small.height ?? 1200,
  });

  return (
    <picture>
      <source media={`(min-width: ${MOBILE_MAX + 1}px)`} srcSet={wideSrcSet} />
      <source srcSet={smallSrcSet} />
      <img
        {...rest}
        // Decorative: the hero's meaning is in the heading beside it.
        alt=""
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          objectPosition(hasDedicatedMobile, scrim),
        )}
      />
    </picture>
  );
}

/**
 * Video cannot participate in <picture>, so each breakpoint gets its own layer
 * and CSS hides the one it does not want. That means the browser may fetch and
 * decode both sources — unavoidable, and the reason the single-asset case below
 * is special-cased.
 */
function HeroLayers({
  wide,
  small,
  hasDedicatedMobile,
  scrim,
}: {
  wide: StrapiMedia;
  small: StrapiMedia;
  hasDedicatedMobile: boolean;
  scrim: HeroScrim;
}) {
  const position = objectPosition(hasDedicatedMobile, scrim);

  // No phone crop uploaded, so `wide` and `small` are the same asset. Rendering
  // it twice would put two <video> elements on the same source on the page —
  // one network fetch, but two decoders running for a file that can be several
  // megabytes. One layer, no breakpoint class.
  if (!hasDedicatedMobile) return <HeroLayer media={wide} className={position} />;

  return (
    <>
      <HeroLayer media={small} className={cn('sm:hidden', position)} />
      <HeroLayer media={wide} className={cn('hidden sm:block', position)} />
    </>
  );
}

function HeroLayer({ media, className }: { media: StrapiMedia; className: string }) {
  const src = mediaUrl(media);
  if (!src) return null;

  // Client component: it pauses itself under `prefers-reduced-motion`, which
  // CSS cannot do and this server component cannot either.
  if (isVideo(media)) return <HeroVideoLayer src={src} className={className} />;

  // Still optimized: only the <picture> path needs raw <img>, and this layer
  // is a plain image sitting beside a video one.
  return (
    <StrapiImage
      media={media}
      fill
      priority
      sizes="100vw"
      className={cn('object-cover', className)}
    />
  );
}
