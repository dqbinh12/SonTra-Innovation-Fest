import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Download, FileText, FolderArchive, UserRound } from 'lucide-react';
import type { WorkshopDocument } from '@sif/shared';
import { mediaUrl } from '@/lib/media';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { MediaQrBanner } from './media-qr-banner';

/** Tab 4 — conference and workshop material, arranged as a press-release-style list. */
export async function WorkshopDocumentsPanel({
  documents,
  intro,
  url,
}: {
  documents: WorkshopDocument[];
  intro?: string | null;
  url?: string | null;
}) {
  const t = await getTranslations('media.workshopDocuments');
  const archiveUrl = url?.trim();

  return (
    <section className="relative overflow-x-clip py-16 sm:py-20">
      <Container>
        <ScrollReveal direction="left" className="group max-w-2xl">
          <h2 className="text-lg font-bold tracking-tight sm:text-3xl">{t('title')}</h2>
          <span aria-hidden="true" className="rule-accent mt-5" />
          <p className="text-muted-foreground mt-6 text-base">{intro ?? t('lead')}</p>
        </ScrollReveal>

        {archiveUrl && (
          <MediaQrBanner
            url={archiveUrl}
            icon={<FolderArchive className="size-6" />}
            badgeText={t('badge')}
            title={t('title')}
            description={t('note')}
            buttonLabel={t('openArchive')}
            scanLabel={t('scanQr')}
          />
        )}

        {documents.length === 0 && !archiveUrl ? (
          <div className="mt-12">
            <EmptyState>{t('empty')}</EmptyState>
          </div>
        ) : (
          documents.length > 0 && (
            <ScrollReveal direction="up">
              <ul className="border-border mt-12 border-t">
                {documents.map((document, index) => {
                  const file = mediaUrl(document.file);
                  const href = file ?? document.externalUrl?.trim() ?? null;
                  const isFile = Boolean(file);

                  return (
                    <li key={`${document.title}-${index}`}>
                      <article className="border-border hover:bg-secondary/40 flex flex-wrap items-start gap-x-8 gap-y-4 border-b px-2 py-8 transition-colors sm:flex-nowrap">
                        <span
                          aria-hidden="true"
                          className="text-primary bg-primary/10 hidden size-11 shrink-0 items-center justify-center rounded-xl sm:inline-flex"
                        >
                          <FileText className="size-5" />
                        </span>

                        <div className="min-w-[14rem] flex-1">
                          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                            {document.category && (
                              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 font-semibold tracking-wide uppercase">
                                {document.category}
                              </span>
                            )}
                            {document.fileLabel && <span>{document.fileLabel}</span>}
                          </div>

                          <h3 className="mt-2 text-base font-semibold text-balance">{document.title}</h3>
                          {document.speaker && (
                            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                              <UserRound aria-hidden="true" className="size-3.5" />
                              {document.speaker}
                            </p>
                          )}
                          {document.summary && (
                            <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{document.summary}</p>
                          )}
                        </div>

                        {href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-border hover:border-primary hover:text-primary inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
                          >
                            {isFile ? t('download') : t('open')}
                            {isFile ? (
                              <Download aria-hidden="true" className="size-4" />
                            ) : (
                              <ArrowUpRight aria-hidden="true" className="size-4" />
                            )}
                            <span className="sr-only">— {document.title}</span>
                          </a>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ul>
            </ScrollReveal>
          )
        )}
      </Container>
    </section>
  );
}
