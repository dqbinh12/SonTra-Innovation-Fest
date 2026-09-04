import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AboutPage, Locale, OrganizationRole } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout/page-header';
import { Section, EmptyState } from '@/components/layout/section';
import { RichText } from '@/components/rich-text';
import {
  ORGANIZATION_ROLES,
  Organizations,
  isOrganizationRole,
} from '@/components/about/organizations';

type Props = { params: Promise<{ locale: string }> };

function getAboutPage(locale: string) {
  return strapiFetchOptional<AboutPage>('about-page', {
    locale: locale as Locale,
    query: {
      'populate[organizations][populate]': 'logo',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['about-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'about' }),
    getAboutPage(locale),
  ]);

  return seoMetadata(page?.seo, {
    title: t('title'),
    description: page?.mission,
    locale,
    href: '/about',
  });
}

export default async function About({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const page = await getAboutPage(locale);

  /** Only roles the UI knows how to place; anything else is ignored. */
  const organizations = (page?.organizations ?? []).filter((organization) =>
    isOrganizationRole(organization.role),
  );

  const roleLabels = Object.fromEntries(
    ORGANIZATION_ROLES.map((role) => [role, t(`roles.${role}`)]),
  ) as Record<OrganizationRole, string>;

  return (
    <>
      <PageHeader title={t('title')} />

      <Section>
        <div className="max-w-3xl">
          {page ? <RichText content={page.story} /> : <EmptyState>{t('title')}</EmptyState>}
        </div>
      </Section>

      {page?.mission && (
        <Section title={t('missionTitle')}>
          <p className="max-w-3xl text-lg">{page.mission}</p>
        </Section>
      )}

      {organizations.length > 0 && (
        <Section title={t('organizerTitle')}>
          <Organizations organizations={organizations} labels={roleLabels} />
        </Section>
      )}
    </>
  );
}
