/** Populate the homepage hero metrics without overwriting editor-managed content. */
import { compileStrapi, createStrapi, type Core } from '@strapi/strapi';

const uid = 'api::home-page.home-page' as Parameters<Core.Strapi['documents']>[0];

const stats = {
  en: [
    { value: '30+', label: 'Booths & Tech Demos' },
    { value: '15+', label: 'Panels & Keynotes' },
    { value: '5,000+', label: 'Attendees & Guests' },
    { value: '100%', label: 'Free Public Access' },
  ],
  vi: [
    { value: '30+', label: 'Gian hàng & Trình diễn' },
    { value: '15+', label: 'Phiên thảo luận & Talks' },
    { value: '5,000+', label: 'Khách tham quan' },
    { value: '100%', label: 'Vào cửa tự do' },
  ],
};

async function seedHomeStats(strapi: Core.Strapi) {
  for (const locale of ['en', 'vi'] as const) {
    const page = await strapi.documents(uid).findFirst({ locale, status: 'published' });
    if (!page) throw new Error(`Published Home Page is missing for locale: ${locale}`);

    // This utility deliberately uses a narrow untyped boundary: Strapi's
    // generic Document Service types do not infer a literal UID from this CLI.
    const documents = strapi.documents(uid) as any;
    const existing = await documents.findOne({
      documentId: page.documentId,
      locale,
      status: 'published',
      populate: { stats: true },
    });
    if (existing?.stats?.length) {
      strapi.log.info(`[home-stats] ${locale} already has ${existing.stats.length} stats, skipping`);
      continue;
    }

    await documents.update({
      documentId: page.documentId,
      locale,
      status: 'published',
      data: { stats: stats[locale] },
    });
    strapi.log.info(`[home-stats] populated ${locale}`);
  }
}

async function main() {
  const appContext = await compileStrapi();
  const strapi = await createStrapi(appContext).load();
  await seedHomeStats(strapi);
  await strapi.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
