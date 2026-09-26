import type { Organization, OrganizationRole } from '@sif/shared';
import { StrapiImage } from '@/components/strapi-image';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { cn } from '@/lib/utils';

/**
 * Plate size for the coordinating entity, which sits on a row of its own.
 */
const COORDINATOR_TILE = {
  tile: 'h-16 w-36 lg:h-18 lg:w-44',
  logo: 'max-h-8 sm:max-h-10',
  sizes: '176px',
};

/**
 * Plate size for the supporting tiers. Every tier uses this one size, so the
 * sponsor logos and the partner logos read as peers rather than as a ranked
 * group — the client asked for the partners to be the same size as the tiers
 * beside them, not gathered into a smaller cluster.
 *
 * Width is fluid (`w-full`) and capped by the cell, which is what makes one
 * constant work across breakpoints: six equal columns at `lg` leave roughly
 * 140–160px each, and the same plate fills the wider cells at `sm` up to the
 * 176px cap. Fixed widths cannot do this — six plates at the old 176px need
 * 1088px of plates alone, before the gaps.
 */
const SUPPORT_TILE = {
  tile: 'h-16 w-full xl:h-18',
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
  'media-sponsor': SUPPORT_TILE,
  'venue-sponsor': SUPPORT_TILE,
  'silver-sponsor': SUPPORT_TILE,
  partner: SUPPORT_TILE,
};

/**
 * Ordering of the supporting roles below the organizing pair, in the order the
 * client lists them.
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
        organization.logo ? tile : 'h-auto min-h-16 w-full',
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
    <figure className="flex w-full flex-col items-center gap-2.5 sm:gap-3">
      {label && <RoleLabel strong={organization.role === 'organizer'}>{label}</RoleLabel>}

      {organization.link ? (
        <a
          href={organization.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={organization.name}
          className="block w-full"
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
 * co-organizers, then the coordinating entity, then the supporting tiers.
 *
 * Each supporting organization is one unit of its own, laid out on a single
 * grid row with the rest. A tier holding several organizations — the partners
 * — used to render as one cell whose members stacked inside it, which made
 * that column as many plates tall as it had members and left an L-shaped hole
 * under its neighbours; gathering them into a smaller cluster instead made the
 * partner logos visibly smaller than the tiers they sit beside. Spreading them
 * as peers of the same size solves both, and the grid keeps the six columns
 * even so nothing is sized by how long its own label happens to be.
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
   * One unit per supporting organization, in the client's listed tier order.
   * Building it by flattening the roles — rather than mapping roles to cells —
   * is what keeps an organization from being merged with its tier-mates.
   */
  const supportUnits = SUPPORT_ROLES.flatMap((role) =>
    byRole(role).map((organization) => ({ role, organization })),
  );

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

      {supportUnits.length > 0 && (
        /* Even columns, so a long label ("ĐƠN VỊ BẢO TRỢ TRUYỀN THÔNG") wraps
           inside its own cell instead of widening it and shifting every plate
           after it. Two columns on phones, three from `sm`, all on one row
           from `lg`. */
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:mt-12 sm:grid-cols-3 sm:gap-x-8 lg:mt-14 lg:grid-cols-6 lg:gap-x-6">
          {supportUnits.map(({ role, organization }, i) => (
            <li key={`${role}-${i}`} className="flex flex-col items-center">
              {/* A fixed label height keeps every plate on one line across the
                  row; `items-end` sits single-line labels on that baseline
                  instead of floating them mid-height. */}
              <RoleLabel className="flex min-h-10 items-end justify-center text-balance">
                {labels[role]}
              </RoleLabel>

              <ScrollReveal className="mx-auto mt-3.5 w-full max-w-44 sm:mt-4" delay={i * 60}>
                <OrganizationTile organization={organization} />
              </ScrollReveal>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
