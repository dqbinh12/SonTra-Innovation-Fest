# CMS schema

Twelve content types under `apps/cms/src/api`, plus five components under
`apps/cms/src/components`. Everything visitor-facing is localised (EN + VI) and
draft/publish enabled.

## Single types

| Type | API path | Covers |
| ---- | -------- | ------ |
| Site Settings | `/api/site-setting` | Logo, contact info, social links, footer text |
| Home Page | `/api/home-page` | Hero, stats, about teaser |
| Attend Page | `/api/attend-page` | Why-attend hero, audience, benefits, entry info |
| Sponsors Page | `/api/sponsors-page` | Tier descriptions, application intro |
| Location | `/api/location-page` | Address, map coordinates, directions, parking |
| About Us | `/api/about-page` | Story, mission, organizer |

Single types expose `find` only — there is no `findOne` action on a single
type, and granting one has it pruned and re-created on every boot.

## Collection types

| Type | API path | Covers |
| ---- | -------- | ------ |
| Agenda Session | `/api/sessions` | Day, time, title, speaker, track, location |
| Exhibitor | `/api/exhibitors` | Company, logo, booth #, category, description |
| Sponsor | `/api/sponsors` | Name, logo, tier, link, order |
| News Article | `/api/articles` | Title, slug, cover, date, excerpt, body, category |
| Contact Submission | `/api/contact-submissions` | Contact form entries |
| Sponsor / Exhibitor Application | `/api/sponsor-applications` | Sponsor form entries |

## Components

`shared.seo` (metaTitle, metaDescription, ogImage), `shared.social-link`,
`shared.stat`, `sponsors.tier`, `attend.benefit`.

Components are **not** populated by default. A query that needs one has to name
it: `?populate[stats]=true`, `?populate[seo][populate]=ogImage`.

## Two types beyond the workbook

The workbook's CMS tab lists 10 content types, but its Content Structure tab
marks the Attend page and the Sponsors tier section as CMS-managed, and Scope
item 1.0 requires every info page to be editable in Strapi. **Attend Page** and
**Sponsors Page** close that gap. Worth confirming with the client so the CMS
tab and the Content Structure tab agree.

## What is localised, and what is not

Fields that are the same in both languages are marked non-localised so an
editor changes them once: logo and other media, contact details, booth numbers,
schedule dates and times, map coordinates, sponsor tier and order, article
publish date.

Everything a visitor reads is localised — including `slug`, so Vietnamese
articles get Vietnamese URLs.

## Permissions

`apps/cms/src/bootstrap/public-permissions.ts` grants the public role, on every
boot, exactly what the frontend needs: `find`/`findOne` on the readable types
and `create` — never read — on the two submission types. It is idempotent and
never touches permissions an admin has set by hand.

`apps/cms/src/bootstrap/locales.ts` creates the Vietnamese locale, without
which editors cannot enter VN content at all.

Both mean a fresh database comes up working with no manual admin clicking.

## Seed data

```bash
pnpm --filter @sif/cms seed
```

Fills every content type with EN and VI placeholder content — the Phase 2
deliverable calls for an MVP with sample content before the client enters the
real thing in Phase 3. Idempotent: it skips any type that already has an entry,
so it will never overwrite real content.

## Still to decide

- **Form spam.** The two submission endpoints accept unauthenticated POSTs with
  no rate limiting or captcha. Fine for a staging site, not for a public one.
  Needs a decision before go-live.
- **Email notifications.** Decision Log #8 is open. If forms need to notify
  someone, Strapi's email plugin needs an SMTP provider configured; the default
  `sendmail` provider will not work in a container.
- **Editor role.** The public role is scripted, but the client team's Editor
  role (content only, no schema access) still has to be created in the admin.
