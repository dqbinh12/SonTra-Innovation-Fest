import type { StrapiMedia } from '@sif/shared';
import { mediaUrl } from '@/lib/media';
import { StrapiImage } from './strapi-image';

/**
 * The hero background. The CMS field accepts images and video (Content
 * Structure tab: "background image/video"), so both are handled here.
 *
 * The scrim is load-bearing, not decoration. Hero text is `muted-foreground`
 * (#526785), which needs a light ground to clear WCAG AA — unprotected it
 * measured 1.99:1 over the artwork's darker regions.
 *
 * The gradient runs top-to-bottom below `xl` and left-to-right at `xl` and up.
 * A horizontal fade only works once the container is wide enough that the text
 * occupies the left third; at tablet widths the text spans most of the viewport
 * and a horizontal scrim cannot cover it.
 *
 * Any replacement image must be re-measured: a darker photo needs a heavier
 * scrim, or the text colour has to change. docs/brand.md records the method.
 */
export function HeroMedia({ media }: { media: StrapiMedia }) {
  const src = mediaUrl(media);
  if (!src) return null;

  const isVideo = media.mime?.startsWith('video/');

  return (
    <div className="absolute inset-0 -z-10">
      {isVideo ? (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          // Decorative background: no controls, and it must never grab focus.
          tabIndex={-1}
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      ) : (
        <StrapiImage
          media={media}
          fill
          priority
          sizes="100vw"
          // Below xl the text spans most of the width, so the crop lands on
          // object-left — the artwork's pale sky — rather than the tree shadow
          // on the right. Measured; see docs/brand.md.
          className="object-cover object-left xl:object-right"
        />
      )}

      <div
        aria-hidden="true"
        className="from-background via-background/88 to-background/72 xl:via-background/92 absolute inset-0 bg-gradient-to-b xl:bg-gradient-to-r xl:to-transparent"
      />
    </div>
  );
}
