/**
 * Regenerates src/components/location/venue-geography.ts.
 *
 *   node scripts/build-venue-geography.mjs
 *
 * Run by hand when the venue moves or the framing needs to change. It is not
 * part of the build: it needs network access, and the artwork must not change
 * silently because OpenStreetMap was edited or the Overpass API was slow.
 * Committing the output keeps the hero byte-identical between builds.
 *
 * Everything in the generated file is real map geometry - nothing is drawn by
 * hand, and no coordinate is placed by eye. Source: OpenStreetMap via the
 * Overpass API. Contains information from OpenStreetMap, which is made
 * available here under the Open Database License (ODbL) v1.0.
 * https://www.openstreetmap.org/copyright
 *
 * Overpass rate-limits aggressively and returns 429 or a truncated body under
 * load. Both queries below are retried once, and the script fails loudly rather
 * than writing a half-empty artwork.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'components',
  'location',
  'venue-geography.ts',
);

/** 171-173 Tran Hung Dao, Son Tra, Da Nang. */
const VENUE = { lat: 16.06788, lon: 108.22988 };

/**
 * The framing. Widen to show more of the city, narrow to show more street
 * detail. `CENTER` is nudged off the venue in metres so the composition puts
 * the river and the marker where the hero's copy leaves them visible - the two
 * numbers to touch if the hero's layout changes.
 */
const WIN_W_M = 2200;
const ASPECT = 1.6;
const VB_W = 1600;

const WIN_H_M = WIN_W_M / ASPECT;
const VB_H = Math.round(VB_W / ASPECT);
const LAT_M = 110574;
const LON_M = 111320 * Math.cos((VENUE.lat * Math.PI) / 180);

const CENTER = { lat: VENUE.lat + -277 / LAT_M, lon: VENUE.lon + -68 / LON_M };

/* Mirrors, tried in order. The main instance rate-limits and occasionally
   refuses connections outright; a second endpoint turns a failed regeneration
   into a slow one. */
const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

/* Overpass answers a request without a descriptive User-Agent with 406, and
   asks that bulk users identify themselves. */
const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'sif-web-venue-geography/1.0 (+https://sontrainnovationfest.vn)',
};

async function overpass(query) {
  let lastError;
  for (const endpoint of OVERPASS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // Form-encoded, not a raw body: Overpass rejects a text/plain POST.
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: HEADERS,
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(120_000),
        });
        const text = await res.text();
        if (res.ok && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          if (json.elements?.length) return json;
        }
        lastError = new Error(`${res.status} ${text.slice(0, 120)}`);
      } catch (error) {
        lastError = error;
      }
      await new Promise((r) => setTimeout(r, 4000));
    }
    console.warn(`  ${endpoint} unavailable (${lastError?.message}), trying next mirror`);
  }
  throw new Error(`Every Overpass mirror failed. Last error: ${lastError?.message}`);
}

const bbox = '16.055,108.215,16.080,108.245';
const streets = await overpass(`[out:json][timeout:60];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified)$"](${bbox});
);
out geom;`);

/* A wider box than the streets query on purpose. Song Han is a multipolygon
   whose members run well past the view window, and clipped to the street bbox
   Overpass returns it in pieces the ring cannot be closed from. */
const water = await overpass(`[out:json][timeout:90];
(
  relation["natural"="water"](15.97,108.17,16.13,108.28);
  way["natural"="water"](15.97,108.17,16.13,108.28);
);
out geom;`);

/* ------------------------------------------------------------- projection */

const project = (lon, lat) => ({
  x: VB_W / 2 + ((lon - CENTER.lon) * LON_M * VB_W) / WIN_W_M,
  y: VB_H / 2 - ((lat - CENTER.lat) * LAT_M * VB_H) / WIN_H_M,
});

/* -------------------------------------------------------------- simplify */

function perpDist(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

/** Ramer-Douglas-Peucker, iterative so a long way cannot blow the stack. */
function rdp(points, tol) {
  if (points.length < 3) return points;
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxD = 0;
    let idx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpDist(points[i], points[first], points[last]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > tol && idx !== -1) {
      keep[idx] = true;
      stack.push([first, idx], [idx, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/* ------------------------------------------------------------------ clip */

const PAD = 60;
const inside = (p) => p.x >= -PAD && p.x <= VB_W + PAD && p.y >= -PAD && p.y <= VB_H + PAD;

function edgePoint(outside, insidePt) {
  const dx = insidePt.x - outside.x;
  const dy = insidePt.y - outside.y;
  let t = 1;
  for (const [lim, d, o] of [
    [-PAD, dx, outside.x],
    [VB_W + PAD, dx, outside.x],
    [-PAD, dy, outside.y],
    [VB_H + PAD, dy, outside.y],
  ]) {
    if (d !== 0) {
      const tt = (lim - o) / d;
      if (tt > 0 && tt < t) t = tt;
    }
  }
  return { x: outside.x + dx * t, y: outside.y + dy * t };
}

function clipLine(points) {
  const runs = [];
  let run = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (inside(p)) {
      run.push(p);
      continue;
    }
    if (run.length) {
      const prev = points[i - 1];
      if (prev && inside(prev)) run.push(edgePoint(p, prev));
      runs.push(run);
      run = [];
    }
    const next = points[i + 1];
    if (next && inside(next)) run.push(edgePoint(p, next));
  }
  if (run.length) runs.push(run);
  return runs.filter((r) => r.length >= 2);
}

/** Sutherland-Hodgman against the padded box. */
function clipPoly(poly) {
  const edges = [
    (p) => p.x >= -PAD,
    (p) => p.x <= VB_W + PAD,
    (p) => p.y >= -PAD,
    (p) => p.y <= VB_H + PAD,
  ];
  const inter = (a, b, i) => {
    const t =
      i === 0
        ? (-PAD - a.x) / (b.x - a.x)
        : i === 1
          ? (VB_W + PAD - a.x) / (b.x - a.x)
          : i === 2
            ? (-PAD - a.y) / (b.y - a.y)
            : (VB_H + PAD - a.y) / (b.y - a.y);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  };
  let out = poly;
  for (let i = 0; i < 4; i++) {
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const cur = input[j];
      const prev = input[(j + input.length - 1) % input.length];
      const curIn = edges[i](cur);
      const prevIn = edges[i](prev);
      if (curIn) {
        if (!prevIn) out.push(inter(prev, cur, i));
        out.push(cur);
      } else if (prevIn) {
        out.push(inter(prev, cur, i));
      }
    }
    if (!out.length) return [];
  }
  return out;
}

/* ----------------------------------------------------------- river ring */

/** Joins a multipolygon relation's outer ways head-to-tail into one ring. */
function stitch(ways) {
  const pool = ways.map((w) => w.map((p) => ({ lon: p.lon, lat: p.lat })));
  const ring = pool.shift();
  let guard = 0;
  while (pool.length && guard++ < 500) {
    const tail = ring[ring.length - 1];
    let best = -1;
    let bestFlip = false;
    let bestD = Infinity;
    for (let i = 0; i < pool.length; i++) {
      const w = pool[i];
      const dHead = Math.hypot(w[0].lon - tail.lon, w[0].lat - tail.lat);
      const dTail = Math.hypot(w[w.length - 1].lon - tail.lon, w[w.length - 1].lat - tail.lat);
      if (dHead < bestD) {
        bestD = dHead;
        best = i;
        bestFlip = false;
      }
      if (dTail < bestD) {
        bestD = dTail;
        best = i;
        bestFlip = true;
      }
    }
    const w = pool.splice(best, 1)[0];
    ring.push(...(bestFlip ? w.slice().reverse() : w).slice(1));
  }
  return ring;
}

/*
 * Song Han is mapped as a multipolygon and several water relations match a box
 * this size, so the river has to be picked deliberately.
 *
 * Not by containment: the venue stands on the bank, on dry land, so no water
 * polygon contains it. The nearest body is the right one - the river the
 * festival is held beside.
 */
const metresApart = (a, b) =>
  Math.hypot((a.lat - b.lat) * LAT_M, (a.lon - b.lon) * LON_M);

const riverCandidates = water.elements
  .filter((e) => e.type === 'relation' && e.members?.some((m) => m.geometry))
  .map((e) => ({
    element: e,
    ring: stitch(e.members.filter((m) => m.geometry).map((m) => m.geometry)),
  }))
  .filter(({ ring }) => ring.length > 3)
  .map((candidate) => ({
    ...candidate,
    distance: Math.min(...candidate.ring.map((p) => metresApart(VENUE, p))),
  }))
  .sort((a, b) => a.distance - b.distance);

const riverRel = riverCandidates[0]?.element;
if (!riverRel) throw new Error('No water relation found near the venue - has the OSM tagging changed?');
console.log(`  river relation ${riverRel.id}, ${Math.round(riverCandidates[0].distance)} m from the venue`);

/* Outer ways only: stitching the inner rings in as well would fold the islands
   into the outline and produce a self-intersecting path. */
const river = rdp(
  clipPoly(
    stitch(
      riverRel.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry),
    ).map((p) => project(p.lon, p.lat)),
  ),
  2.2,
);

/* ------------------------------------------------------------- streets */

const ROAD_CLASS = {
  trunk: 'major',
  primary: 'major',
  secondary: 'secondary',
  tertiary: 'minor',
  residential: 'minor',
  unclassified: 'minor',
};

const VENUE_STREET = 'Đường Trần Hưng Đạo';
const TOL = { major: 1.6, secondary: 2.0, minor: 3.0, street: 1.6 };
/** Runs shorter than this read as noise once simplified, so they are dropped. */
const MIN_RUN = { major: 0, secondary: 0, minor: 30, street: 0 };
const buckets = { major: [], secondary: [], minor: [], street: [] };

for (const e of streets.elements) {
  if (e.type !== 'way' || !e.geometry) continue;
  const t = e.tags || {};
  const bucket =
    t.name === VENUE_STREET ? 'street' : t.highway && ROAD_CLASS[t.highway] ? ROAD_CLASS[t.highway] : null;
  if (!bucket) continue;

  for (const run of clipLine(e.geometry.map((p) => project(p.lon, p.lat)))) {
    const simp = rdp(run, TOL[bucket]);
    if (simp.length < 2) continue;
    let len = 0;
    for (let i = 1; i < simp.length; i++) {
      len += Math.hypot(simp[i].x - simp[i - 1].x, simp[i].y - simp[i - 1].y);
    }
    if (len < MIN_RUN[bucket]) continue;
    buckets[bucket].push(simp);
  }
}

/* --------------------------------------------------------------- emit */

const q = Math.round;
const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${q(p.x)} ${q(p.y)}`).join('');
/** Merges subpaths into one `d`, so each layer is a single DOM node. */
const merge = (runs) => runs.map(path).join('');

const venue = project(VENUE.lon, VENUE.lat);

const out = `/**
 * Geography behind the Location hero: the Han River and the streets around the
 * venue, drawn from real map data.
 *
 * Source: OpenStreetMap via the Overpass API. Contains information from
 * OpenStreetMap, which is made available here under the Open Database License
 * (ODbL) v1.0 - https://www.openstreetmap.org/copyright
 *
 * Projected equirectangularly about the venue and clipped to a window of
 * ${(WIN_W_M / 1000).toFixed(1)} km x ${(WIN_H_M / 1000).toFixed(2)} km, then simplified with Douglas-Peucker.
 * The viewBox is ${VB_W}x${VB_H}, so one unit is about ${(WIN_W_M / VB_W).toFixed(2)} m on the ground.
 *
 * Generated by apps/web/scripts/build-venue-geography.mjs. Do not edit by hand:
 * every coordinate below comes from a mapped way, and nudging one here silently
 * detaches the artwork from the place it claims to show.
 */

export const VENUE_VIEWBOX = { width: ${VB_W}, height: ${VB_H} } as const;

/** The venue itself, in viewBox units. 171-173 Tran Hung Dao. */
export const VENUE_POINT = { x: ${q(venue.x)}, y: ${q(venue.y)} } as const;

/** Han River (Song Han) water, as a closed path. */
export const RIVER_PATH = '${path(river)}Z';

/** Smaller streets - the grain of the two riverbanks. */
export const MINOR_PATH = '${merge(buckets.minor)}';

/** Through-routes. */
export const SECONDARY_PATH = '${merge(buckets.secondary)}';

/** Trunk roads and the river crossings. */
export const MAJOR_PATH = '${merge(buckets.major)}';

/** Tran Hung Dao, the street the venue stands on. */
export const VENUE_STREET_PATH = '${merge(buckets.street)}';
`;

writeFileSync(OUT, out);

console.log(`wrote ${OUT}`);
console.log(
  `  river ${river.length} pts, minor ${buckets.minor.length} runs, secondary ${buckets.secondary.length}, ` +
    `major ${buckets.major.length}, venue street ${buckets.street.length}, ${out.length} bytes`,
);
