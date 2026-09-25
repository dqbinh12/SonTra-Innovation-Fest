import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mail, Phone } from 'lucide-react';
import type { Locale, MediaPage } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { MediaHero } from '@/components/media/media-hero';
import { MediaTabs, type MediaTab } from '@/components/media/media-tabs';
import { PressConferencePanel } from '@/components/media/press-conference-panel';
import { PressReleasesPanel } from '@/components/media/press-releases-panel';
import { MediaKitPanel } from '@/components/media/media-kit-panel';
import { EventPhotosPanel } from '@/components/media/event-photos-panel';

type Props = { params: Promise<{ locale: string }> };

function getMediaPage(locale: string) {
  return strapiFetchOptional<MediaPage>('media-page', {
    locale: locale as Locale,
    query: {
      // Explicit paths rather than `populate=*`: Strapi's wildcard stops at the
      // first level, so the nested run sheet and every media field below would
      // come back missing.
      'populate[pressConference][populate]': 'schedule',
      'populate[pressReleases][populate]': 'file',
      'populate[mediaKitItems][populate]': 'file',
      'populate[photoAlbums][populate]': 'coverImage',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['media-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'media' }),
    getMediaPage(locale),
  ]);

  return seoMetadata(page?.seo, {
    title: page?.heroTitle ?? t('title'),
    description: page?.heroSubtitle ?? t('lead'),
    locale,
    href: '/media',
  });
}

/**
 * The Media Center — the press room every comparable festival site runs.
 *
 * One page, four tabs, in the order a journalist works through them: get
 * accredited for the conference, quote the releases, dress the story with the
 * brand assets, illustrate it with the photography. Splitting them into four
 * routes would put three clicks between a reporter on deadline and the asset
 * they came for; the tab bar keeps all four one click apart and each of them
 * linkable by hash.
 *
 * The press contact sits below the tabs, outside them, because it is the one
 * thing needed from all four.
 */
export default async function Media({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('media');
  const page = await getMediaPage(locale);

  const email = page?.pressContactEmail?.trim();
  const phone = page?.pressContactPhone?.trim();

  const tabs: MediaTab[] = [
    {
      key: 'press-conference',
      label: t('tabs.pressConference'),
      panel: (
        <PressConferencePanel
          conference={page?.pressConference ?? null}
          url={page?.pressConferenceUrl ?? page?.pressConference?.registrationUrl ?? null}
        />
      ),
    },
    {
      key: 'press-releases',
      label: t('tabs.pressReleases'),
      panel: (
        <PressReleasesPanel
          releases={page?.pressReleases ?? []}
          intro={page?.pressReleasesIntro}
          url={page?.pressReleasesUrl ?? null}
        />
      ),
    },
    {
      key: 'media-kit',
      label: t('tabs.mediaKit'),
      panel: (
        <MediaKitPanel
          items={page?.mediaKitItems ?? []}
          intro={page?.mediaKitIntro}
          usage={page?.mediaKitUsage}
          url={page?.mediaKitUrl ?? null}
        />
      ),
    },
    {
      key: 'event-photos',
      label: t('tabs.photos'),
      panel: (
        <EventPhotosPanel
          albums={page?.photoAlbums ?? []}
          driveUrl={page?.photoDriveUrl}
          intro={page?.photosIntro}
          credit={page?.photoCredit}
        />
      ),
    },
  ];

  return (
    <div className="page-deep dark flex-1 text-foreground">
      <MediaHero
        eyebrow={t('eyebrow')}
        title={page?.heroTitle ?? t('title')}
        lead={page?.heroSubtitle ?? t('lead')}
      />

      <MediaTabs tabs={tabs} label={t('tabsLabel')} />

      {/* ─── Press contact ─────────────────────────────────────────────── */}
      <section className="pb-12 sm:pb-16">
        <Container>
          <ScrollReveal>
            <div className="glass flex flex-wrap items-center justify-between gap-6 rounded-2xl p-6 sm:p-8">
              <div className="max-w-xl">
                <h2 className="text-lg font-bold tracking-tight">{t('contact.title')}</h2>
                <p className="text-muted-foreground mt-2">{t('contact.lead')}</p>

                {(page?.pressContactName || email || phone) && (
                  <div className="mt-5 space-y-1.5 text-sm">
                    {page?.pressContactName && (
                      <p className="font-semibold">{page.pressContactName}</p>
                    )}
                    {email && (
                      <p className="flex items-center gap-2">
                        <Mail aria-hidden="true" className="text-primary size-4" />
                        <a href={`mailto:${email}`} className="hover:text-primary">
                          {email}
                        </a>
                      </p>
                    )}
                    {phone && (
                      <p className="flex items-center gap-2">
                        <Phone aria-hidden="true" className="text-primary size-4" />
                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-primary">
                          {phone}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/contact"
                className="btn-glow bg-primary text-primary-foreground inline-flex rounded-lg px-6 py-3.5 text-sm font-semibold"
              >
                {t('contact.cta')}
              </Link>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
