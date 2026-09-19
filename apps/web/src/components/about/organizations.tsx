import type { Organization, OrganizationRole } from '@sif/shared';
import { StrapiImage } from '@/components/strapi-image';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { cn } from '@/lib/utils';

/**
 * Tile size per role. The organizer is the headline logo, the co-organizers
 * flank it, and the coordinating entities close the block one step smaller —
 * the same hierarchy as the printed key visual, at a height that does not
 * push the rest of the page below the fold.
 */
const ROLES: Record<OrganizationRole, { tile: string; logo: string; sizes: string }> = {
  organizer: {
    tile: 'h-28 w-56 sm:h-32 sm:w-64',
    logo: 'max-h-16 sm:max-h-20',
    sizes: '256px',
  },
  'co-organizer': {
    tile: 'h-24 w-48 sm:h-28 sm:w-56',
    logo: 'max-h-12 sm:max-h-16',
    sizes: '224px',
  },
  coordinator: {
    tile: 'h-20 w-44 sm:h-24 sm:w-52',
    logo: 'max-h-10 sm:max-h-14',
    sizes: '208px',
  },
};

export const ORGANIZATION_ROLES = Object.keys(ROLES) as OrganizationRole[];

export function isOrganizationRole(value: unknown): value is OrganizationRole {
  return typeof value === 'string' && value in ROLES;
}

/**
 * Small caps label above a logo or a row of logos.
 *
 * Neither colour here is the one this component started with, and both were
 * measured against the lightest point of the page ground, `rgb(0,73,158)`:
 *
 *  - the organizer label used `.gradient-text`, which sweeps through brand
 *    blue. docs/brand.md records that blue at 2.1:1 on navy, and its fallback
 *    colour measured 1.71:1 here — the middle of that sweep was invisible.
 *    Cyan is the palette's on-dark action colour and measures 5.58:1.
 *  - the rest used `--muted-foreground`, which is 3.65:1 on this ground. At
 *    10.4px that is small text and needs 4.5:1, so it moves up to the plain
 *    foreground at 7.32:1, with the weight difference carrying the hierarchy
 *    instead of a contrast difference.
 */
function RoleLabel({ children, strong = false }: { children: string; strong?: boolean }) {
  return (
    <span
      className={cn(
        'block text-center text-[0.65rem] tracking-[0.2em] uppercase sm:text-xs',
        strong ? 'text-brand-cyan font-bold' : 'text-foreground font-medium',
      )}
    >
      {children}
    </span>
  );
}

function OrganizationTile({
  organization,
  label,
}: {
  organization: Organization;
  /** Omitted when the row already carries one shared label. */
  label?: string;
}) {
  const { tile, logo, sizes } = ROLES[organization.role];

  const plate = (
    <span
      className={cn(
        'logo-plate lift flex items-center justify-center rounded-xl px-5 py-3',
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
        /* The plate is white in every theme, so the fallback name is navy in
           every theme — it cannot inherit the page foreground here. */
        <span className="text-center text-sm font-semibold text-balance text-[#001f4b]">
          {organization.name}
        </span>
      )}
    </span>
  );

  return (
    <figure className="flex flex-col items-center gap-2">
      {label && <RoleLabel strong={organization.role === 'organizer'}>{label}</RoleLabel>}

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

      {/* The logo carries the name visually; keep it for screen readers and
          for anyone hovering, without spending a line of height on it. */}
      {organization.logo && <figcaption className="sr-only">{organization.name}</figcaption>}
    </figure>
  );
}

/**
 * The organizations behind the festival: the organizer centred between its two
 * co-organizers, with the coordinating entities on the row below.
 *
 * The arrangement is composed rather than a plain grid, but nothing here
 * assumes the 1 / 2 / 2 split — an extra logo in the CMS simply wraps.
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
    <div>
      {/* No panel of its own any more: the band behind it is the grouping.
          A tinted box on a tinted band is one container too many. */}

      <ul className="flex flex-wrap items-end justify-center gap-x-8 gap-y-6 sm:gap-x-10">
        {topRow.map((organization, i) => (
          <li
            key={`${organization.role}-${i}`}
            className={cn(organization.role === 'organizer' && 'order-first sm:order-none')}
          >
            <ScrollReveal delay={i * 80}>
              <OrganizationTile organization={organization} label={labels[organization.role]} />
            </ScrollReveal>
          </li>
        ))}
      </ul>

      {coordinators.length > 0 && (
        <div className="mt-8 sm:mt-10">
          {/* One label for the pair — repeating it over each logo reads as two
              separate roles rather than one group. */}
          <RoleLabel>{labels.coordinator}</RoleLabel>

          <ul className="mt-3 flex flex-wrap items-end justify-center gap-x-8 gap-y-6 sm:gap-x-10">
            {coordinators.map((organization, i) => (
              <li key={`coordinator-${i}`}>
                <ScrollReveal delay={i * 80}>
                  <OrganizationTile organization={organization} />
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
