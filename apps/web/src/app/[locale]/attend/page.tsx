import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AttendPage, Locale } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { RichText } from '@/components/rich-text';

type Props = { params: Promise<{ locale: string }> };

function getAttendPage(locale: string) {
  return strapiFetchOptional<AttendPage>('attend-page', {
    locale: locale as Locale,
    query: {
      'populate[benefits]': 'true',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['attend-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'attend' }),
    getAttendPage(locale),
  ]);

  return seoMetadata(page?.seo, {
    title: page?.heroTitle ?? t('title'),
    description: page?.heroBody,
  });
}

export default async function Attend({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('attend');
  const page = await getAttendPage(locale);

  return (
    <>
      <PageHeader title={page?.heroTitle ?? t('title')} lead={page?.heroBody} />

      {page?.audience && (
        <Section title={t('audienceTitle')}>
          <div className="max-w-3xl">
            <RichText content={page.audience} />
          </div>
        </Section>
      )}

      {page?.benefits && page.benefits.length > 0 && (
        <Section title={t('benefitsTitle')}>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {page.benefits.map((benefit) => (
              <li key={benefit.title} className="border-border rounded-lg border p-6">
                <h3 className="font-semibold">{benefit.title}</h3>
                {benefit.description && (
                  <p className="text-muted-foreground mt-2 text-sm">{benefit.description}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t('entryTitle')}>
        <div className="max-w-3xl">
          {page?.entryInfo ? (
            <RichText content={page.entryInfo} />
          ) : (
            <p className="text-muted-foreground">{t('entryFree')}</p>
          )}
        </div>
      </Section>
    </>
  );
}
