# Tech stack decisions

Recorded 2 September 2026, at repo setup. These correspond to the workbook's
Decision Log; anything marked **open** still needs a client answer.

## Strapi cannot use MongoDB

The original proposal was "MongoDB Atlas for Strapi". This is not possible.
Strapi dropped MongoDB support in v4 (2021) and v5 is SQL-only — PostgreSQL,
MySQL/MariaDB, or SQLite. There is no supported connector and no community one
that keeps up with the query engine.

**Decision:** SQLite for local development, PostgreSQL 17 for staging and
production. This is Strapi's own default pattern and needs no code change to
switch — `apps/cms/config/database.ts` reads `DATABASE_CLIENT` and picks the
connection block. Local dev writes to `apps/cms/.tmp/data.db` (gitignored);
production runs the `db` service in `infra/docker-compose.yml`.

The practical consequence: content created locally does **not** travel to
staging. Use Strapi's transfer command, or treat the CMS schema as the artifact
and let the client enter content once in staging.

## Next.js 16, App Router

Server Components fetch from Strapi directly, so no API layer of our own and no
client-side loading states on content pages. Pages are statically generated and
refreshed on publish via the webhook at `apps/web/src/app/api/revalidate/route.ts`.

Note for anyone reading older Next.js docs: v16 renamed `middleware.ts` to
`proxy.ts`, and `revalidateTag` now takes a second cache-profile argument.

## i18n with next-intl

Locale-prefixed routes with translated pathnames, e.g. `/en/agenda` and
`/vi/chuong-trinh`. The mapping lives in `apps/web/src/i18n/routing.ts`; the
language switcher keeps the visitor on the same page across the switch.

Default locale is **English** per Decision Log #4, though the workbook flags
this as likely wrong for a local Da Nang event — worth re-confirming before
launch, since changing it later means redirect rules for indexed URLs.

UI strings live in `apps/web/messages/{en,vi}.json`. Content strings live in
Strapi, which handles locale variants per entry via its built-in i18n.

## Typography and colour

Both now come from the brand guidelines — see [brand.md](brand.md). The short
version: the palette is applied and contrast-checked, but the two brand
typefaces are commercial and not yet supplied, so the site falls back to Be
Vietnam Pro (which covers Vietnamese completely) until the files arrive.

## Monorepo

pnpm workspaces + Turborepo. `packages/shared` holds the pieces both apps agree
on: the locale list, the 9-page sitemap, and TypeScript interfaces mirroring the
Strapi content types.

Once the Strapi schemas exist, `pnpm --filter @sif/cms strapi ts:generate-types`
produces authoritative server-side types. The hand-written interfaces in
`packages/shared/src/content.ts` are what the frontend consumes and must be kept
in step with the schemas.

## Rich text

Long-form fields (article body, about story, attend copy, tier benefits) use
Strapi's `blocks` type rather than markdown, so the client edits in a normal
editor. `apps/web/src/components/rich-text.tsx` renders them.

That component is a client component by necessity: `BlocksRenderer` is one, and
the per-block render functions cannot be passed across the server/client
boundary as props. It pulls `mediaUrl` from `@/lib/media` rather than
`@/lib/strapi` so the fetch client — which reads the server-only API token —
stays out of the browser bundle.

## Revalidation on publish

`apps/cms/src/bootstrap/revalidation-webhook.ts` registers the Strapi webhook on
every boot, so no environment needs anyone to retype a URL and secret in the
admin panel. It is idempotent: it creates the webhook when absent, repairs it
when the URL, secret or event list has drifted, and leaves it alone otherwise.

Two things that are easy to get wrong here:

- The provider that loads webhooks into the live runner has already executed by
  the time app bootstrap runs, so a newly created webhook must also be pushed
  into `webhookRunner` by hand. Without that it only starts firing after a
  restart.
- The route calls `revalidateTag(tag, { expire: 0 })`, not the `'max'` profile
  Next recommends. `'max'` is stale-while-revalidate: the first request after a
  publish still gets the old page. For an editor who publishes and reloads,
  that looks like the CMS being ignored. `expire: 0` costs one blocking request
  per publish and removes the confusion.

## Images

Media comes from Strapi through `next/image`, with `remotePatterns` derived from
`NEXT_PUBLIC_STRAPI_URL`.

Next 16 added SSRF protection that refuses to optimize images whose hostname
resolves to a private IP. In development Strapi is on localhost, which trips it,
so `dangerouslyAllowLocalIP` is enabled **for development only**. The same block
applies in production if `NEXT_PUBLIC_STRAPI_URL` is ever set to an internal
hostname — it must be the public, browser-reachable URL.

## Deployment

Docker Compose on the client's own server: `web` (Next.js standalone), `cms`
(Strapi), `db` (Postgres). Both app ports bind to `127.0.0.1` — put nginx or
Caddy in front for TLS and routing. See `infra/docker-compose.yml`.

## Still open — blocks work

| # | Question | Blocks |
| - | -------- | ------ |
| 3 | Logo file and licensed webfonts | Colour is done; see [brand.md](brand.md). |
| 6 | Server specs, OS, existing setup | Confirming Docker Compose is deployable there at all. |
| 7 | Who configures DNS | Go-live. |
| 8 | Email notifications on form submission | Whether the contact and sponsor forms need an SMTP provider. |
| 11 | Go-live date | Everything. The event is 2–4 October — roughly a month out. |

Question 6 is the sharpest: "hosting already covered by client" is in the
budget note, but with no specs we cannot confirm the server can run three
containers. If it turns out to be shared hosting with no Docker, the deployment
approach has to change.

## Not being built

Per the Scope tab: no login/registration, no ticketing, no advanced analytics,
no drag-and-drop page builder. Requests for any of these go through the
workbook's Change Log.

## Forms

Contact and Sponsor/Exhibitor applications post through React server actions in
`apps/web/src/lib/actions.ts`, validated with zod and written to the two
submission content types.

Two details worth knowing before editing that file:

- A `'use server'` module may only export **async functions**. The shared
  `FormState` type and `initialFormState` constant live in
  `apps/web/src/lib/form-state.ts` for that reason — exporting the constant
  from the actions module is a runtime error, not a lint warning.
- The actions return error *keys*, not sentences. A server action does not know
  the request locale, so the form components translate them through the
  `form.*` messages.

## Next steps

1. Decide on form spam protection and email notifications (Decision Log #8).
2. Create the Editor role for the client team in the Strapi admin.
3. Swap in the licensed webfonts and the logo when they arrive (brand.md).
4. Client enters real content — Phase 3.
