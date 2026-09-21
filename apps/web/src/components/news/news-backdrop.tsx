/**
 * The News page's ground — Neural Synapses & Vector Constellation.
 *
 * Echoes the approach of `<LocationBackdrop>`, but where that page draws the
 * geographical geography of the venue, this one visualises the festival's
 * intellectual substrate: an interconnected AI neural network / knowledge graph.
 *
 * It is a pure server component with zero JS overhead:
 * - Ambient radial orbs blend into deep navy space.
 * - A subtle math dot-matrix defines the latent coordinate grid.
 * - Curved SVG streams represent data axons carrying information across topics.
 * - Key AI synapse nodes emit a gentle radar heartbeat pulse.
 * - Nested masks ensure copy contrast is preserved across all viewport sizes.
 */
export function NewsBackdrop() {
  return (
    <div aria-hidden="true" className="news-backdrop">
      {/* ─── 1. Ambient Lighting Washes ─────────────────────────────────── */}
      <div className="news-backdrop__ambient-blue" />
      <div className="news-backdrop__ambient-violet" />
      <div className="news-backdrop__ambient-teal" />

      {/* ─── 2. Latent Coordinate Dot Grid ──────────────────────────────── */}
      <div className="news-backdrop__dot-grid" />

      {/* ─── 3. Neural Synapses & Axon Streams (SVG) ────────────────────── */}
      <svg
        viewBox="0 0 1440 960"
        preserveAspectRatio="xMidYMid slice"
        className="news-backdrop__svg"
      >
        <defs>
          <linearGradient id="news-synapse-cyan-violet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand-cyan)" stopOpacity="0.85" />
            <stop offset="48%" stopColor="var(--color-brand-blue)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-brand-violet)" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="news-synapse-mint-cyan" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand-mint)" stopOpacity="0.7" />
            <stop offset="55%" stopColor="var(--color-brand-teal)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-brand-cyan)" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="news-bridge-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-brand-cyan)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--color-brand-mint)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-brand-cyan)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* ── Neural Streams (Curved Synaptic Pathways) ────────────────── */}
        <path
          d="M -100 240 C 260 110, 480 340, 880 170 S 1320 390, 1600 220"
          className="news-backdrop__stream news-backdrop__stream--primary"
        />
        <path
          d="M -60 410 C 310 530, 640 230, 1020 430 S 1400 270, 1560 520"
          className="news-backdrop__stream news-backdrop__stream--secondary"
        />

        {/* Vertical/Diagonal Knowledge Cross-Lines */}
        <path d="M 340 -40 C 390 270, 680 490, 810 980" className="news-backdrop__connection" />
        <path
          d="M 1120 -60 C 1070 230, 1320 640, 1430 1020"
          className="news-backdrop__connection news-backdrop__connection--violet"
        />

        {/* Cross Synaptic Bridges */}
        <line x1="330" y1="200" x2="490" y2="370" className="news-backdrop__bridge" />
        <line x1="880" y1="170" x2="1020" y2="430" className="news-backdrop__bridge" />
        <line x1="1020" y1="430" x2="1320" y2="390" className="news-backdrop__bridge" />

        {/* ── Key Synapse Hubs (Pulsing AI Nodes) ───────────────────────── */}
        {/* Node A (Header Left Anchor) */}
        <g transform="translate(330, 200)" className="news-backdrop__node">
          <circle r="26" className="news-backdrop__pulse news-backdrop__pulse--cyan" />
          <circle r="10" className="news-backdrop__halo news-backdrop__halo--cyan" />
          <circle r="4" className="news-backdrop__core news-backdrop__core--cyan" />
        </g>

        {/* Node B (Central Intelligence Hub - Mint Glow) */}
        <g transform="translate(880, 170)" className="news-backdrop__node">
          <circle
            r="38"
            className="news-backdrop__pulse news-backdrop__pulse--mint"
            style={{ animationDelay: '1.4s' }}
          />
          <circle r="14" className="news-backdrop__halo news-backdrop__halo--mint" />
          <circle r="5" className="news-backdrop__core news-backdrop__core--mint" />
        </g>

        {/* Node C (Mid-Page Topic Cluster - Violet Glow) */}
        <g transform="translate(1020, 430)" className="news-backdrop__node">
          <circle
            r="28"
            className="news-backdrop__pulse news-backdrop__pulse--violet"
            style={{ animationDelay: '0.7s' }}
          />
          <circle r="11" className="news-backdrop__halo news-backdrop__halo--violet" />
          <circle r="4" className="news-backdrop__core news-backdrop__core--violet" />
        </g>

        {/* Secondary Constellation Data Points */}
        <circle cx="490" cy="370" r="3" fill="var(--color-brand-cyan)" opacity="0.85" />
        <circle cx="1320" cy="390" r="3.5" fill="var(--color-brand-mint)" opacity="0.8" />
        <circle cx="680" cy="270" r="2.5" fill="#ffffff" opacity="0.65" />
        <circle cx="190" cy="460" r="2.5" fill="var(--color-brand-cyan)" opacity="0.5" />
        <circle cx="810" cy="620" r="3" fill="var(--color-brand-teal)" opacity="0.6" />
      </svg>
    </div>
  );
}
