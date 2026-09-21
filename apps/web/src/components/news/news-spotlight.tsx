import { ArrowUpRight, Clock, Newspaper } from 'lucide-react';
import type { Article } from '@sif/shared';
import { Link } from '@/i18n/navigation';
import { StrapiImage } from '@/components/strapi-image';
import { estimateReadingTime } from '@/lib/reading-time';

interface NewsSpotlightProps {
  article: Article;
  formatDate: (date: string) => string;
  readMoreLabel: string;
  featuredLabel: string;
  readingTimeLabel: (minutes: number) => string;
}

export function NewsSpotlight({
  article,
  formatDate,
  readMoreLabel,
  featuredLabel,
  readingTimeLabel,
}: NewsSpotlightProps) {
  const readingTime = estimateReadingTime(article.body || article.excerpt);

  return (
    <article className="group mb-10 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-brand-navy/80 via-brand-navy/60 to-brand-blue/20 backdrop-blur-xl transition-all duration-300 hover:border-brand-cyan/60 hover:shadow-[0_16px_48px_-12px_rgba(78,226,255,0.28)] sm:mb-14">
      <Link
        href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}
        className="grid items-center gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:gap-10 lg:p-8"
      >
        {/* Cover Visual (7 cols) */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-navy lg:col-span-7">
          {article.coverImage ? (
            <StrapiImage
              media={article.coverImage}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-navy via-brand-blue/40 to-brand-navy">
              <div aria-hidden="true" className="bg-tech-grid absolute inset-0 opacity-25" />
              <Newspaper
                aria-hidden="true"
                className="size-16 text-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:text-brand-cyan/50"
                strokeWidth={1.5}
              />
            </div>
          )}

          {/* Floating Category Pill */}
          <span className="glass-invert absolute top-3.5 left-3.5 z-10 rounded-md border border-brand-cyan/30 px-3 py-1 text-xs font-mono font-bold tracking-wider text-brand-cyan uppercase backdrop-blur-md">
            {article.category || 'SIF 2026'}
          </span>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-30"
          />
        </div>

        {/* Details & Copy (5 cols) */}
        <div className="flex flex-col justify-center lg:col-span-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-mint/40 bg-brand-mint/15 px-3 py-1 text-[11px] font-mono font-bold tracking-wider text-brand-mint uppercase">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-brand-mint animate-pulse"
              />
              {featuredLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span aria-hidden="true" className="text-white/20">
              •
            </span>
            <span className="inline-flex items-center gap-1 text-brand-cyan">
              <Clock aria-hidden="true" className="size-3.5" />
              {readingTimeLabel(readingTime)}
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-brand-cyan sm:text-3xl lg:text-3xl leading-tight">
            {article.title}
          </h2>

          {article.excerpt && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-4 sm:text-base">
              {article.excerpt}
            </p>
          )}

          <div className="mt-6 flex items-center">
            <span className="btn-glow inline-flex items-center gap-2 rounded-full bg-brand-cyan px-5 py-2.5 text-xs sm:text-sm font-bold text-brand-navy transition-all duration-200 group-hover:bg-white group-hover:translate-x-0.5">
              {readMoreLabel}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.5}
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
