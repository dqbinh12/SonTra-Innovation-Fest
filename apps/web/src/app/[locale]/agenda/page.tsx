import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Download } from 'lucide-react';
import type { AgendaPage, Locale, Session } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { mediaUrl } from '@/lib/media';
import { formatTime } from '@/lib/format';
import { PageHeader } from '@/components/layout/page-header';
import { Section, EmptyState } from '@/components/layout/section';

type Props = { params: Promise<{ locale: string }> };

function getAgendaPage(locale: string) {
  return strapiFetchOptional<AgendaPage>('agenda-page', {
    locale: locale as Locale,
    query: { 'populate[agendaPdf]': 'true', 'populate[seo][populate]': 'ogImage' },
    tags: ['agenda-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'agenda' }),
    getAgendaPage(locale),
  ]);

  return seoMetadata(page?.seo, {
    title: page?.title ?? t('title'),
    description: page?.intro,
    locale,
    href: '/agenda',
  });
}

export default async function Agenda({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('agenda');
  const format = await getFormatter();

  const [page, sessions] = await Promise.all([
    getAgendaPage(locale),
    strapiFetch<Session[]>('sessions', {
      locale: locale as Locale,
      query: { 'sort[0]': 'day:asc', 'sort[1]': 'startTime:asc', 'pagination[pageSize]': 200 },
      tags: ['sessions'],
    })
      .then((res) => res.data)
      .catch(() => [] as Session[]),
  ]);

  // Sessions arrive already sorted; grouping preserves that order per day.
  const days = new Map<string, Session[]>();
  for (const session of sessions) {
    const existing = days.get(session.day);
    if (existing) existing.push(session);
    else days.set(session.day, [session]);
  }

  const pdfUrl = mediaUrl(page?.agendaPdf);

  return (
    <>
      <PageHeader title={page?.title ?? t('title')} lead={page?.intro} />

      <Section>
        {days.size === 0 ? (
          <EmptyState>{t('empty')}</EmptyState>
        ) : (
          <div className="space-y-12">
            {[...days].map(([day, daySessions]) => (
              <div key={day}>
                <h2 className="text-xl font-bold tracking-tight">
                  {format.dateTime(new Date(day), { dateStyle: 'full' })}
                </h2>
                <ul className="divide-border mt-6 divide-y">
                  {daySessions.map((session) => (
                    <li
                      key={session.documentId}
                      className="grid gap-2 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6"
                    >
                      <div className="text-muted-foreground text-sm font-medium tabular-nums">
                        {formatTime(session.startTime)}
                        {session.endTime && ` – ${formatTime(session.endTime)}`}
                      </div>
                      <div>
                        <h3 className="font-semibold">{session.title}</h3>
                        {session.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {session.description}
                          </p>
                        )}
                        <dl className="text-muted-foreground mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                          {session.speaker && (
                            <div className="flex gap-1">
                              <dt className="sr-only">{t('speaker')}</dt>
                              <dd>{session.speaker}</dd>
                            </div>
                          )}
                          {session.track && (
                            <div className="flex gap-1">
                              <dt className="sr-only">{t('track')}</dt>
                              <dd>{session.track}</dd>
                            </div>
                          )}
                          {session.location && (
                            <div className="flex gap-1">
                              <dt className="sr-only">{t('location')}</dt>
                              <dd>{session.location}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {pdfUrl && (
          <a
            href={pdfUrl}
            className="text-primary mt-12 inline-flex items-center gap-2 text-sm font-medium"
          >
            <Download className="size-4" />
            {t('downloadPdf')}
          </a>
        )}
      </Section>
    </>
  );
}
