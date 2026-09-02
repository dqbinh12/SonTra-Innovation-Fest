import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Article, Locale } from '@sif/shared';
import { strapiFetch } from '@/lib/strapi';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';

type Props = { params: Promise<{ locale: string; slug: string }> };

async function getArticle(locale: string, slug: string): Promise<Article | null> {
  const { data } = await strapiFetch<Article[]>('articles', {
    locale: locale as Locale,
    query: { 'filters[slug][$eq]': slug, 'populate[coverImage]': 'true' },
    tags: ['articles', `article:${slug}`],
  }).catch(() => ({ data: [] as Article[], meta: {} }));

  return data[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(locale, slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt ?? undefined,
      publishedTime: article.date,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations('news');
  const format = await getFormatter();

  return (
    <Container className="py-12">
      <Link href="/news" className="text-primary text-sm font-medium">
        ← {t('backToNews')}
      </Link>

      <article className="mt-8 max-w-3xl">
        <time dateTime={article.date} className="text-muted-foreground text-sm">
          {t('publishedOn', {
            date: format.dateTime(new Date(article.date), { dateStyle: 'long' }),
          })}
        </time>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {article.title}
        </h1>
        {/* TODO(phase-2): render the rich-text body through a Strapi blocks renderer. */}
        <div className="mt-8 whitespace-pre-wrap">{article.body}</div>
      </article>
    </Container>
  );
}
