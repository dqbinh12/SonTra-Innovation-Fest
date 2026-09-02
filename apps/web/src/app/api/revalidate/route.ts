import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * On-demand ISR — the endpoint the CMS calls when content changes.
 *
 * The Strapi side registers itself automatically on boot; see
 * apps/cms/src/bootstrap/revalidation-webhook.ts. Nobody has to set this up by
 * hand, as long as SITE_URL and REVALIDATE_SECRET are set for the CMS.
 *
 * Strapi sends `{ model, entry, event }`; the model name becomes the cache tag,
 * matching the `tags` passed in src/lib/strapi.ts.
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

  // `{ expire: 0 }` rather than the 'max' profile Next recommends.
  //
  // 'max' uses stale-while-revalidate: the first request after a publish is
  // still served the old page while the new one builds in the background. For
  // an editor who publishes and immediately reloads, that looks like the site
  // ignoring them — a support call we do not want during the event.
  //
  // With expire: 0 the next request blocks until the fetch completes and gets
  // fresh content. It costs one slow request per publish, which is nothing at
  // this publishing frequency.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: tags, now: Date.now() });
}
