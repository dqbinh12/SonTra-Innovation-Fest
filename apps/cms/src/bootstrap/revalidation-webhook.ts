import type { Core, Modules } from '@strapi/strapi';

const WEBHOOK_NAME = 'Next.js ISR revalidation';

/**
 * Every content event that should refresh the public site. These are the six
 * `entry.*` events core allows; media uploads on their own do not need to fire,
 * because attaching a file to an entry is itself an entry.update.
 */
const EVENTS = [
  'entry.create',
  'entry.update',
  'entry.delete',
  'entry.publish',
  'entry.unpublish',
  'entry.draft-discard',
];

/**
 * Registers the webhook that tells Next.js to drop its cached pages.
 *
 * Without this, every environment needs someone to retype the URL and secret
 * under Settings → Webhooks, and a published change silently takes up to an
 * hour to appear — which looks exactly like the site being broken.
 *
 * Idempotent: creates the webhook if absent, repairs it if the URL, headers or
 * events have drifted, and leaves it alone otherwise. It also pushes the
 * webhook into the live runner, because the provider that loads webhooks into
 * the runner has already run by the time this executes — without that step the
 * webhook only starts firing after a restart.
 */
export async function registerRevalidationWebhook(strapi: Core.Strapi): Promise<void> {
  const siteUrl = process.env.SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!siteUrl || !secret) {
    strapi.log.warn(
      '[bootstrap] SITE_URL or REVALIDATE_SECRET not set — the site will not be ' +
        'revalidated on publish. See docs/cms-schema.md.',
    );
    return;
  }

  const store = strapi.get('webhookStore');
  const runner = strapi.get('webhookRunner');

  const desired = {
    name: WEBHOOK_NAME,
    url: new URL('/api/revalidate', siteUrl).toString(),
    headers: { 'x-revalidate-secret': secret },
    events: EVENTS,
    isEnabled: true,
  };

  const webhooks: Modules.WebhookStore.Webhook[] = await store.findWebhooks();
  const existing = webhooks.find((hook) => hook.name === WEBHOOK_NAME);

  if (!existing) {
    const created = await store.createWebhook(desired);
    runner.add(created);
    strapi.log.info(`[bootstrap] registered revalidation webhook -> ${desired.url}`);
    return;
  }

  const drifted =
    existing.url !== desired.url ||
    existing.headers?.['x-revalidate-secret'] !== secret ||
    existing.events.length !== EVENTS.length ||
    !EVENTS.every((event) => existing.events.includes(event));

  if (!drifted) return;

  // The secret or the site URL changed (a new environment, a rotated secret).
  const updated = await store.updateWebhook(existing.id, { ...desired, id: existing.id });
  runner.remove(existing);
  if (updated) runner.add(updated);
  strapi.log.info(`[bootstrap] updated revalidation webhook -> ${desired.url}`);
}
