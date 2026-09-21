'use client';

import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import type { RichText as RichTextValue } from '@sif/shared';
import { mediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/**
 * Renders a Strapi `blocks` field.
 *
 * This is a client component: BlocksRenderer is one, and the per-block render
 * functions below cannot cross the server/client boundary as props.
 *
 * @sif/shared types these as `unknown[]` so the shared package does not depend
 * on the renderer; the cast here is the single place that bridges the two.
 */
export function RichText({
  content,
  className,
  variant = 'default',
}: {
  content: RichTextValue | null | undefined;
  className?: string;
  variant?: 'default' | 'story';
}) {
  if (!content || content.length === 0) return null;

  const isStory = variant === 'story';

  return (
    <div
      className={cn(isStory ? 'space-y-0 leading-relaxed' : 'space-y-4 leading-relaxed', className)}
    >
      <BlocksRenderer
        content={content as BlocksContent}
        blocks={{
          paragraph: ({ children }) => (
            <p
              className={
                isStory
                  ? 'text-foreground/76 dark:text-foreground/70 text-sm leading-[1.6]'
                  : undefined
              }
            >
              {children}
            </p>
          ),
          heading: ({ children, level }) => {
            const styles = {
              1: 'text-3xl font-bold tracking-tight mt-10',
              2: 'text-2xl font-bold tracking-tight mt-10',
              3: 'text-xl font-semibold mt-8',
              4: 'text-lg font-semibold mt-6',
              5: 'text-base font-semibold mt-6',
              6: 'text-sm font-semibold mt-6',
            } as const;

            const storyHeadingStyles = {
              1: 'mt-6 mb-2.5 first:mt-0 text-xl font-bold tracking-tight text-foreground sm:text-2xl',
              2: 'mt-5 mb-2 first:mt-0 text-lg font-bold tracking-tight text-foreground sm:text-xl',
              3: 'mt-4 mb-1.5 first:mt-0 text-base font-bold tracking-tight text-foreground sm:text-lg',
              4: 'mt-3.5 mb-1 first:mt-0 text-sm font-semibold text-foreground sm:text-base',
              5: 'mt-3 mb-1 first:mt-0 text-sm font-semibold text-foreground',
              6: 'mt-3 mb-1 first:mt-0 text-xs font-semibold text-foreground',
            } as const;

            const Tag = `h${level}` as const;
            return (
              <Tag className={isStory ? storyHeadingStyles[level] : styles[level]}>{children}</Tag>
            );
          },
          list: ({ children, format }) =>
            format === 'ordered' ? (
              <ol className="list-decimal space-y-2 pl-6">{children}</ol>
            ) : (
              <ul className="list-disc space-y-2 pl-6">{children}</ul>
            ),
          'list-item': ({ children }) => <li>{children}</li>,
          quote: ({ children }) => (
            <blockquote
              className={cn(
                'border-l-4 pl-4',
                isStory
                  ? 'my-3 rounded-r-xl border-brand-blue bg-muted/40 px-4 py-3 text-sm leading-[1.6] font-normal text-foreground/76 not-italic dark:border-brand-cyan dark:bg-muted/20 dark:text-foreground/70'
                  : 'border-primary text-muted-foreground italic',
              )}
            >
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
              <img
                src={src}
                alt={image.alternativeText ?? ''}
                className="h-auto w-full rounded-lg"
              />
            );
          },
        }}
        modifiers={{
          bold: ({ children }) => <strong className="font-semibold">{children}</strong>,
          italic: ({ children }) => <em>{children}</em>,
          underline: ({ children }) => <u>{children}</u>,
          strikethrough: ({ children }) => <s>{children}</s>,
          code: ({ children }) => (
            <code
              className={cn(
                'rounded px-1.5 py-0.5 text-sm',
                isStory
                  ? 'bg-brand-blue/10 dark:bg-brand-cyan/15 text-brand-blue dark:text-brand-cyan font-mono font-semibold border border-brand-blue/20 dark:border-brand-cyan/30 text-xs sm:text-[13px]'
                  : 'bg-muted',
              )}
            >
              {children}
            </code>
          ),
        }}
      />
    </div>
  );
}
