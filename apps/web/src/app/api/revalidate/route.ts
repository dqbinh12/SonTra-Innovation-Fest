import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * On-demand ISR. Point a Strapi webhook (Settings → Webhooks) at
 *   POST {SITE_URL}/api/revalidate
 * with header `x-revalidate-secret: {REVALIDATE_SECRET}`.
 *
 * Strapi sends `{ model, entry, event }`; the model name is used as the cache
 * tag, matching the `tags` passed in src/lib/strapi.ts.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json({ message: 'REVALIDATE_SECRET is not configured' }, { status: 500 });
  }

  if (request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  let body: { model?: string; entry?: { slug?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.model) {
    return NextResponse.json({ message: 'Missing "model" in payload' }, { status: 400 });
  }

  // Strapi sends singular model names ("article"); the fetch tags use the API
  // id ("articles"), so revalidate both plus the per-entry tag.
  const tags = [body.model, `${body.model}s`];
  if (body.entry?.slug) tags.push(`${body.model}:${body.entry.slug}`);

  // 'max' expires the tag as soon as Next.js allows — the CMS is the source of
  // truth, so a publish should show up on the next request.
  for (const tag of tags) revalidateTag(tag, 'max');

  return NextResponse.json({ revalidated: tags, now: Date.now() });
}
