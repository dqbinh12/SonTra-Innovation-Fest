import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sponsors' });
  return { title: t('title') };
}

export default async function SponsorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('sponsors');

  return (
    <>
      <PageHeader title={t('title')} />
      <Container className="py-12">
        {/* TODO(phase-2): wire to the CMS — see the Content Structure tab. */}
        <p className="text-muted-foreground">Coming soon.</p>
      </Container>
    </>
  );
}
