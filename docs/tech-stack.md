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

## Typography

Be Vietnam Pro, loaded with both the `latin` and `vietnamese` subsets. The
Design tab requires full Vietnamese diacritic coverage; many popular display
fonts silently fall back on characters like `ế` and `ữ`, which looks broken
only on Vietnamese pages.

## Monorepo

pnpm workspaces + Turborepo. `packages/shared` holds the pieces both apps agree
on: the locale list, the 9-page sitemap, and TypeScript interfaces mirroring the
Strapi content types.

Once the Strapi schemas exist, `pnpm --filter @sif/cms strapi ts:generate-types`
produces authoritative server-side types. The hand-written interfaces in
`packages/shared/src/content.ts` are what the frontend consumes and must be kept
in step with the schemas.

## Deployment

Docker Compose on the client's own server: `web` (Next.js standalone), `cms`
(Strapi), `db` (Postgres). Both app ports bind to `127.0.0.1` — put nginx or
Caddy in front for TLS and routing. See `infra/docker-compose.yml`.

## Still open — blocks work

| # | Question | Blocks |
| - | -------- | ------ |
| 3 | Brand colours, logo, fonts | Real design. The palette in `globals.css` is a placeholder. |
| 6 | Server specs, OS, existing setup | Confirming Docker Compose is deployable there at all. |
| 7 | Who configures DNS | Go-live. |
| 8 | Email notifications on form submission | Whether the contact and sponsor forms need an SMTP provider. |
| 11 | Go-live date | Everything. The event is 2–3 October — roughly a month out. |

Question 6 is the sharpest: "hosting already covered by client" is in the
budget note, but with no specs we cannot confirm the server can run three
containers. If it turns out to be shared hosting with no Docker, the deployment
approach has to change.

## Not being built

Per the Scope tab: no login/registration, no ticketing, no advanced analytics,
no drag-and-drop page builder. Requests for any of these go through the
workbook's Change Log.

## Next steps

1. Create the Strapi content types from the CMS tab — 5 single types
   (Site Settings, Home Page, Location, About Us) and 6 collection types
   (Sessions, Exhibitors, Sponsors, News, Contact Submissions, Sponsor
   Applications). Enable i18n on every one with visitor-facing text.
2. Set public read permissions for the visitor-facing types, and public create
   (only) for the two form-submission types.
3. Fill in the page bodies marked `TODO(phase-2)` in `apps/web/src/app/[locale]`.
4. Build the contact and sponsor-application forms.
