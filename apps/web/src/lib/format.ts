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
