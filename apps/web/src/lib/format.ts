/**
 * Strapi `time` fields come back as "09:00:00.000". The site only ever shows
 * hours and minutes.
 */
export function formatTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 5);
}

/** Google Maps link for the venue, from the coordinates in the CMS. */
export function mapsUrl(lat: number | null, lng: number | null, address: string): string {
  const query = lat != null && lng != null ? `${lat},${lng}` : address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Google Maps `output=embed` URL for the venue.
 *
 * The keyless classic-maps embed rather than the Maps Embed API: the latter
 * needs a billing-enabled browser key shipped to the client, and the only
 * thing this page asks of a map is "show this pin". Coordinates win over the
 * address string when the CMS has them — a text query can resolve to the
 * wrong side of a long street.
 */
export function mapEmbedUrl(
  lat: number | null,
  lng: number | null,
  address: string,
  locale: string,
): string {
  const query = lat != null && lng != null ? `${lat},${lng}` : address;
  const params = new URLSearchParams({ q: query, z: '16', hl: locale, output: 'embed' });
  return `https://www.google.com/maps?${params.toString()}`;
}

/**
 * Google Maps turn-by-turn link, from wherever the visitor happens to be.
 * `mapsUrl` drops a pin; this one opens the directions panel.
 */
export function directionsUrl(lat: number | null, lng: number | null, address: string): string {
  const destination = lat != null && lng != null ? `${lat},${lng}` : address;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
