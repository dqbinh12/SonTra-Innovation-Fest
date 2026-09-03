import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  transfer: {
    remote: {
      // Lets `strapi transfer` push to / pull from this instance over the
      // admin websocket. Needs a TRANSFER_TOKEN_SALT and a transfer token
      // created in Settings > Transfer Tokens.
      enabled: env.bool('TRANSFER_REMOTE_ENABLED', true),
    },
  },
});

export default config;
