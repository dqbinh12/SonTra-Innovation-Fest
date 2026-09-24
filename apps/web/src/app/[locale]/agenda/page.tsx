import type { Metadata } from 'next';
import { Calendar, Clock, Download, MapPin, Mic, Tag } from 'lucide-react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { AgendaPage, Locale, Session } from '@sif/shared';
import { strapiFetch, strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { mediaUrl } from '@/lib/media';
import { formatTime } from '@/lib/format';
import { Container } from '@/components/layout/container';
import { FestivalBackdrop } from '@/components/layout/festival-backdrop';
import { ImmersivePageHero } from '@/components/layout/immersive-page-hero';
import { EventCountdown } from '@/components/countdown/event-countdown';

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
    <div className="page-deep dark relative flex-1 overflow-hidden text-foreground">
      <FestivalBackdrop variant="agenda" />
      <ImmersivePageHero
        eyebrow={t('eyebrow')}
        title={page?.title ?? t('title')}
        lead={page?.intro ?? t('lead')}
        aside={<EventCountdown locale={locale} variant="panel" />}
      />

      <section className="relative pt-6 pb-12 sm:pt-8 sm:pb-16">
        <Container>
          {days.size === 0 ? (
            <div className="glass rounded-3xl border border-white/10 p-12 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-brand-cyan/30 bg-brand-blue/20">
                <Calendar className="size-6 text-brand-cyan" />
              </div>
              <p className="text-base font-semibold text-white">{t('empty')}</p>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{t('emptyLead')}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {[...days].map(([day, daySessions], dayIdx) => (
                <div key={day} className="relative">
                  {/* Day Header Banner */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 font-mono text-xs font-bold text-brand-cyan">
                        0{dayIdx + 1}
                      </span>
                      <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                        {format.dateTime(new Date(day), { dateStyle: 'full' })}
                      </h2>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white/70">
                      {t('sessionCount', { count: daySessions.length })}
                    </span>
                  </div>

                  {/* Sessions Timeline Cards */}
                  <ul className="space-y-3">
                    {daySessions.map((session) => (
                      <li
                        key={session.documentId}
                        className="glass lift group rounded-2xl border border-white/10 p-4 sm:p-5 backdrop-blur-xl transition-all"
                      >
                        <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5">
                          {/* Time Column */}
                          <div className="flex items-start">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-cyan/20 bg-brand-navy/60 px-2.5 py-1 font-mono text-xs font-semibold text-brand-cyan">
                              <Clock className="size-3" />
                              <span>{formatTime(session.startTime)}</span>
                              {session.endTime && <span>– {formatTime(session.endTime)}</span>}
                            </span>
                          </div>

                          {/* Session Info */}
                          <div>
                            <h3 className="text-base font-bold text-white transition-colors group-hover:text-brand-cyan">
                              {session.title}
                            </h3>

                            {session.description && (
                              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                {session.description}
                              </p>
                            )}

                            {/* Session Meta Pills */}
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                              {session.speaker && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-medium text-white/85">
                                  <Mic className="size-3 text-brand-mint" />
                                  <span>{session.speaker}</span>
                                </span>
                              )}

                              {session.track && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-2.5 py-0.5 font-medium text-brand-violet">
                                  <Tag className="size-3" />
                                  <span>{session.track}</span>
                                </span>
                              )}

                              {session.location && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-medium text-muted-foreground">
                                  <MapPin className="size-3 text-brand-cyan" />
                                  <span>{session.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {pdfUrl && (
            <div className="mt-14 flex justify-center sm:justify-start">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow inline-flex items-center gap-2.5 rounded-full bg-brand-cyan px-6 py-3 text-sm font-bold text-brand-navy shadow-lg shadow-brand-cyan/20 transition-all hover:bg-white"
              >
                <Download className="size-4" />
                <span>{t('downloadPdf')}</span>
              </a>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
