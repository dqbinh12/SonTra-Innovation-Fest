/** Seed the official Media Kit folder URL without overwriting editor-managed content. */
import { compileStrapi, createStrapi, type Core } from '@strapi/strapi';

const uid = 'api::media-page.media-page' as Parameters<Core.Strapi['documents']>[0];
const mediaKitUrl = 'https://drive.google.com/drive/folders/1OU1U1nTF-wFXWOrwW3rLZVCnMBg7bxOl';

async function seedMediaKitUrl(strapi: Core.Strapi) {
  const documents = strapi.documents(uid) as any;

  for (const locale of ['en', 'vi'] as const) {
    const page = await documents.findFirst({ locale, status: 'published' });
    if (!page) {
      strapi.log.warn(`[media-kit-url] No published Media Page found for locale ${locale}`);
      continue;
    }

    const existing = await documents.findOne({
      documentId: page.documentId,
      locale,
      status: 'published',
    });

    if (existing?.mediaKitUrl === mediaKitUrl) {
      strapi.log.info(`[media-kit-url] ${locale} already has the official folder URL, skipping`);
      continue;
    }

    await documents.update({
      documentId: page.documentId,
      locale,
      status: 'published',
      data: { mediaKitUrl },
    });
    strapi.log.info(`[media-kit-url] set official folder URL for ${locale}`);
  }
}

async function main() {
  const appContext = await compileStrapi();
  const strapi = await createStrapi(appContext).load();
  await seedMediaKitUrl(strapi);
  await strapi.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
