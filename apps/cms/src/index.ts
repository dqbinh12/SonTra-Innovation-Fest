import type { Core } from '@strapi/strapi';
import { ensureLocales } from './bootstrap/locales';
import { grantPublicPermissions } from './bootstrap/public-permissions';
import { registerRevalidationWebhook } from './bootstrap/revalidation-webhook';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Makes a fresh database usable without any manual admin clicking: the
   * Vietnamese locale exists, the public role can read content and accept form
   * submissions, and publishing refreshes the site. All three are idempotent.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureLocales(strapi);
    await grantPublicPermissions(strapi);
    await registerRevalidationWebhook(strapi);
  },
};
