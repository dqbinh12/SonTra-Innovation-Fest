import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AboutPage, Locale, OrganizationRole } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { Section, EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';
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

      {/* ─── Who is behind the festival ────────────────────────────────── */}
      {organizations.length > 0 && (
        <Section title={t('organizerTitle')}>
          <Organizations organizations={organizations} labels={roleLabels} />
        </Section>
      )}

      {/* ─── The story ─────────────────────────────────────────────────── */}
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

      {/* ─── Closing CTA ───────────────────────────────────────────────── */}
      <section className="pb-24">
        <Container>
          <ScrollReveal>
            <div className="bg-brand-navy relative isolate overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
              <div aria-hidden="true" className="bg-aurora absolute inset-0 -z-10 opacity-90" />
              <div aria-hidden="true" className="bg-tech-grid absolute inset-0 -z-10" />
              <div
                aria-hidden="true"
                className="bg-brand-cyan/20 animate-float-slow absolute -top-24 -left-16 -z-10 size-72 rounded-full blur-3xl"
              />

              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-balance">
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{t('ctaBody')}</p>

              <div className="mt-9 flex justify-center">
                <Link
                  href="/contact"
                  className="btn-glow bg-primary text-primary-foreground inline-flex rounded-lg px-8 py-4 text-sm font-semibold tracking-wide uppercase"
                >
                  {t('ctaPrimary')}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
