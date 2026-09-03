import { ArrowRight, Building2, GraduationCap, Newspaper, User } from 'lucide-react';
import type { AudienceSegmentKey } from '@sif/shared';
import { Link } from '@/i18n/navigation';
import { pathnames } from '@/i18n/routing';

/** Static routes only — a dynamic pathname like `/news/[slug]` needs params. */
type InternalHref = Exclude<keyof typeof pathnames, `${string}[${string}`>;

/**
 * Icon and accent per visitor type. The gradients stay inside the brand
 * palette so the four cards read as one set rather than four colour choices.
 */
const SEGMENTS: Record<
  AudienceSegmentKey,
  { icon: typeof User; accent: string; href: InternalHref }
> = {
  solo: { icon: User, accent: 'from-brand-cyan/25 to-brand-blue/20', href: '/agenda' },
  school: { icon: GraduationCap, accent: 'from-brand-mint/25 to-brand-teal/20', href: '/contact' },
  company: { icon: Building2, accent: 'from-brand-blue/25 to-brand-violet/20', href: '/sponsors' },
  press: { icon: Newspaper, accent: 'from-brand-violet/25 to-brand-purple/20', href: '/contact' },
};

export const AUDIENCE_KEYS = Object.keys(SEGMENTS) as AudienceSegmentKey[];

export function isAudienceKey(value: unknown): value is AudienceSegmentKey {
  return typeof value === 'string' && value in SEGMENTS;
}

export type AudienceCardProps = {
  segmentKey: AudienceSegmentKey;
  title: string;
  description?: string | null;
  /** One bullet per line, as authored in the CMS textarea. */
  highlights?: string | null;
  highlightsLabel: string;
  ctaLabel?: string | null;
  /** CMS override — an absolute URL, or one of the app's internal pathnames. */
  ctaHref?: string | null;
};

export function AudienceCard({
  segmentKey,
  title,
  description,
  highlights,
  highlightsLabel,
  ctaLabel,
  ctaHref,
}: AudienceCardProps) {
  const { icon: Icon, accent, href } = SEGMENTS[segmentKey];
  const bullets = (highlights ?? '')
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  return (
    <article className="group glass lift flex h-full flex-col rounded-2xl p-7">
      <span
        aria-hidden="true"
        className={`text-primary inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}
      >
        <Icon className="size-6" />
      </span>

      <h3 className="group-hover:text-primary mt-5 text-lg font-semibold tracking-tight transition-colors">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
      )}

      {bullets.length > 0 && (
        <>
          <p className="text-muted-foreground mt-6 text-xs font-semibold tracking-[0.18em] uppercase">
            {highlightsLabel}
          </p>
          <ul className="mt-3 space-y-2.5 text-sm">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="from-brand-cyan to-brand-blue mt-2 size-1.5 shrink-0 rounded-full bg-gradient-to-br"
                />
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {ctaLabel && (
        <div className="mt-auto pt-6">
          <SegmentCta label={ctaLabel} fallback={href} override={ctaHref} />
        </div>
      )}
    </article>
  );
}

/**
 * The card link. `Link` only accepts the typed pathnames in `i18n/routing`, so
 * an absolute URL from the CMS goes through a plain anchor (it is off-site and
 * should not be locale-prefixed), an internal pathname is passed through, and
 * anything else falls back to the segment's own default route.
 */
function SegmentCta({
  label,
  fallback,
  override,
}: {
  label: string;
  fallback: InternalHref;
  override?: string | null;
}) {
  const className =
    'group/cta text-primary hover:text-brand-blue inline-flex items-center gap-2 text-sm font-semibold transition-colors';
  const arrow = (
    <ArrowRight
      aria-hidden="true"
      className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1"
    />
  );
  const target = override?.trim();

  if (target && /^https?:\/\//i.test(target)) {
    return (
      <a href={target} className={className} rel="noopener noreferrer" target="_blank">
        {label}
        {arrow}
      </a>
    );
  }

  const internal =
    target && target in pathnames && !target.includes('[') ? (target as InternalHref) : fallback;

  return (
    <Link href={internal} className={className}>
      {label}
      {arrow}
    </Link>
  );
}
