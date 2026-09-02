import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Be_Vietnam_Pro } from 'next/font/google';
import type { SiteSettings } from '@sif/shared';
import { routing } from '@/i18n/routing';
import { strapiFetchOptional } from '@/lib/strapi';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import '../globals.css';

// Be Vietnam Pro ships the complete Vietnamese diacritic set — a hard
// requirement from the Design tab of the project workbook.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('name'),
      template: `%s — ${t('shortName')}`,
    },
    description: t('description'),
    openGraph: {
      type: 'website',
      siteName: t('name'),
      title: t('name'),
      description: t('description'),
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('name'),
      description: t('description'),
    },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}`])),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'site' });
  // Global settings come from the CMS; fall back to messages until it is filled.
  const settings = await strapiFetchOptional<SiteSettings>('site-setting', {
    locale,
    query: { 'populate[logo]': 'true', 'populate[socialLinks]': 'true' },
    tags: ['site-setting'],
  });
  const siteName = settings?.siteName ?? t('name');

  return (
    <html lang={locale} className={beVietnamPro.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="bg-primary text-primary-foreground sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
          >
            {t('name')}
          </a>
          <SiteHeader siteName={siteName} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter
            siteName={siteName}
            contactEmail={settings?.contactEmail}
            contactPhone={settings?.contactPhone}
            socialLinks={settings?.socialLinks ?? []}
            footerText={settings?.footerText}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
