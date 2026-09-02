import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Article, HomePage, Locale } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const [home, latestNews] = await Promise.all([
    strapiFetchOptional<HomePage>('home-page', {
      locale: locale as Locale,
      query: { 'populate[heroMedia]': 'true' },
      tags: ['home-page'],
    }),
    strapiFetch<Article[]>('articles', {
      locale: locale as Locale,
      query: {
        'sort[0]': 'date:desc',
        'pagination[pageSize]': 3,
        'populate[coverImage]': 'true',
      },
      tags: ['articles'],
    })
      .then((res) => res.data)
      .catch(() => [] as Article[]),
  ]);

  return (
    <>
      <section className="border-border border-b py-20 sm:py-28">
        <Container>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {home?.heroTitle ?? t('title')}
          </h1>
          {home?.heroSubtitle && (
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg">{home.heroSubtitle}</p>
          )}
          <p className="text-muted-foreground mt-4 text-sm font-medium">
            {[home?.eventDate, home?.venue].filter(Boolean).join(' · ')}
          </p>
          <Link
            href="/attend"
            className="bg-primary text-primary-foreground mt-8 inline-flex rounded-lg px-6 py-3 text-sm font-semibold"
          >
            {home?.ctaLabel ?? t('heroCta')}
          </Link>
        </Container>
      </section>

      {home?.stats && home.stats.length > 0 && (
        <section className="py-16">
          <Container>
            <h2 className="sr-only">{t('highlightsTitle')}</h2>
            <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {home.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-muted-foreground text-sm">{stat.label}</dt>
                  <dd className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {latestNews.length > 0 && (
        <section className="py-16">
          <Container>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">{t('latestNewsTitle')}</h2>
              <Link href="/news" className="text-primary text-sm font-medium">
                {t('latestNewsCta')}
              </Link>
            </div>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((article) => (
                <li key={article.documentId}>
                  <Link href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}>
                    <h3 className="font-semibold">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-muted-foreground mt-2 text-sm">{article.excerpt}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
