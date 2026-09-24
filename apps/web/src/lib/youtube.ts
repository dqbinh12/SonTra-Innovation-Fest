/**
 * Extracts a YouTube video ID from various YouTube URL formats
 * (standard watch, shortened youtu.be, embed, shorts, etc.).
 */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v) return v;

      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'v', 'shorts', 'live'].includes(pathSegments[0]) && pathSegments[1]) {
        return pathSegments[1];
      }
    } else if (hostname === 'youtu.be') {
      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      if (pathSegments[0]) {
        return pathSegments[0];
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Returns a privacy-enhanced embed URL for a given YouTube URL.
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
