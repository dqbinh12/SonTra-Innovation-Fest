import { ArrowUpRight, Clock, Newspaper } from 'lucide-react';
import type { Article } from '@sif/shared';
import { Link } from '@/i18n/navigation';
import { StrapiImage } from '@/components/strapi-image';
import { estimateReadingTime } from '@/lib/reading-time';

interface NewsCardProps {
  article: Article;
  formatDate: (date: string) => string;
  readMoreLabel: string;
  readingTimeLabel: (minutes: number) => string;
}

export function NewsCard({ article, formatDate, readMoreLabel, readingTimeLabel }: NewsCardProps) {
  const readingTime = estimateReadingTime(article.body || article.excerpt);

  return (
    <article className="flex h-full">
      <Link
        href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}
        className="group glass lift relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 transition-all duration-300 hover:border-brand-cyan/60 hover:shadow-[0_12px_36px_-10px_rgba(78,226,255,0.22)]"
      >
        {/* Cover Media */}
        <div className="bg-brand-navy relative aspect-[16/10] shrink-0 overflow-hidden">
          {article.coverImage ? (
            <StrapiImage
              media={article.coverImage}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-navy via-brand-blue/30 to-brand-navy">
              <div aria-hidden="true" className="bg-tech-grid absolute inset-0 opacity-20" />
              <Newspaper
                aria-hidden="true"
                className="size-10 text-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-cyan/40"
                strokeWidth={1.5}
              />
            </div>
          )}

          {/* Category Pill floating top-left */}
          <span className="glass-invert absolute top-3 left-3 z-10 rounded-md border border-brand-cyan/25 px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-brand-cyan uppercase backdrop-blur-md">
            {article.category || 'SIF 2026'}
          </span>

          {/* Scrim Overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40"
          />
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span aria-hidden="true" className="text-white/20">
              •
            </span>
            <span className="inline-flex items-center gap-1 text-brand-cyan/90">
              <Clock aria-hidden="true" className="size-3" />
              {readingTimeLabel(readingTime)}
            </span>
          </div>

          <h3 className="mt-2.5 text-sm font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-brand-cyan sm:text-lg">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {article.excerpt}
            </p>
          )}

          <div className="mt-auto pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-cyan transition-colors group-hover:text-white">
              {readMoreLabel}
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.5}
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
