import type { Core } from '@strapi/strapi';

/**
 * Single types the site reads. These only expose `find` — there is no
 * `findOne` action on a single type, and granting one has it silently pruned
 * and re-created on every boot.
 */
const READABLE_SINGLE = [
  'site-setting',
  'home-page',
  'attend-page',
  'sponsors-page',
  'agenda-page',
  'exhibition-page',
  'location-page',
  'about-page',
] as const;

/** Collection types the site reads: list and detail. */
const READABLE_COLLECTION = ['session', 'exhibitor', 'sponsor', 'article'] as const;

/**
 * Form targets. The public role gets create only — never find/findOne, or
 * anyone could read every submission through the API.
 */
const SUBMITTABLE = ['contact-submission', 'sponsor-application'] as const;

/**
 * Grants the public role exactly the permissions the frontend needs.
 *
 * Runs on every boot so a fresh database (or a new environment) comes up
 * usable without anyone clicking through Settings -> Roles. It only ever adds
 * the permissions listed above; anything an admin has changed by hand on other
 * actions is left alone.
 */
export async function grantPublicPermissions(strapi: Core.Strapi): Promise<void> {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[bootstrap] no public role found, skipping permission setup');
    return;
  }

  const wanted = [
    ...READABLE_SINGLE.map((uid) => `api::${uid}.${uid}.find`),
    ...READABLE_COLLECTION.flatMap((uid) => [
      `api::${uid}.${uid}.find`,
      `api::${uid}.${uid}.findOne`,
    ]),
    ...SUBMITTABLE.map((uid) => `api::${uid}.${uid}.create`),
  ];

  const existing = await strapi.query('plugin::users-permissions.permission').findMany({
    where: { role: publicRole.id, action: { $in: wanted } },
  });
  const have = new Set(existing.map((permission) => permission.action));

  const missing = wanted.filter((action) => !have.has(action));
  if (missing.length === 0) return;

  await Promise.all(
    missing.map((action) =>
      strapi.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      }),
    ),
  );

  strapi.log.info(`[bootstrap] granted ${missing.length} public permission(s)`);
}
