import Image from 'next/image';
import type { StrapiMedia } from '@sif/shared';
import { mediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/**
 * next/image for a Strapi upload.
 *
 * By default the image reserves its intrinsic space so it cannot shift the
 * layout on load. Pass `fill` when it is a background and the parent sets the
 * box — Strapi's dimensions are then irrelevant and `object-cover` applies.
 */
export function StrapiImage({
  media,
  className,
  sizes = '100vw',
  priority = false,
  fill = false,
}: {
  media: StrapiMedia | null | undefined;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const src = mediaUrl(media);
  if (!src || !media) return null;

  const alt = media.alternativeText ?? '';

  if (fill) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={media.width ?? 1200}
      height={media.height ?? 800}
      sizes={sizes}
      priority={priority}
      className={cn('h-auto w-full', className)}
    />
  );
}
