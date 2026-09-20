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
    <div className="bg-[#f4f8fd] pb-24">
      <section className="bg-brand-navy relative overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(78,226,255,0.24),transparent_34%)]"
        />
        <div aria-hidden="true" className="bg-tech-grid absolute inset-0 opacity-45" />

        <Container className="relative grid gap-10 pt-28 pb-14 sm:pt-36 sm:pb-20 lg:grid-cols-[1fr_25rem] lg:items-end lg:gap-20 lg:pt-40 lg:pb-24">
          <div>
            <p className="text-brand-cyan text-sm font-semibold tracking-[0.16em] uppercase">
              Son Tra Innovation Fest
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl leading-[0.98] font-extrabold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
              {t('title')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              {t('intro')}
            </p>
          </div>

          <form action={newsPath} method="get" role="search" className="w-full">
            <label htmlFor="news-search" className="mb-3 block text-sm font-semibold text-white">
              {t('search')}
            </label>
            <div className="flex rounded-xl bg-white p-1.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55)]">
              <input
                id="news-search"
                name="q"
                type="search"
                maxLength={200}
                defaultValue={q}
                placeholder={t('search')}
                className="text-brand-navy min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-[#526785]"
              />
              <button
                type="submit"
                aria-label={t('search')}
                className="bg-brand-cyan text-brand-navy inline-flex size-12 shrink-0 items-center justify-center rounded-lg transition-transform hover:brightness-95 active:scale-[0.97]"
              >
                <Search aria-hidden="true" className="size-5" strokeWidth={2} />
              </button>
            </div>
          </form>
        </Container>
      </section>

      <Container className="py-14 sm:py-18">
        <section aria-labelledby="news-browse">
          <div className="mb-8 max-w-2xl">
            <h2
              id="news-browse"
              className="text-brand-navy text-3xl font-bold tracking-[-0.025em] sm:text-4xl"
            >
              {q ? t('searchResults') : t('allNews')}
            </h2>
            {q && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <p className="text-[#526785]">{t('resultsFor', { query: q })}</p>
                <Link
                  href="/news"
                  className="text-brand-blue font-semibold underline underline-offset-4"
                >
                  {t('clearSearch')}
                </Link>
              </div>
            )}
          </div>

          {!response || articles.length === 0 ? (
            <div className="border-brand-navy/15 rounded-xl border bg-white px-6 py-16 text-center">
              <Newspaper aria-hidden="true" className="text-brand-blue mx-auto mb-5 size-10" />
              <p className="text-[#526785]">
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
                  className="text-brand-blue mt-5 inline-block font-semibold underline"
                >
                  {t('backToNews')}
                </Link>
              )}
            </div>
          ) : remaining.length > 0 ? (
            <div className="grid gap-6 sm:gap-8">
              {remaining.map((article) => (
                <article key={article.documentId}>
                  <Link
                    href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}
                    className="group flex flex-col gap-6 sm:flex-row sm:items-center justify-between rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-brand-navy/5 transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 hover:ring-brand-blue/20 lg:p-10 lg:gap-12"
                  >
                    <div className="flex-1">
                      <time
                        dateTime={article.date}
                        className="text-brand-cyan text-sm font-semibold tracking-wide uppercase"
                      >
                        {formatDate(article.date)}
                      </time>
                      <h3 className="text-brand-navy mt-3 text-2xl leading-tight font-bold tracking-[-0.02em] transition-colors group-hover:text-brand-blue sm:text-3xl">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#526785]">
                          {article.excerpt}
                        </p>
                      )}
                      <span className="text-brand-blue mt-6 inline-flex items-center gap-2 text-sm font-bold">
                        {t('readMore')}
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                          strokeWidth={2.5}
                        />
                      </span>
                    </div>

                    <div className="bg-brand-navy relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:w-64 lg:w-80">
                      {article.coverImage ? (
                        <StrapiImage
                          media={article.coverImage}
                          fill
                          sizes="(min-width: 1024px) 320px, (min-width: 640px) 256px, 100vw"
                          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Newspaper
                            aria-hidden="true"
                            className="text-brand-cyan size-12 opacity-50"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-[#526785]">{t('moreSoon')}</p>
          )}

          {pagination && pagination.pageCount > 1 && (
            <nav
              aria-label={t('pagination')}
              className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="border-brand-navy/20 text-brand-navy inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-3 font-semibold hover:border-brand-blue"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  {t('previous')}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-[#526785]">
                {t('pageOf', { page, total: pagination.pageCount })}
              </span>
              {page < pagination.pageCount ? (
                <Link
                  href={pageHref(page + 1)}
                  className="border-brand-navy/20 text-brand-navy inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-3 font-semibold hover:border-brand-blue"
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
