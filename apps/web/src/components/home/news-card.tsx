import type { Article } from '@sif/shared';
import { Link } from '@/i18n/navigation';
import { StrapiImage } from '@/components/strapi-image';

/**
 * Premium news card with image-scale hover, lift, and overlay gradient.
 *
 * Server component — the hover effects are CSS-only so no client JS is needed.
 */
export function NewsCard({ article }: { article: Article }) {
  return (
    <Link
      href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}
      className="group block overflow-hidden rounded-xl transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-blue/10"
    >
      {article.coverImage && (
        <div className="bg-muted relative aspect-video overflow-hidden rounded-xl">
          <StrapiImage
            media={article.coverImage}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {/* Gradient overlay on hover */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          {/* Date badge */}
          {article.date && (
            <span className="glass absolute right-3 top-3 rounded-md px-2.5 py-1 text-xs font-medium text-foreground">
              {new Date(article.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      )}
      <div className="pt-4">
        <h3 className="font-semibold transition-colors duration-200 group-hover:text-primary">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{article.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
