import { getTranslations } from 'next-intl/server';
import {
  Bike,
  Bus,
  Car,
  ExternalLink,
  Footprints,
  ParkingCircle,
  Plane,
  Route,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RichText as RichTextValue, TransportMode, TransportOption } from '@sif/shared';
import { Container } from '@/components/layout/container';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { RichText } from '@/components/rich-text';

const MODE_ICONS: Record<TransportMode, LucideIcon> = {
  car: Car,
  motorbike: Bike,
  bus: Bus,
  taxi: Car,
  walk: Footprints,
  bike: Bike,
  air: Plane,
};

/**
 * How to reach the venue, and what to do with a vehicle once there.
 *
 * The transport cards come first and the prose second, in that order for a
 * reason: a visitor deciding *how* to travel is scanning for their own mode,
 * which a grid of labelled cards answers at a glance and a paragraph does not.
 * The rich-text blocks below carry the detail that does not fit a card.
 */
export async function GettingHere({
  options,
  directions,
  parkingNotes,
}: {
  options: TransportOption[];
  directions: RichTextValue | null;
  parkingNotes: RichTextValue | null;
}) {
  const t = await getTranslations('location');

  if (options.length === 0 && !directions && !parkingNotes) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <ScrollReveal className="group max-w-2xl">
          <h2 className="text-lg font-bold tracking-tight sm:text-3xl">{t('directions')}</h2>
          <span aria-hidden="true" className="rule-accent mt-5" />
          <p className="text-muted-foreground mt-6 text-base">{t('directionsLead')}</p>
        </ScrollReveal>

        {options.length > 0 && (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((option, index) => {
              const Icon = MODE_ICONS[option.mode] ?? Route;
              const href = option.url?.trim();

              return (
                <li key={`${option.mode}-${index}`}>
                  <ScrollReveal delay={Math.min(index, 5) * 60} className="h-full">
                    <div className="glass lift flex h-full flex-col rounded-2xl p-6">
                      <span
                        aria-hidden="true"
                        className="from-brand-blue/25 to-brand-cyan/20 text-brand-cyan inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br"
                      >
                        <Icon className="size-5" />
                      </span>

                      <h3 className="mt-5 text-base font-semibold">{option.title}</h3>

                      {option.duration && (
                        <p className="text-brand-cyan mt-1 text-xs font-semibold tracking-widest uppercase">
                          {option.duration}
                        </p>
                      )}

                      {option.detail && (
                        <p className="text-muted-foreground mt-3 text-sm whitespace-pre-line">
                          {option.detail}
                        </p>
                      )}

                      {href && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold"
                        >
                          {t('routeLink')}
                          <ExternalLink aria-hidden="true" className="size-4" />
                        </a>
                      )}
                    </div>
                  </ScrollReveal>
                </li>
              );
            })}
          </ul>
        )}

        {(directions || parkingNotes) && (
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {directions && (
              <ScrollReveal>
                <div className="glass h-full rounded-2xl p-7 sm:p-8">
                  <h3 className="flex items-center gap-3 text-base font-semibold">
                    <Route aria-hidden="true" className="text-brand-cyan size-5" />
                    {t('directionsDetail')}
                  </h3>
                  <div className="mt-5">
                    <RichText content={directions} />
                  </div>
                </div>
              </ScrollReveal>
            )}

            {parkingNotes && (
              <ScrollReveal delay={80}>
                <div className="glass h-full rounded-2xl p-7 sm:p-8">
                  <h3 className="flex items-center gap-3 text-base font-semibold">
                    <ParkingCircle aria-hidden="true" className="text-brand-cyan size-5" />
                    {t('parking')}
                  </h3>
                  <div className="mt-5">
                    <RichText content={parkingNotes} />
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
