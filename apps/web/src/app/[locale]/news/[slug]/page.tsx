import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Article, Locale } from '@sif/shared';
import { strapiFetch } from '@/lib/strapi';
import { mediaUrl } from '@/lib/media';
import { Link, getPathname } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { RichText } from '@/components/rich-text';
import { StrapiImage } from '@/components/strapi-image';

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

  const article = await getArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations('news');
  const format = await getFormatter();

  return (
    <article className="bg-white">
      <header className="bg-brand-navy relative overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(78,226,255,0.22),transparent_34%)]"
        />
        <div aria-hidden="true" className="bg-tech-grid absolute inset-0 opacity-40" />

        <Container className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-20">
          <Link
            href="/news"
            className="text-brand-cyan inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-brand-cyan hover:bg-white/5"
          >
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
            {t('backToNews')}
          </Link>

          <div className="mt-10 max-w-4xl">
            <time dateTime={article.date} className="text-brand-cyan text-sm font-semibold">
              {t('publishedOn', {
                date: format.dateTime(new Date(article.date), { dateStyle: 'long' }),
              })}
            </time>
            <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78 sm:text-xl">
                {article.excerpt}
              </p>
            )}
          </div>

          {article.coverImage && (
            <div className="bg-brand-blue relative mt-10 aspect-[16/8.5] overflow-hidden rounded-xl shadow-[0_24px_70px_-32px_rgba(0,0,0,0.8)] sm:mt-12">
              <StrapiImage
                media={article.coverImage}
                fill
                priority
                sizes="(min-width: 1200px) 1152px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </Container>
      </header>

      <Container className="py-14 sm:py-18">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[4px_minmax(0,46rem)] lg:justify-center lg:gap-12">
          <div aria-hidden="true" className="bg-brand-cyan hidden h-24 lg:block" />
          <RichText
            content={article.body}
            className="space-y-6 text-[1.0625rem] leading-8 text-[#143159] [&_a]:font-semibold [&_blockquote]:my-8 [&_blockquote]:border-brand-cyan [&_blockquote]:bg-[#f4f8fd] [&_blockquote]:px-6 [&_blockquote]:py-5 [&_h2]:text-brand-navy [&_h2]:text-3xl [&_h3]:text-brand-navy [&_h3]:text-2xl [&_img]:my-8 [&_li]:pl-1 [&_p]:max-w-[68ch]"
          />
        </div>
      </Container>
    </article>
  );
}
