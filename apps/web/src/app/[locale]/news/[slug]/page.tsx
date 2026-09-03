import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
        {article.coverImage && (
          <div className="bg-muted relative mt-8 aspect-video overflow-hidden rounded-lg">
            <StrapiImage
              media={article.coverImage}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-8">
          <RichText content={article.body} />
        </div>
      </article>
    </Container>
  );
}
