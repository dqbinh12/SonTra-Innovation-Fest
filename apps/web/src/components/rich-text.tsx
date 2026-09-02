'use client';

import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import type { RichText as RichTextValue } from '@sif/shared';
import { mediaUrl } from '@/lib/media';

/**
 * Renders a Strapi `blocks` field.
 *
 * This is a client component: BlocksRenderer is one, and the per-block render
 * functions below cannot cross the server/client boundary as props.
 *
 * @sif/shared types these as `unknown[]` so the shared package does not depend
 * on the renderer; the cast here is the single place that bridges the two.
 */
export function RichText({ content }: { content: RichTextValue | null | undefined }) {
  if (!content || content.length === 0) return null;

  return (
    <div className="space-y-4 leading-relaxed">
      <BlocksRenderer
        content={content as BlocksContent}
        blocks={{
          paragraph: ({ children }) => <p>{children}</p>,
          heading: ({ children, level }) => {
            const styles = {
              1: 'text-3xl font-bold tracking-tight mt-10',
              2: 'text-2xl font-bold tracking-tight mt-10',
              3: 'text-xl font-semibold mt-8',
              4: 'text-lg font-semibold mt-6',
              5: 'text-base font-semibold mt-6',
              6: 'text-sm font-semibold mt-6',
            } as const;
            const Tag = `h${level}` as const;
            return <Tag className={styles[level]}>{children}</Tag>;
          },
          list: ({ children, format }) =>
            format === 'ordered' ? (
              <ol className="list-decimal space-y-2 pl-6">{children}</ol>
            ) : (
              <ul className="list-disc space-y-2 pl-6">{children}</ul>
            ),
          'list-item': ({ children }) => <li>{children}</li>,
          quote: ({ children }) => (
            <blockquote className="border-primary text-muted-foreground border-l-4 pl-4 italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
              <code>{children}</code>
            </pre>
          ),
          link: ({ children, url }) => (
            <a href={url} className="text-primary underline underline-offset-4">
              {children}
            </a>
          ),
          image: ({ image }) => {
            const src = mediaUrl(image as never);
            if (!src) return null;
            return (
              /* Editor-inserted images have no known dimensions at build time,
                 so next/image cannot size them without a layout shift. */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={image.alternativeText ?? ''} className="h-auto w-full rounded-lg" />
            );
          },
        }}
        modifiers={{
          bold: ({ children }) => <strong className="font-semibold">{children}</strong>,
          italic: ({ children }) => <em>{children}</em>,
          underline: ({ children }) => <u>{children}</u>,
          strikethrough: ({ children }) => <s>{children}</s>,
          code: ({ children }) => (
            <code className="bg-muted rounded px-1 py-0.5 text-sm">{children}</code>
          ),
        }}
      />
    </div>
  );
}
