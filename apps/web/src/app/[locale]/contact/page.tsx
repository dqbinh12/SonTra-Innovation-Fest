import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale, SiteSettings } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { ContactForm } from '@/components/forms/contact-form';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const site = await getTranslations({ locale, namespace: 'site' });

  return { title: t('title'), description: site('description') };
}

export default async function Contact({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('contact');
  const settings = await strapiFetchOptional<SiteSettings>('site-setting', {
    locale: locale as Locale,
    query: { 'populate[socialLinks]': 'true' },
    tags: ['site-setting'],
  });

  return (
    <>
      <PageHeader title={t('title')} />

      <Container className="grid gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('formTitle')}</h2>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('infoTitle')}</h2>
          <dl className="mt-8 space-y-4 text-sm">
            {settings?.contactEmail && (
              <div>
                <dt className="text-muted-foreground">{t('email')}</dt>
                <dd className="mt-1">
                  <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
                    {settings.contactEmail}
                  </a>
                </dd>
              </div>
            )}
            {settings?.contactPhone && (
              <div>
                <dt className="text-muted-foreground">{t('phone')}</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                    className="hover:underline"
                  >
                    {settings.contactPhone}
                  </a>
                </dd>
              </div>
            )}
            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <div>
                <dt className="text-muted-foreground">{t('social')}</dt>
                <dd className="mt-1 flex flex-wrap gap-3">
                  {settings.socialLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {link.platform}
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Container>
    </>
  );
}
