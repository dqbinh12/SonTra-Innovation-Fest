import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ArrowUpRight, Newspaper, Search } from 'lucide-react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Article, Locale } from '@sif/shared';
import { strapiFetch } from '@/lib/strapi';
import { Link, getPathname } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { StrapiImage } from '@/components/strapi-image';
import { NewsBackdrop } from '@/components/news/news-backdrop';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news' });
  return { title: t('title'), description: t('intro') };
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const filters = await searchParams;
  const q = typeof filters.q === 'string' ? filters.q.trim().slice(0, 200) : '';
  const requestedPage = typeof filters.page === 'string' ? Number(filters.page) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const t = await getTranslations('news');
  const format = await getFormatter();
  const response = await strapiFetch<Article[]>('articles', {
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
    },
    tags: ['articles'],
  }).catch(() => null);

  const articles = response?.data ?? [];
  const pagination = response?.meta.pagination;
  const remaining = articles;
  const newsPath = getPathname({ locale: locale as Locale, href: '/news' });
  const pageHref = (target: number) => ({
    pathname: '/news' as const,
    query: { ...(q ? { q } : {}), page: target },
  });
  const formatDate = (date: string) => format.dateTime(new Date(date), { dateStyle: 'long' });

  return (
    <div className="page-deep dark min-h-full pb-20 text-foreground">
      <NewsBackdrop />

      <section className="relative overflow-hidden text-white pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12">
        <Container className="relative grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-end lg:gap-12">
          <div>
            <p className="glass-invert inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-white uppercase">
              <span aria-hidden="true" className="bg-brand-mint size-1.5 rounded-full" />
              Son Tra Innovation Fest
            </p>
            <h1 className="gradient-text-aurora mt-4 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {t('intro')}
            </p>
          </div>

          <form action={newsPath} method="get" role="search" className="w-full">
            <label htmlFor="news-search" className="sr-only">
              {t('search')}
            </label>
            <div className="glass flex overflow-hidden rounded-xl focus-within:ring-1 focus-within:ring-brand-cyan/40">
              <input
                id="news-search"
                name="q"
                type="search"
                maxLength={200}
                defaultValue={q}
                placeholder={t('search')}
                className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                aria-label={t('search')}
                className="btn-glow bg-brand-cyan text-brand-navy inline-flex w-12 shrink-0 items-center justify-center transition-transform hover:brightness-110 active:scale-[0.97]"
              >
                <Search aria-hidden="true" className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </Container>
      </section>

      <Container className="py-6 sm:py-8">
        <section aria-labelledby="news-browse">
          <div className="mb-6 max-w-2xl">
            <h2
              id="news-browse"
              className="text-xl font-bold tracking-tight sm:text-2xl"
            >
              {q ? t('searchResults') : t('allNews')}
            </h2>
            {q && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                <p>{t('resultsFor', { query: q })}</p>
                <Link
                  href="/news"
                  className="text-brand-cyan font-semibold underline underline-offset-4"
                >
                  {t('clearSearch')}
                </Link>
              </div>
            )}
            <span aria-hidden="true" className="rule-accent mt-4" />
          </div>

          {!response || articles.length === 0 ? (
            <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
              <Newspaper aria-hidden="true" className="text-white/20 mx-auto mb-4 size-10" />
              <p className="text-muted-foreground text-sm">
                {!response
                  ? t('unavailable')
                  : q
                    ? t('noResults')
                    : page > 1
                      ? t('noPage')
                      : t('empty')}
              </p>
              {page > 1 && (
                <Link
                  href="/news"
                  className="text-brand-cyan mt-4 inline-block text-sm font-semibold underline"
                >
                  {t('backToNews')}
                </Link>
              )}
            </div>
          ) : remaining.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {remaining.map((article) => (
                <article key={article.documentId} className="flex h-full">
                  <Link
                    href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}
                    className="group glass lift flex h-full w-full flex-col overflow-hidden rounded-2xl"
                  >
                    <div className="bg-brand-navy relative aspect-[16/9] shrink-0 overflow-hidden">
                      {article.coverImage ? (
                        <StrapiImage
                          media={article.coverImage}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Newspaper
                            aria-hidden="true"
                            className="text-white/10 size-10"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <time
                        dateTime={article.date}
                        className="text-brand-cyan text-[0.6875rem] font-semibold tracking-widest uppercase"
                      >
                        {formatDate(article.date)}
                      </time>
                      <h3 className="mt-2 text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-lg">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-muted-foreground mt-2 text-xs sm:text-sm leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="mt-auto pt-4">
                        <span className="text-brand-cyan inline-flex items-center gap-1.5 text-xs font-bold transition-colors group-hover:text-white">
                          {t('readMore')}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            strokeWidth={2.5}
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t('moreSoon')}</p>
          )}

          {pagination && pagination.pageCount > 1 && (
            <nav
              aria-label={t('pagination')}
              className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="glass lift inline-flex items-center gap-2 rounded-lg px-4 py-3 font-semibold"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  {t('previous')}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground">
                {t('pageOf', { page, total: pagination.pageCount })}
              </span>
              {page < pagination.pageCount ? (
                <Link
                  href={pageHref(page + 1)}
                  className="glass lift inline-flex items-center gap-2 rounded-lg px-4 py-3 font-semibold"
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
