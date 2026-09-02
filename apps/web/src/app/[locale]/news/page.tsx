import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Article, Locale } from '@sif/shared';
import { strapiFetch } from '@/lib/strapi';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news' });
  return { title: t('title') };
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('news');
  const format = await getFormatter();

  const articles = await strapiFetch<Article[]>('articles', {
    locale: locale as Locale,
    query: { 'sort[0]': 'date:desc', 'populate[coverImage]': 'true' },
    tags: ['articles'],
  })
    .then((res) => res.data)
    .catch(() => [] as Article[]);

  return (
    <>
      <PageHeader title={t('title')} />
      <Container className="py-12">
        {articles.length === 0 ? (
          <p className="text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.documentId}>
                <Link href={{ pathname: '/news/[slug]', params: { slug: article.slug } }}>
                  <time dateTime={article.date} className="text-muted-foreground text-xs">
                    {format.dateTime(new Date(article.date), { dateStyle: 'long' })}
                  </time>
                  <h2 className="mt-2 text-lg font-semibold">{article.title}</h2>
                  {article.excerpt && (
                    <p className="text-muted-foreground mt-2 text-sm">{article.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
