import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      // The Next.js frontend calls the REST API from the server, but the admin
      // preview and browser-side media requests need the site origin allowed.
      origin: [
        process.env.SITE_URL ?? 'http://localhost:3000',
        'http://localhost:3000',
      ].filter(Boolean),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
