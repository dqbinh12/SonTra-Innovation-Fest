import { MAJOR_PATH, MINOR_PATH, RIVER_PATH, SECONDARY_PATH, VENUE_POINT, VENUE_STREET_PATH, VENUE_VIEWBOX } from './venue-geography';

/**
 * The Location hero's ground.
 *
 * This page used to open on the same abstract chrome as the About page: a
 * square grid motif and two blurred streaks. Those could have sat behind any
 * page on the site. This one is the actual place — the Han River, the two
 * banks, and the street the venue stands on, drawn from OpenStreetMap geometry
 * (see `venue-geography.ts` for the query and the licence).
 *
 * It is a server component and carries no interactivity: the artwork is five
 * path elements, one per layer, with every one of the ~370 subpaths merged into
 * a single `d`. That keeps the backdrop at about a dozen DOM nodes instead of
 * one per street.
 *
 * The composition is deliberately anchored rather than decorative. The marker
 * is not a design flourish placed by eye: it is the projected coordinate of
 * 171-173 Tran Hung Dao, and the mint line through it is Tran Hung Dao itself.
 * If the venue ever moves, the window is re-projected, not nudged.
 *
 * The `<defs>` gradient is inline rather than in CSS because a paint server
 * cannot be expressed as a `fill` value in a stylesheet. The colours still come
 * from the brand tokens, so a palette change still flows through here.
 */
export function LocationBackdrop() {
  return (
    <div aria-hidden="true" className="venue-backdrop">
      <svg
        viewBox={`0 0 ${VENUE_VIEWBOX.width} ${VENUE_VIEWBOX.height}`}
        // `slice`, not `meet`: the artwork has to cover the hero at every aspect
        // ratio. Stretching it would shear the true angles of the river and the
        // street grid, which is the one thing a real map cannot do.
        preserveAspectRatio="xMidYMid slice"
        className="venue-backdrop__svg"
      >
        <defs>
          {/*
            Water reads as a body, not as a hole: the river is lifted *out* of
            the navy ground rather than cut into it, because on a page this dark
            a darker shape is simply invisible. Both stops sit far below the
            alpha of the copy, so the headline keeps its contrast across the
            whole channel.
          */}
          <linearGradient id="venue-water" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-cyan)" stopOpacity="0.15" />
            <stop offset="55%" stopColor="var(--color-brand-blue)" stopOpacity="0.31" />
            <stop offset="100%" stopColor="var(--color-brand-blue)" stopOpacity="0.27" />
          </linearGradient>
        </defs>

        {/*
          Order is cartographic: water, then the finest streets, then the
          through-routes on top. Drawing the grain first and the arteries last
          is what makes a dense network read as depth instead of as a flat mat.
        */}
        <path d={RIVER_PATH} className="venue-backdrop__water" />

        <path d={MINOR_PATH} className="venue-backdrop__street venue-backdrop__street--minor" />
        <path
          d={SECONDARY_PATH}
          className="venue-backdrop__street venue-backdrop__street--secondary"
        />
        <path d={MAJOR_PATH} className="venue-backdrop__street venue-backdrop__street--major" />

        {/* The venue's own street, so the marker below has something to sit on. */}
        <path
          d={VENUE_STREET_PATH}
          className="venue-backdrop__street venue-backdrop__street--venue"
        />

        {/*
          "You are going here." A halo for the neighbourhood, a ring for the
          block, a dot for the door, plus a pulse that leaves the ring. The
          halo radius is about 60 m on the ground, which is the walk from the
          street to the gate.
        */}
        <g
          className="venue-backdrop__venue"
          transform={`translate(${VENUE_POINT.x} ${VENUE_POINT.y})`}
        >
          <circle r="34" className="venue-backdrop__venue-halo" />
          <circle r="34" className="venue-backdrop__venue-pulse" />
          <circle r="11" className="venue-backdrop__venue-ring" />
          <circle r="3.5" className="venue-backdrop__venue-dot" />
        </g>
      </svg>
    </div>
  );
}
