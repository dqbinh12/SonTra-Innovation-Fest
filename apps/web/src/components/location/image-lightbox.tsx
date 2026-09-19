'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import type { StrapiMedia } from '@sif/shared';
import { StrapiImage } from '@/components/strapi-image';
import { cn } from '@/lib/utils';

/**
 * The overlay the site plan opens into.
 *
 * A lightbox rather than a link to the raw upload: the plan is a dense drawing
 * whose booth numbers are unreadable at half a column, and sending the visitor
 * to a bare image URL loses the page. Keyboard handling is the whole reason
 * this is a component and not a `<dialog>` one-liner — Escape closes, and
 * focus lands on the close button so a keyboard user is never stranded behind
 * the overlay.
 */
function Overlay({
  media,
  onClose,
  closeLabel,
}: {
  media: StrapiMedia;
  onClose: () => void;
  closeLabel: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    // The page behind must not scroll while the overlay is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={media.alternativeText ?? closeLabel}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[color-mix(in_oklab,var(--color-brand-navy)_92%,black)]/95 p-4 backdrop-blur-sm sm:p-8"
      // Clicks on the backdrop close; clicks on the figure below stop there.
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="glass-invert absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full text-white sm:top-6 sm:right-6"
      >
        <X aria-hidden="true" className="size-5" />
      </button>

      <figure
        className="max-h-full w-full max-w-6xl overflow-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {/* `sizes` is deliberately 100vw: at this size the browser should pull
            the largest rendition, which is the point of opening it. */}
        <StrapiImage media={media} sizes="100vw" className="rounded-xl" />
        {media.caption && (
          <figcaption className="mt-4 text-center text-sm text-white">{media.caption}</figcaption>
        )}
      </figure>
    </div>
  );
}

export type LightboxLabels = {
  open: string;
  close: string;
};

/**
 * An image that opens full-screen when clicked.
 */
export function LightboxFigure({
  media,
  labels,
  className,
  imageClassName,
  sizes = '100vw',
  priority = false,
}: {
  media: StrapiMedia;
  labels: LightboxLabels;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('group relative block w-full cursor-zoom-in overflow-hidden', className)}
      >
        <StrapiImage media={media} sizes={sizes} priority={priority} className={imageClassName} />

        {/* Top-right, not bottom-right: a site plan puts its legend along the
            bottom edge, which is exactly what this badge was covering. */}
        <span className="glass-invert pointer-events-none absolute top-4 right-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white">
          <Maximize2 aria-hidden="true" className="size-3.5" />
          {labels.open}
        </span>
      </button>

      {open && <Overlay media={media} onClose={() => setOpen(false)} closeLabel={labels.close} />}
    </>
  );
}
