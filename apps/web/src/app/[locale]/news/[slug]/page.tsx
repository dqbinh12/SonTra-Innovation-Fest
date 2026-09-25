import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Article, Locale } from '@sif/shared';
import { strapiFetch } from '@/lib/strapi';
import { mediaUrl } from '@/lib/media';
import { Link, getPathname } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { RichText } from '@/components/rich-text';
import { StrapiImage } from '@/components/strapi-image';
import { NewsBackdrop } from '@/components/news/news-backdrop';
import { NewsCard } from '@/components/news/news-card';
import { ReadingProgress } from '@/components/news/reading-progress';
import { ArticleShareBar } from '@/components/news/article-share-bar';
import { estimateReadingTime } from '@/lib/reading-time';

type Props = { params: Promise<{ locale: string; slug: string }> };

async function getArticle(locale: string, slug: string): Promise<Article | null> {
  const { data } = await strapiFetch<Article[]>('articles', {
    locale: locale as Locale,
    query: {
      'filters[slug][$eq]': slug,
      'populate[coverImage]': 'true',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['articles', `article:${slug}`],
  }).catch(() => ({ data: [] as Article[], meta: {} }));

  return data[0] ?? null;
}

async function getRelatedArticles(locale: string, currentSlug: string): Promise<Article[]> {
  const response = await strapiFetch<Article[]>('articles', {
    locale: locale as Locale,
    query: {
      'sort[0]': 'date:desc',
      'filters[slug][$ne]': currentSlug,
      'populate[coverImage]': 'true',
      'pagination[pageSize]': 3,
    },
    tags: ['articles'],
  }).catch(() => null);

  return response?.data ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(locale, slug);
  if (!article) return {};

  const tSite = await getTranslations({ locale, namespace: 'site' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url =
    siteUrl +
    getPathname({
      href: { pathname: '/news/[slug]', params: { slug } },
      locale: locale as 'en' | 'vi',
    });

  const title = article.seo?.metaTitle ?? article.title;
  const description = article.seo?.metaDescription ?? article.excerpt ?? undefined;
  const image = mediaUrl(article.seo?.ogImage ?? article.coverImage);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: tSite('name'),
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      publishedTime: article.date,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [article, relatedArticles] = await Promise.all([
    getArticle(locale, slug),
    getRelatedArticles(locale, slug),
  ]);

  if (!article) notFound();

  const t = await getTranslations('news');
  const format = await getFormatter();
  const readingTime = estimateReadingTime(article.body || article.excerpt);
  const formatDate = (date: string) => format.dateTime(new Date(date), { dateStyle: 'long' });

  return (
    <div className="page-deep dark flex-1 pb-20 text-foreground">
      <ReadingProgress />
      <NewsBackdrop />

      {/* ─── Immersive Header Section ─────────────────────────────────────── */}
      <header className="relative overflow-hidden pt-24 pb-8 sm:pt-32 sm:pb-12 text-white">
        <Container className="max-w-4xl">
          {/* Navigation link */}
          <div>
            <Link
              href="/news"
              className="glass hover:border-brand-cyan/60 hover:text-brand-cyan inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-200"
            >
              <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
              {t('backToNews')}
            </Link>
          </div>

          <div className="mt-8">
            {/* Category & Meta Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/35 bg-brand-cyan/15 px-3 py-1 text-xs font-mono font-bold tracking-wider text-brand-cyan uppercase">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-mint" />
                {article.category || 'SIF 2026'}
              </span>

              <span className="font-mono text-xs text-muted-foreground">
                <time dateTime={article.date}>{formatDate(article.date)}</time>
              </span>

              <span aria-hidden="true" className="text-white/20">
                •
              </span>

              <span className="inline-flex items-center gap-1 font-mono text-xs text-brand-cyan/90">
                <Clock aria-hidden="true" className="size-3.5" />
                {t('readingTime', { minutes: readingTime })}
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight">
              {article.title}
            </h1>

            {/* Excerpt Lead */}
            {article.excerpt && (
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/80">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Featured Cover Media */}
          {article.coverImage && (
            <div className="relative mt-8 aspect-[16/8.5] overflow-hidden rounded-2xl border border-border/60 bg-brand-navy shadow-[0_24px_70px_-32px_rgba(0,0,0,0.8)] sm:mt-10">
              <StrapiImage
                media={article.coverImage}
                fill
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </Container>
      </header>

      {/* ─── Reading Body Container ───────────────────────────────────────── */}
      <Container className="max-w-4xl py-6 sm:py-8">
        <article className="glass rounded-3xl border border-border/70 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-2xl">
          <div className="prose prose-invert max-w-none">
            <RichText
              content={article.body}
              variant="story"
              className="space-y-6 text-foreground/90 text-base sm:text-lg leading-relaxed"
            />
          </div>

          {/* Social Share Bar */}
          <ArticleShareBar title={article.title} />

          {/* Return CTA */}
          <div className="pt-4 flex justify-between items-center">
            <Link
              href="/news"
              className="glass hover:border-brand-cyan/60 hover:text-brand-cyan inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t('backToNews')}
            </Link>
          </div>
        </article>
      </Container>

      {/* ─── Related Stories Section ──────────────────────────────────────── */}
      {relatedArticles.length > 0 && (
        <section className="pt-12 sm:pt-16">
          <Container className="max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {t('relatedStories')}
              </h2>
              <span aria-hidden="true" className="rule-accent" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {relatedArticles.map((rel) => (
                <NewsCard
                  key={rel.documentId}
                  article={rel}
                  formatDate={formatDate}
                  readMoreLabel={t('readMore')}
                  readingTimeLabel={(minutes) => t('readingTime', { minutes })}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
