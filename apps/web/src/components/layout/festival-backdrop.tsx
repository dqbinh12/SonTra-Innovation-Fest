type BackdropVariant = 'contact' | 'sponsors' | 'exhibition' | 'agenda';

const paths: Record<BackdropVariant, string[]> = {
  contact: [
    'M-80 220 C220 40 420 400 730 210 S1220 40 1530 250',
    'M-40 600 C250 390 520 760 850 520 S1270 400 1510 650',
  ],
  sponsors: [
    'M-80 180 C260 350 460 20 780 210 S1210 430 1530 190',
    'M-40 690 C260 470 560 820 900 570 S1280 430 1510 610',
  ],
  exhibition: [
    'M-100 260 C210 70 470 410 760 220 S1190 60 1540 300',
    'M-40 700 C250 510 520 770 840 590 S1240 410 1510 650',
  ],
  agenda: [
    'M-80 170 C230 390 470 20 790 220 S1230 420 1530 170',
    'M-50 670 C300 430 540 820 880 560 S1270 400 1510 640',
  ],
};

const nodes: Record<BackdropVariant, Array<[number, number, number]>> = {
  contact: [
    [250, 150, 5],
    [730, 210, 7],
    [1180, 105, 4],
    [850, 520, 5],
  ],
  sponsors: [
    [235, 300, 5],
    [780, 210, 7],
    [1200, 395, 5],
    [900, 570, 4],
  ],
  exhibition: [
    [210, 120, 4],
    [760, 220, 7],
    [1210, 110, 5],
    [840, 590, 5],
  ],
  agenda: [
    [250, 330, 5],
    [790, 220, 7],
    [1210, 400, 4],
    [880, 560, 5],
  ],
};

/** Ambient, non-interactive page artwork. Each route gets a distinct data-flow constellation. */
export function FestivalBackdrop({ variant }: { variant: BackdropVariant }) {
  return (
    <div aria-hidden="true" className={`festival-backdrop festival-backdrop--${variant}`}>
      <div className="festival-backdrop__grid" />
      <div className="festival-backdrop__glow festival-backdrop__glow--one" />
      <div className="festival-backdrop__glow festival-backdrop__glow--two" />
      <svg
        viewBox="0 0 1440 820"
        preserveAspectRatio="xMidYMin slice"
        className="festival-backdrop__svg"
      >
        <defs>
          <linearGradient id={`flow-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--color-brand-cyan)" stopOpacity=".7" />
            <stop offset=".52" stopColor="var(--color-brand-blue)" stopOpacity=".25" />
            <stop offset="1" stopColor="var(--color-brand-violet)" stopOpacity=".55" />
          </linearGradient>
        </defs>
        {paths[variant].map((path, index) => (
          <path
            key={path}
            d={path}
            className="festival-backdrop__path"
            stroke={`url(#flow-${variant})`}
            style={{ animationDelay: `${index * -7}s` }}
          />
        ))}
        {nodes[variant].map(([cx, cy, radius], index) => (
          <g
            key={`${cx}-${cy}`}
            className="festival-backdrop__node"
            style={{ animationDelay: `${index * -0.9}s` }}
          >
            <circle cx={cx} cy={cy} r={radius * 4} className="festival-backdrop__halo" />
            <circle cx={cx} cy={cy} r={radius} className="festival-backdrop__core" />
          </g>
        ))}
      </svg>
    </div>
  );
}
