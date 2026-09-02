import type { Core } from '@strapi/strapi';

/**
 * Locales the site ships in — see the "Languages (i18n)" tab of the project
 * workbook. English is the default (Decision Log #4) and Strapi creates it on
 * first boot; Vietnamese has to be added or editors cannot enter VN content.
 */
const REQUIRED_LOCALES = [{ code: 'vi', name: 'Vietnamese (vi)' }] as const;

export async function ensureLocales(strapi: Core.Strapi): Promise<void> {
  const service = strapi.plugin('i18n')?.service('locales');

  if (!service) {
    strapi.log.warn('[bootstrap] i18n plugin unavailable, skipping locale setup');
    return;
  }

  for (const locale of REQUIRED_LOCALES) {
    const existing = await service.findByCode(locale.code);
    if (existing) continue;

    await service.create({ code: locale.code, name: locale.name });
    strapi.log.info(`[bootstrap] created locale "${locale.code}"`);
  }
}
