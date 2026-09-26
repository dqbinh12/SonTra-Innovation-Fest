import type { Organization, OrganizationRole } from '@sif/shared';
import { StrapiImage } from '@/components/strapi-image';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { cn } from '@/lib/utils';

/**
 * Tile size per role. The organizer is the headline logo and the co-organizers
 * flank it; everything below that is a peer tier, so the coordinating entities
 * and the four supporting roles share one plate size — a descending scale
 * would read as a shrinking hierarchy the client never asked for.
 *
 * The supporting plate stays narrow until `lg`, where four of them fit on one
 * row at 176px; between 768 and 1023 the narrower plate is what keeps the row
 * from wrapping.
 */
const COORDINATOR_TILE = {
  tile: 'h-16 w-36 lg:h-18 lg:w-44',
  logo: 'max-h-8 sm:max-h-10',
  sizes: '176px',
};

const ROLES: Record<OrganizationRole, { tile: string; logo: string; sizes: string }> = {
  organizer: {
    tile: 'h-22 w-48 sm:h-24 sm:w-56',
    logo: 'max-h-12 sm:max-h-14',
    sizes: '224px',
  },
  'co-organizer': {
    tile: 'h-18 w-40 sm:h-20 sm:w-48',
    logo: 'max-h-9 sm:max-h-11',
    sizes: '192px',
  },
  coordinator: COORDINATOR_TILE,
  'media-sponsor': COORDINATOR_TILE,
  'venue-sponsor': COORDINATOR_TILE,
  'silver-sponsor': COORDINATOR_TILE,
  partner: COORDINATOR_TILE,
};

/**
 * Ordering of the supporting roles below the organizing pair. Each one is
 * rendered as its own labelled row, in the order the client lists them, so a
 * role with a single organization still reads as a tier rather than a stray
 * logo.
 */
const SUPPORT_ROLES: OrganizationRole[] = [
  'media-sponsor',
  'venue-sponsor',
  'silver-sponsor',
  'partner',
];

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
function RoleLabel({
  children,
  strong = false,
  className,
}: {
  children: string;
  strong?: boolean;
  /** Extra layout classes — used to reserve two lines so labels pair with plates. */
  className?: string;
}) {
  return (
    <span
      className={cn(
        'block text-center text-xs tracking-[0.2em] uppercase',
        strong ? 'text-brand-cyan font-bold' : 'text-foreground font-medium',
        className,
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

  /**
   * A plate with a logo keeps its fixed tile. A plate falling back to the
   * organisation's name has to be free to grow: Vietnamese names run to three
   * lines at this width, and a fixed height clips them.
   */
  const plate = (
    <span
      className={cn(
        'logo-plate lift flex items-center justify-center rounded-xl px-5 py-3',
        organization.logo ? tile : 'h-auto min-h-16 w-36 lg:min-h-18 lg:w-44',
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
        <span className="text-center text-[0.8rem] leading-snug font-semibold text-balance text-[#001f4b] sm:text-sm">
          {organization.name}
        </span>
      )}
    </span>
  );

  return (
    <figure className="flex flex-col items-center gap-2.5 sm:gap-3">
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
 * co-organizers, then the coordinating entities and the four supporting roles
 * as labelled rows below.
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

  /**
   * The four supporting tiers, in the client's listed order. They share one
   * row — label on top, plate underneath — so read left to right they read as
   * the four sponsorship tiers rather than four stacked sections.
   *
   * A single CSS grid is what keeps each label above its own plate: two
   * stacked grids would lose the pairing the moment a label wrapped to a
   * second line. On phones the four collapse to two columns.
   */
  const supportRoles = SUPPORT_ROLES.filter((role) => byRole(role).length > 0);

  /**
   * Split the supporting tiers by how many organizations each holds.
   *
   * A tier with a single organization is one cell wide, so several of them sit
   * on one balanced row. A tier holding several — the partners, in practice —
   * cannot: stacking its logos vertically inside a single grid cell makes that
   * column as many plates tall as it has members, which pushes a large
   * L-shaped hole under the neighbouring cells. Those tiers therefore get a
   * row of their own below, with their logos side by side.
   */
  const singleTiers = supportRoles.filter((role) => byRole(role).length === 1);
  const multiTiers = supportRoles.filter((role) => byRole(role).length > 1);

  return (
    <div>
      {/* No panel of its own any more: the band behind it is the grouping.
          A tinted box on a tinted band is one container too many. */}

      <ul className="flex flex-wrap items-end justify-center gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-6 lg:gap-x-14">
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
        <div className="mt-10 sm:mt-12 lg:mt-14">
          {/* One label for the row — repeating it over each logo reads as
              separate roles rather than one group. */}
          <RoleLabel>{labels.coordinator}</RoleLabel>

          <ul className="mt-3.5 flex flex-wrap items-end justify-center gap-x-6 gap-y-4 sm:mt-4 sm:gap-x-8 sm:gap-y-5 lg:gap-x-10">
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

      {singleTiers.length > 0 && (
        <ul className="mt-10 flex flex-wrap items-end justify-center gap-x-6 gap-y-9 sm:mt-12 sm:gap-x-8 lg:mt-14 lg:gap-x-10">
          {singleTiers.map((role) => {
            const members = byRole(role);

            return (
              /* The cell is pinned to the plate's width rather than sized by
                 its label. A long label ("ĐƠN VỊ BẢO TRỢ TRUYỀN THÔNG") is
                 wider than the plate under it, and letting it size the cell
                 shifted every plate after it — the row read as drifting to
                 the right. The label now wraps inside the plate's width. */
              <li key={role} className="flex w-36 flex-col items-center lg:w-44">
                {/* A fixed label height keeps every plate on one line across
                    the row; `items-end` sits single-line labels on that
                    baseline instead of floating them mid-height. */}
                <RoleLabel className="flex min-h-10 w-full items-end justify-center text-balance">
                  {labels[role]}
                </RoleLabel>

                <div className="mt-3.5 flex flex-wrap items-end justify-center gap-x-6 gap-y-4 sm:mt-4 sm:gap-x-8 sm:gap-y-5 lg:gap-x-10">
                  {members.map((organization, i) => (
                    <ScrollReveal key={`${role}-${i}`} delay={i * 80}>
                      <OrganizationTile organization={organization} />
                    </ScrollReveal>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Tiers holding more than one organization get their own row, logos
          side by side, so no column grows taller than its neighbours. */}
      {multiTiers.map((role) => {
        const members = byRole(role);

        return (
          <div key={role} className="mt-10 sm:mt-12 lg:mt-14">
            <RoleLabel>{labels[role]}</RoleLabel>

            <ul className="mt-3.5 flex flex-wrap items-end justify-center gap-x-6 gap-y-6 sm:mt-4 sm:gap-x-8 lg:gap-x-10">
              {members.map((organization, i) => (
                <li key={`${role}-${i}`} className="flex justify-center">
                  <ScrollReveal delay={i * 80}>
                    <OrganizationTile organization={organization} />
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
