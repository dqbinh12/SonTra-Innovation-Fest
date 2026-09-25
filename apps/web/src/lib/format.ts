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
 * Extracts the `src` attribute from an iframe embed HTML string, or returns
 * the string if it is already a direct URL.
 */
export function extractMapEmbedSrc(embedHtmlOrUrl: string | null | undefined): string | null {
  if (!embedHtmlOrUrl) return null;
  const trimmed = embedHtmlOrUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/**
 * Google Maps `output=embed` URL for the venue.
 *
 * An explicit embed HTML/iframe or URL takes precedence when provided.
 * Coordinates win over the address string when the CMS has them — a text query
 * can resolve to the wrong side of a long street.
 */
export function mapEmbedUrl(
  lat: number | null,
  lng: number | null,
  address: string,
  locale: string,
  embedHtml?: string | null,
): string {
  const extracted = extractMapEmbedSrc(embedHtml);
  if (extracted) {
    return extracted;
  }
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
