import { getFormatter, getTranslations } from 'next-intl/server';
import { CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import type { PressConference } from '@sif/shared';
import { Container } from '@/components/layout/container';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { RichText } from '@/components/rich-text';

/**
 * Tab 1 — the press conference.
 *
 * The two things a journalist needs to act on, the date and the accreditation
 * link, sit in a card that stays beside the copy on a wide screen and moves to
 * the top of the column on a phone: the decision to attend is made before the
 * run sheet is read.
 */
export async function PressConferencePanel({ conference }: { conference: PressConference | null }) {
  const t = await getTranslations('media.pressConference');
  const format = await getFormatter();

  if (!conference) {
    return (
      <Container className="py-10">
        <div className="glass mx-auto max-w-lg rounded-3xl border border-white/10 p-8 text-center backdrop-blur-xl sm:p-10">
          <p className="text-sm font-medium text-white/80">{t('empty')}</p>
        </div>
      </Container>
    );
  }

  const start = conference.startsAt ? new Date(conference.startsAt) : null;
  const end = conference.endsAt ? new Date(conference.endsAt) : null;

  const when = start
    ? format.dateTime(start, { dateStyle: 'full', timeStyle: 'short' }) +
      // Only the closing time — repeating the date on a briefing that ends the
      // same morning adds nothing.
      (end ? ` – ${format.dateTime(end, { timeStyle: 'short' })}` : '')
    : null;

  const registrationUrl = conference.registrationUrl?.trim();

  return (
    <section className="py-8 sm:py-10">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          {/* ── The briefing itself ─────────────────────────────────────── */}
          <ScrollReveal className="group order-2 lg:order-1">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {conference.title ?? t('title')}
            </h2>
            <span aria-hidden="true" className="rule-accent mt-5" />

            {conference.summary && (
              <p className="text-muted-foreground mt-6 max-w-2xl text-lg">{conference.summary}</p>
            )}

            {conference.schedule.length > 0 && (
              <div className="mt-12">
                <h3 className="text-sm font-semibold tracking-widest uppercase">
                  {t('scheduleTitle')}
                </h3>

                {/* A rail with a dot per item: the run sheet is a sequence, and
                    a plain table of two short columns reads as a price list. */}
                <ol className="border-border mt-6 space-y-6 border-l pl-6">
                  {conference.schedule.map((item, index) => (
                    <li key={`${item.title}-${index}`} className="relative">
                      <span
                        aria-hidden="true"
                        className="bg-primary ring-background absolute top-2 -left-[1.8125rem] size-2.5 rounded-full ring-4"
                      />
                      {item.time && (
                        <p className="text-primary font-mono text-sm font-semibold">{item.time}</p>
                      )}
                      <p className="mt-1 font-semibold">{item.title}</p>
                      {item.description && (
                        <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {conference.accreditation && (
              <div className="mt-12">
                <h3 className="text-sm font-semibold tracking-widest uppercase">
                  {t('accreditationTitle')}
                </h3>
                <div className="text-muted-foreground mt-6 max-w-2xl">
                  <RichText content={conference.accreditation} />
                </div>
              </div>
            )}
          </ScrollReveal>

          {/* ── When / where / register ─────────────────────────────────── */}
          <ScrollReveal className="order-1 lg:order-2">
            <div className="glass sticky top-36 rounded-2xl p-6">
              <dl className="space-y-6">
                {when && (
                  <div className="flex gap-4">
                    <CalendarDays
                      aria-hidden="true"
                      className="text-primary mt-0.5 size-5 shrink-0"
                    />
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                        {t('when')}
                      </dt>
                      <dd className="mt-1 font-medium">{when}</dd>
                    </div>
                  </div>
                )}

                {(conference.venue || conference.address) && (
                  <div className="flex gap-4">
                    <MapPin aria-hidden="true" className="text-primary mt-0.5 size-5 shrink-0" />
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                        {t('where')}
                      </dt>
                      <dd className="mt-1 font-medium">{conference.venue}</dd>
                      {conference.address && (
                        <dd className="text-muted-foreground mt-1 text-sm">{conference.address}</dd>
                      )}
                    </div>
                  </div>
                )}
              </dl>

              {registrationUrl && (
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow bg-primary text-primary-foreground mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold"
                >
                  {conference.registrationLabel ?? t('register')}
                  <ExternalLink aria-hidden="true" className="size-4" />
                </a>
              )}
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
