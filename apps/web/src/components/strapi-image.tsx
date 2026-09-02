import Image from 'next/image';
import type { StrapiMedia } from '@sif/shared';
import { mediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/**
 * next/image for a Strapi upload. Strapi returns intrinsic dimensions, so the
 * image reserves its space and does not shift the layout on load.
 */
export function StrapiImage({
  media,
  className,
  sizes = '100vw',
  priority = false,
}: {
  media: StrapiMedia | null | undefined;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = mediaUrl(media);
  if (!src || !media) return null;

  return (
    <Image
      src={src}
      alt={media.alternativeText ?? ''}
      width={media.width ?? 1200}
      height={media.height ?? 800}
      sizes={sizes}
      priority={priority}
      className={cn('h-auto w-full', className)}
    />
  );
}
