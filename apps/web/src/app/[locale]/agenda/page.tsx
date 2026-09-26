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
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { EventCountdown } from '@/components/countdown/event-countdown';

type Props = { params: Promise<{ locale: string }> };

interface AgendaSectionGroup {
  id: string;
  order: number;
  title: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  sessions: Session[];
}

function groupSessionsIntoSections(sessions: Session[]): AgendaSectionGroup[] {
  const groups: AgendaSectionGroup[] = [];
  let currentGroup: AgendaSectionGroup | null = null;
  let sectionCounter = 0;

  for (const session of sessions) {
    const sTitle = session.sectionTitle?.trim() || null;

    if (sTitle) {
      if (currentGroup && currentGroup.title === sTitle) {
        currentGroup.sessions.push(session);
        if (session.endTime) {
          currentGroup.endTime = session.endTime;
        }
      } else {
        sectionCounter++;
        currentGroup = {
          id: `section-${session.documentId || sectionCounter}`,
          order: session.sectionOrder ?? sectionCounter,
          title: sTitle,
          location: session.location ?? null,
          startTime: session.startTime,
          endTime: session.endTime,
          sessions: [session],
        };
        groups.push(currentGroup);
      }
    } else {
      if (currentGroup && currentGroup.title === null) {
        currentGroup.sessions.push(session);
        if (session.endTime) {
          currentGroup.endTime = session.endTime;
        }
      } else {
        sectionCounter++;
        currentGroup = {
          id: `session-group-${session.documentId || sectionCounter}`,
          order: session.sectionOrder ?? sectionCounter,
          title: null,
          location: session.location ?? null,
          startTime: session.startTime,
          endTime: session.endTime,
          sessions: [session],
        };
        groups.push(currentGroup);
      }
    }
  }

  return groups;
}

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
    <div className="page-deep dark relative flex-1 overflow-x-clip text-foreground">
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
              <p className="text-sm font-semibold text-white">{t('empty')}</p>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{t('emptyLead')}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {[...days].map(([day, daySessions], dayIdx) => (
                <div key={day} className="relative">
                  {/* Day Header Banner */}
                  <ScrollReveal direction="left">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 font-mono text-xs font-bold text-brand-cyan">
                          0{dayIdx + 1}
                        </span>
                        <h2 className="text-base font-bold tracking-tight text-white sm:text-xl">
                          {format.dateTime(new Date(day), { dateStyle: 'full' })}
                        </h2>
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white/70">
                        {t('sessionCount', { count: daySessions.length })}
                      </span>
                    </div>
                  </ScrollReveal>

                  {/* Sections List */}
                  <div className="space-y-4 sm:space-y-5">
                    {groupSessionsIntoSections(daySessions).map((section, sectionIdx) => (
                      <ScrollReveal
                        key={section.id}
                        direction="up-lg"
                        delay={(sectionIdx % 4) * 80}
                      >
                      <div
                        className="glass relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-brand-cyan/30 hover:shadow-xl hover:shadow-brand-cyan/5"
                      >
                        {/* Accent gradient strip on left border */}
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-brand-cyan via-brand-blue to-transparent opacity-80" />

                        {/* Section Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-brand-blue/15 via-white/[0.02] to-transparent px-4 py-3 sm:px-6 sm:py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 sm:size-9 items-center justify-center rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 font-mono text-xs sm:text-sm font-extrabold text-brand-cyan shadow-[0_0_12px_rgba(78,226,255,0.2)]">
                              {String(section.order).padStart(2, '0')}
                            </span>
                            <div>
                              <h3 className="text-sm font-bold tracking-tight text-white sm:text-lg">
                                {section.title || t('title')}
                              </h3>
                              {section.location && (
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <MapPin className="size-3 text-brand-cyan" />
                                  <span>{section.location}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/30 bg-brand-navy/80 px-3 py-0.5 font-mono text-xs font-semibold text-brand-cyan">
                              <Clock className="size-3" />
                              <span>{formatTime(section.startTime)}</span>
                              {section.endTime && <span>– {formatTime(section.endTime)}</span>}
                            </span>
                          </div>
                        </div>

                        {/* Sub-items Nested Timeline */}
                        <div className="px-3 py-2.5 sm:px-6 sm:py-3.5">
                          <div className="relative">
                            {/* Vertical timeline connector line */}
                            <div className="absolute top-3 bottom-3 left-[7.5rem] sm:left-[8.5rem] hidden sm:block w-px bg-gradient-to-b from-brand-cyan/40 via-brand-blue/20 to-white/5" />

                            <ul className="space-y-1.5 sm:space-y-2">
                              {section.sessions.map((session) => (
                                <li
                                  key={session.documentId}
                                  className="group relative rounded-xl px-2.5 py-2 transition-all duration-200 hover:bg-white/[0.04]"
                                >
                                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                      {/* Time Column */}
                                      <div className="shrink-0 sm:w-32">
                                        <span className="inline-flex items-center gap-1 rounded-md border border-brand-cyan/20 bg-brand-navy/60 px-2 py-0.5 font-mono text-xs font-semibold whitespace-nowrap text-brand-cyan sm:border-0 sm:bg-transparent sm:p-0 sm:text-white/80">
                                          <Clock className="size-3 sm:hidden text-brand-cyan" />
                                          <span>{formatTime(session.startTime)}</span>
                                          {session.endTime && (
                                            <span> – {formatTime(session.endTime)}</span>
                                          )}
                                        </span>
                                      </div>

                                      {/* Dot on Timeline */}
                                      <div className="hidden sm:flex items-center justify-center shrink-0 w-4">
                                        <div className="size-2 rounded-full border-2 border-brand-cyan bg-brand-navy shadow-[0_0_6px_rgba(78,226,255,0.7)] transition-transform duration-200 group-hover:scale-125 group-hover:border-brand-mint group-hover:bg-brand-mint" />
                                      </div>

                                      {/* Session Content */}
                                      <div className="min-w-0 flex-1 pr-2">
                                        <h4 className="text-sm font-semibold text-white transition-colors group-hover:text-brand-cyan leading-snug">
                                          {session.title}
                                        </h4>

                                        {session.description && (
                                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                                            {session.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Metadata Badges (aligned to the right on desktop) */}
                                    {(session.speaker ||
                                      session.track ||
                                      (session.location &&
                                        (!section.location ||
                                          session.location !== section.location))) && (
                                      <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs sm:justify-end pl-28 sm:pl-0">
                                        {session.speaker && (
                                          <span className="inline-flex items-center gap-1 rounded-full border border-brand-mint/30 bg-brand-mint/10 px-2 py-0.5 text-xs font-medium text-brand-mint">
                                            <Mic className="size-2.5" />
                                            <span>{session.speaker}</span>
                                          </span>
                                        )}

                                        {session.track && (
                                          <span className="inline-flex items-center gap-1 rounded-full border border-brand-violet/20 bg-brand-violet/10 px-2 py-0.5 text-xs font-medium text-brand-violet">
                                            <Tag className="size-2.5" />
                                            <span>{session.track}</span>
                                          </span>
                                        )}

                                        {session.location &&
                                          (!section.location ||
                                            session.location !== section.location) && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                              <MapPin className="size-2.5 text-brand-cyan" />
                                              <span>{session.location}</span>
                                            </span>
                                          )}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {pdfUrl && (
            <ScrollReveal direction="up" className="mt-14 flex justify-center sm:justify-start">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow inline-flex items-center gap-2.5 rounded-full bg-brand-cyan px-6 py-3 text-sm font-bold text-brand-navy shadow-lg shadow-brand-cyan/20 transition-all hover:bg-white"
              >
                <Download className="size-4" />
                <span>{t('downloadPdf')}</span>
              </a>
            </ScrollReveal>
          )}
        </Container>
      </section>
    </div>
  );
}
