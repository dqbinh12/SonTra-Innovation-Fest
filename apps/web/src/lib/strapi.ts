import type { Locale, StrapiResponse } from '@sif/shared';

const STRAPI_URL = process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export class StrapiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

type QueryValue = string | number | boolean | undefined | null;

interface FetchOptions {
  /** Locale to request. Strapi's i18n plugin uses the `locale` query param. */
  locale?: Locale;
  /** Extra query params, e.g. `{ 'populate': '*', 'sort[0]': 'date:desc' }`. */
  query?: Record<string, QueryValue>;
  /**
   * Cache tags for on-demand revalidation. The CMS webhook hits
   * /api/revalidate, which calls revalidateTag() with the matching tag.
   */
  tags?: string[];
  /** Seconds. Falls back to a 1 hour safety net on top of tag revalidation. */
  revalidate?: number;
}

function buildUrl(path: string, { locale, query }: FetchOptions): string {
  const url = new URL(`/api/${path.replace(/^\//, '')}`, STRAPI_URL);
  if (locale) url.searchParams.set('locale', locale);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * Fetch a collection or single type from Strapi.
 * Returns the raw `{ data, meta }` envelope so pagination stays available.
 */
export async function strapiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<StrapiResponse<T>> {
  const response = await fetch(buildUrl(path, options), {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
    },
    next: {
      tags: options.tags ?? [path],
      revalidate: options.revalidate ?? 3600,
    },
  });

  if (!response.ok) {
    throw new StrapiError(`Strapi request failed: GET /api/${path}`, response.status);
  }

  return response.json() as Promise<StrapiResponse<T>>;
}

/**
 * Same as strapiFetch, but returns null instead of throwing when the entry is
 * missing or the CMS is unreachable. Use this for content the page can render
 * without — a single type the client has not filled in yet should show an empty
 * section, not a 500, and `next build` should not require a running Strapi.
 */
export async function strapiFetchOptional<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T | null> {
  try {
    const { data } = await strapiFetch<T>(path, options);
    return data ?? null;
  } catch (error) {
    if (error instanceof StrapiError && error.status >= 500) throw error;
    console.warn(`[strapi] optional fetch failed for "${path}":`, error);
    return null;
  }
}

/** POST a public form submission (contact, sponsor application). */
export async function strapiSubmit<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(buildUrl(path, {}), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
    },
    body: JSON.stringify({ data: payload }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new StrapiError(`Strapi submission failed: POST /api/${path}`, response.status);
  }

  return response.json() as Promise<T>;
}
