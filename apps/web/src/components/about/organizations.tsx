import type { Organization, OrganizationRole } from '@sif/shared';
import { StrapiImage } from '@/components/strapi-image';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { cn } from '@/lib/utils';

/**
 * Tile size per role. The organizer is the headline logo, the co-organizers
 * flank it, and the coordinating entities close the block one step smaller —
 * the same hierarchy as the printed key visual.
 */
const ROLES: Record<OrganizationRole, { tile: string; logo: string; sizes: string }> = {
  organizer: {
    tile: 'w-full max-w-xs sm:w-72 lg:w-80 h-44 sm:h-48 lg:h-56',
    logo: 'max-h-28 sm:max-h-32 lg:max-h-40',
    sizes: '(min-width: 1024px) 320px, (min-width: 640px) 288px, 80vw',
  },
  'co-organizer': {
    tile: 'w-full max-w-[15rem] sm:w-56 lg:w-64 h-36 sm:h-40 lg:h-44',
    logo: 'max-h-20 sm:max-h-24 lg:max-h-28',
    sizes: '(min-width: 1024px) 256px, (min-width: 640px) 224px, 70vw',
  },
  coordinator: {
    tile: 'w-full max-w-[13rem] sm:w-48 lg:w-56 h-32 sm:h-36',
    logo: 'max-h-16 sm:max-h-20 lg:max-h-24',
    sizes: '(min-width: 1024px) 224px, (min-width: 640px) 192px, 60vw',
  },
};

export const ORGANIZATION_ROLES = Object.keys(ROLES) as OrganizationRole[];

export function isOrganizationRole(value: unknown): value is OrganizationRole {
  return typeof value === 'string' && value in ROLES;
}

function OrganizationTile({
  organization,
  label,
  className,
}: {
  organization: Organization;
  /** Omitted when the row already carries one shared label. */
  label?: string;
  className?: string;
}) {
  const { tile, logo, sizes } = ROLES[organization.role];
  const isOrganizer = organization.role === 'organizer';

  const plate = (
    <span
      className={cn(
        'lift flex items-center justify-center rounded-2xl bg-white/92 p-5 shadow-[0_20px_50px_-24px_rgba(2,8,40,0.9)] ring-1 ring-white/25 backdrop-blur-sm sm:p-6',
        tile,
      )}
    >
      {organization.logo ? (
        <StrapiImage
          media={organization.logo}
          sizes={sizes}
          className={cn('w-auto object-contain', logo)}
        />
      ) : (
        <span className="text-brand-navy text-center text-base font-semibold text-balance">
          {organization.name}
        </span>
      )}
    </span>
  );

  return (
    <figure className={cn('flex flex-col items-center', className)}>
      {/* The role sits above its own logo, the way the key visual labels it. */}
      {label && (
        <figcaption
          className={cn(
            'text-center text-xs font-semibold tracking-[0.22em] uppercase sm:text-sm',
            isOrganizer ? 'text-white' : 'text-white/65',
          )}
        >
          {label}
        </figcaption>
      )}

      <div className={cn(label && 'mt-3 sm:mt-4')}>
        {organization.link ? (
          <a
            href={organization.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={organization.name}
            className="block"
          >
            {plate}
          </a>
        ) : (
          plate
        )}
      </div>

      {organization.logo && (
        <p className="mt-3 max-w-[15rem] text-center text-sm text-white/70 text-balance">
          {organization.name}
        </p>
      )}
    </figure>
  );
}

/**
 * The organizations behind the festival, on a navy panel that echoes the
 * festival key visual: the organizer centred between its two co-organizers,
 * with the coordinating entities on the row below.
 *
 * The arrangement is composed rather than a plain grid, but nothing here
 * assumes the 1 / 2 / 2 split — an extra logo in the CMS simply wraps into
 * its own row.
 */
export function Organizations({
  organizations,
  labels,
}: {
  organizations: Organization[];
  labels: Record<OrganizationRole, string>;
}) {
  const byRole = (role: OrganizationRole) => organizations.filter((o) => o.role === role);

  const organizer = byRole('organizer');
  const coOrganizers = byRole('co-organizer');
  const coordinators = byRole('coordinator');

  if (organizations.length === 0) return null;

  /**
   * Reading order is the printed order — co-organizer, organizer,
   * co-organizer — while `order-first` keeps the organizer on top once the
   * row stacks on a phone.
   */
  const topRow: Organization[] = [
    ...coOrganizers.slice(0, 1),
    ...organizer,
    ...coOrganizers.slice(1),
  ];

  return (
    <div className="bg-brand-navy relative isolate overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Decoration only — the same grid + glow vocabulary as the hero. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-tech-grid absolute inset-0 opacity-40" />
        <div className="bg-brand-blue/25 absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-brand-violet/20 absolute -right-20 -bottom-24 size-80 rounded-full blur-3xl" />
      </div>

      <ul className="flex flex-wrap items-end justify-center gap-8 sm:gap-10 lg:gap-12">
        {topRow.map((organization, i) => (
          <li
            key={`${organization.role}-${i}`}
            className={cn(organization.role === 'organizer' && 'order-first sm:order-none')}
          >
            <ScrollReveal delay={i * 90}>
              <OrganizationTile organization={organization} label={labels[organization.role]} />
            </ScrollReveal>
          </li>
        ))}
      </ul>

      {coordinators.length > 0 && (
        <>
          <div
            aria-hidden="true"
            className="mx-auto mt-12 h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/25 to-transparent sm:mt-14"
          />

          {/* One label for the pair — repeating it over each logo reads as two
              separate roles rather than one group. */}
          <p className="mt-10 text-center text-xs font-semibold tracking-[0.22em] text-white/65 uppercase sm:text-sm">
            {labels.coordinator}
          </p>

          <ul className="mt-6 flex flex-wrap items-end justify-center gap-8 sm:gap-10">
            {coordinators.map((organization, i) => (
              <li key={`coordinator-${i}`}>
                <ScrollReveal delay={i * 90}>
                  <OrganizationTile organization={organization} />
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
