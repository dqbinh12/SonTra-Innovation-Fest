import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ArrowUpRight, Newspaper, Search } from 'lucide-react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Article, Locale } from '@sif/shared';
import { strapiFetch } from '@/lib/strapi';
import { Link, getPathname } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { StrapiImage } from '@/components/strapi-image';

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
    <div className="page-deep dark min-h-full pb-24 text-foreground">
      <section className="relative overflow-hidden text-white pt-28 pb-14 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
        <div aria-hidden="true" className="grid-motif text-white" />
        <div
          aria-hidden="true"
          className="streak from-brand-cyan to-brand-violet -top-24 -left-40 rotate-[-18deg] bg-gradient-to-r opacity-40"
        />

        <Container className="relative grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-end lg:gap-16">
          <div>
            <p className="glass-invert inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white uppercase">
              <span aria-hidden="true" className="bg-brand-mint size-1.5 rounded-full" />
              Son Tra Innovation Fest
            </p>
            <h1 className="gradient-text-aurora mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
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
                className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-base text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                aria-label={t('search')}
                className="btn-glow bg-brand-cyan text-brand-navy inline-flex w-14 shrink-0 items-center justify-center transition-transform hover:brightness-110 active:scale-[0.97]"
              >
                <Search aria-hidden="true" className="size-5" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        <section aria-labelledby="news-browse">
          <div className="mb-8 max-w-2xl">
            <h2
              id="news-browse"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {q ? t('searchResults') : t('allNews')}
            </h2>
            {q && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <p>{t('resultsFor', { query: q })}</p>
                <Link
                  href="/news"
                  className="text-brand-cyan font-semibold underline underline-offset-4"
                >
                  {t('clearSearch')}
                </Link>
              </div>
            )}
            <span aria-hidden="true" className="rule-accent mt-5" />
          </div>

          {!response || articles.length === 0 ? (
            <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center">
              <Newspaper aria-hidden="true" className="text-white/20 mx-auto mb-5 size-12" />
              <p className="text-muted-foreground">
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
                  className="text-brand-cyan mt-5 inline-block font-semibold underline"
                >
                  {t('backToNews')}
                </Link>
              )}
            </div>
          ) : remaining.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {remaining.map((article) => (
                <article key={article.documentId} className="flex h-full">
                  <Link
                    href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}
                    className="group glass lift flex h-full w-full flex-col overflow-hidden rounded-2xl"
                  >
                    <div className="bg-brand-navy relative aspect-[16/10] shrink-0 overflow-hidden">
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
                            className="text-white/10 size-12"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                      
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>
                    
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <time
                        dateTime={article.date}
                        className="text-brand-cyan text-xs font-semibold tracking-widest uppercase"
                      >
                        {formatDate(article.date)}
                      </time>
                      <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-muted-foreground mt-4 line-clamp-3 text-sm leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="mt-auto pt-6">
                        <span className="text-brand-cyan inline-flex items-center gap-2 text-sm font-bold transition-colors group-hover:text-white">
                          {t('readMore')}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
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
