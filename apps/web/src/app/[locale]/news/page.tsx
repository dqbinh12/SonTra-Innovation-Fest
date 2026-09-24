import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Newspaper, RotateCcw } from 'lucide-react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Article, Locale, NewsPage as NewsPageContent } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Link, getPathname } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { NewsBackdrop } from '@/components/news/news-backdrop';
import { NewsCard } from '@/components/news/news-card';
import { NewsFilterBar } from '@/components/news/news-filter-bar';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
    category?: string | string[];
  }>;
};

function getNewsPage(locale: string) {
  return strapiFetchOptional<NewsPageContent>('news-page', {
    locale: locale as Locale,
    query: { 'populate[seo][populate]': 'ogImage' },
    tags: ['news-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, content] = await Promise.all([
    getTranslations({ locale, namespace: 'news' }),
    getNewsPage(locale),
  ]);

  return seoMetadata(content?.seo, {
    title: content?.title ?? t('title'),
    description: content?.intro ?? t('intro'),
    locale,
    href: '/news',
  });
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const filters = await searchParams;
  const q = typeof filters.q === 'string' ? filters.q.trim().slice(0, 200) : '';
  const categoryParam =
    typeof filters.category === 'string' ? filters.category.trim().slice(0, 50) : '';
  const requestedPage = typeof filters.page === 'string' ? Number(filters.page) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const t = await getTranslations('news');
  const format = await getFormatter();

  const [content, response, categoriesResponse] = await Promise.all([
    getNewsPage(locale),
    strapiFetch<Article[]>('articles', {
      locale: locale as Locale,
      query: {
        'sort[0]': 'date:desc',
        'sort[1]': 'slug:asc',
        'populate[coverImage]': 'true',
        'pagination[page]': page,
        'pagination[pageSize]': 6,
        ...(q
          ? {
              'filters[$or][0][title][$containsi]': q,
              'filters[$or][1][excerpt][$containsi]': q,
            }
          : {}),
        ...(categoryParam && categoryParam !== 'all'
          ? {
              'filters[category][$eqi]': categoryParam,
            }
          : {}),
      },
      tags: ['articles'],
    }).catch(() => null),

    strapiFetch<Array<{ category?: string | null }>>('articles', {
      locale: locale as Locale,
      query: {
        'fields[0]': 'category',
        'pagination[pageSize]': 100,
      },
      tags: ['articles'],
    }).catch(() => null),
  ]);

  const articles = response?.data ?? [];
  const pagination = response?.meta.pagination;
  const newsPath = getPathname({ locale: locale as Locale, href: '/news' });

  const pageHref = (target: number) => ({
    pathname: '/news' as const,
    query: {
      ...(q ? { q } : {}),
      ...(categoryParam && categoryParam !== 'all' ? { category: categoryParam } : {}),
      page: target,
    },
  });

  const formatDate = (date: string) => format.dateTime(new Date(date), { dateStyle: 'long' });

  // Extract unique categories dynamically from CMS articles
  const dynamicCategories = Array.from(
    new Set(
      (categoriesResponse?.data ?? [])
        .map((item) => item.category?.trim())
        .filter((cat): cat is string => Boolean(cat))
    )
  );

  const categories = [
    { key: 'all', label: t('categories.all') },
    ...dynamicCategories.map((cat) => ({ key: cat, label: cat })),
  ];

  // Whether we are on default unfiltered view
  const isDefaultView = !q && (!categoryParam || categoryParam === 'all') && page === 1;

  return (
    <div className="page-deep dark flex-1 pb-20 text-foreground">
      <NewsBackdrop />

      {/* ─── Hero Section with Tech Pulse & Filter Dock ───────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-10 lg:pt-32 lg:pb-12 text-white">
        <Container className="relative grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end lg:gap-12">
          <div>
            {/* Live Dispatch Pulse Pill */}
            <div className="glass-invert inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wider text-brand-cyan uppercase">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-brand-mint animate-pulse"
              />
              <span>{content?.pulseLabel ?? t('pulseLabel')}</span>
              {(content?.eventDate ?? t('pulseDates')) && (
                <>
                  <span aria-hidden="true" className="text-white/30">
                    •
                  </span>
                  <span className="text-white/70 font-normal">
                    {content?.eventDate ?? t('pulseDates')}
                  </span>
                </>
              )}
            </div>

            <h1 className="gradient-text-aurora mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {content?.title ?? t('title')}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {content?.intro ?? t('intro')}
            </p>
          </div>

          {/* Interactive Search & Category Filter */}
          <div className="w-full">
            <NewsFilterBar
              query={q}
              category={categoryParam}
              categories={categories}
              newsPath={newsPath}
            />
          </div>
        </Container>
      </section>

      {/* ─── Main Content Section ─────────────────────────────────────────── */}
      <Container className="py-6 sm:py-8">
        <section
          aria-labelledby={!isDefaultView ? 'news-browse' : undefined}
          aria-label={isDefaultView ? t('title') : undefined}
        >
          {/* Active Filter Summary when Searching or Categorized */}
          {!isDefaultView && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <h2
                  id="news-browse"
                  className="text-xl font-bold tracking-tight sm:text-2xl text-white"
                >
                  {q ? t('searchResults') : t('filterResults', { category: categoryParam })}
                </h2>
                {q && (
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {t('resultsFor', { query: q })}
                  </p>
                )}
              </div>

              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3.5 py-1.5 text-xs font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan/20"
              >
                <RotateCcw className="size-3.5" />
                {t('resetFilters')}
              </Link>
            </div>
          )}

          {/* Empty State */}
          {!response || articles.length === 0 ? (
            <div className="glass flex flex-col items-center justify-center rounded-3xl border border-border/60 px-6 py-20 text-center backdrop-blur-xl">
              <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand-blue/20 border border-brand-cyan/30">
                <div
                  aria-hidden="true"
                  className="size-20 rounded-full bg-brand-cyan/10 blur-xl absolute"
                />
                <Newspaper
                  aria-hidden="true"
                  className="size-8 text-brand-cyan"
                  strokeWidth={1.5}
                />
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {!response
                  ? t('unavailable')
                  : q || categoryParam
                    ? t('noResults')
                    : page > 1
                      ? t('noPage')
                      : t('empty')}
              </h3>

              <p className="max-w-md text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
                {t('moreSoon')}
              </p>

              {(q || categoryParam || page > 1) && (
                <Link
                  href="/news"
                  className="btn-glow inline-flex items-center gap-2 rounded-full bg-brand-cyan px-6 py-2.5 text-xs sm:text-sm font-bold text-brand-navy hover:bg-white transition-all"
                >
                  <RotateCcw className="size-4" />
                  {t('resetFilters')}
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {articles.map((article) => (
                <NewsCard
                  key={article.documentId}
                  article={article}
                  formatDate={formatDate}
                  readMoreLabel={t('readMore')}
                  readingTimeLabel={(minutes) => t('readingTime', { minutes })}
                />
              ))}
            </div>
          )}

          {/* Pagination Navigation */}
          {pagination && pagination.pageCount > 1 && (
            <nav
              aria-label={t('pagination')}
              className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6 text-sm"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="glass lift inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 font-semibold text-white transition-colors hover:border-brand-cyan"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  {t('previous')}
                </Link>
              ) : (
                <span />
              )}

              <span className="font-mono text-xs text-muted-foreground">
                {t('pageOf', { page, total: pagination.pageCount })}
              </span>

              {page < pagination.pageCount ? (
                <Link
                  href={pageHref(page + 1)}
                  className="glass lift inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 font-semibold text-white transition-colors hover:border-brand-cyan"
                >
                  {t('next')}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
      </Container>
    </div>
  );
}
