import { getTranslations } from 'next-intl/server';
import { FolderArchive } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { MediaQrBanner } from './media-qr-banner';

/** Tab 3 — a single official folder link, matching the other media tabs. */
export async function MediaKitPanel({
  intro,
  url,
}: {
  intro?: string | null;
  url?: string | null;
}) {
  const t = await getTranslations('media.mediaKit');
  const mediaKitUrl = url?.trim();

  return (
    <section className="relative overflow-x-clip py-16 sm:py-20">
      <Container>
        <ScrollReveal direction="left" className="group max-w-2xl">
          <h2 className="text-lg font-bold tracking-tight sm:text-3xl">{t('title')}</h2>
          <span aria-hidden="true" className="rule-accent mt-5" />
          <p className="text-muted-foreground mt-6 text-base">{intro ?? t('lead')}</p>
        </ScrollReveal>

        {mediaKitUrl ? (
          <MediaQrBanner
            url={mediaKitUrl}
            icon={<FolderArchive className="size-6" />}
            badgeText="Media Kit"
            title={t('title')}
            description={t('note')}
            buttonLabel={t('openKit')}
            scanLabel={t('scanQr')}
          />
        ) : (
          <div className="mt-12">
            <EmptyState>{t('empty')}</EmptyState>
          </div>
        )}
      </Container>
    </section>
  );
}
