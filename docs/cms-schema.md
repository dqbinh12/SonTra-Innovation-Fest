# CMS schema

Fourteen content types under `apps/cms/src/api`, plus four components under
`apps/cms/src/components`. Everything visitor-facing is localised (EN + VI) and
draft/publish enabled.

## Single types

| Type | API path | Covers |
| ---- | -------- | ------ |
| Site Settings | `/api/site-setting` | Logo, contact info, social links, footer text |
| Home Page | `/api/home-page` | Hero, stats, about teaser |
| Attend Page | `/api/attend-page` | Why-attend hero, audience, benefits, entry info |
| Sponsors Page | `/api/sponsors-page` | Tier descriptions, application intro |
| Agenda Page | `/api/agenda-page` | Intro copy and the downloadable agenda PDF |
| Exhibition Page | `/api/exhibition-page` | Floor plan graphic and intro copy |
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
`shared.stat`, `attend.benefit`.

Components are **not** populated by default. A query that needs one has to name
it: `?populate[stats]=true`, `?populate[seo][populate]=ogImage`.

## Four types beyond the workbook

The workbook's CMS tab lists 10 content types. Its Content Structure tab asks
for more, and Scope item 1.0 requires every info page to be editable in Strapi:

| Added | Because the Content Structure tab lists |
| ----- | --------------------------------------- |
| Attend Page | "Why Attend hero", "Audience / benefits", "Free entry info" |
| Sponsors Page | Intro copy and the application form section |
| Agenda Page | "Download agenda (optional) — PDF agenda file", CMS-managed media |
| Exhibition Page | "Floor plan / layout image", CMS-managed media |

Without these, four pages would have no editable copy and the agenda PDF and
floor plan would have nowhere to live. Worth confirming with the client so the
CMS tab and the Content Structure tab agree.

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

## Sponsor tiers, removed

The "Sponsor tiers" section (tier name, benefits, logos per tier) was dropped at
the client's request. Gone: the `sponsors.tier` component, the `tiers` field on
Sponsors Page, and the tier cards on the page.

The `tier` field on the **Sponsor collection** is kept — it is a separate,
confirmed row on the workbook's CMS tab ("Sponsors | Name, logo, tier, link").
It is recorded but no longer drives the page, which now shows one flat logo
wall ordered by the `order` field. Say the word if that field should go too.

## Hero media: two fields

Home Page has `heroMedia` (wide / desktop) and `heroMediaMobile` (portrait crop
for phones, optional). Both are non-localized and both accept an image or a
video. See [brand.md](brand.md) for the breakpoint, crop and contrast rules.

## Publishing: do it per locale

A field marked non-localized (`i18n.localized: false`) — the logo, hero media,
floor plan, agenda PDF, session day and time, exhibitor booth numbers — is
shared across EN and VI. Strapi syncs a change into **every locale's draft**
immediately.

It does **not** publish them. Publish acts on the locale you are looking at.

So attaching a hero image while viewing English and pressing Publish leaves the
Vietnamese *published* entry without it, and `/vi` keeps serving the old version
even though the admin panel shows the image on both. This is normal Strapi
behaviour, not a bug, and it bites hardest on exactly the fields an editor
assumes are shared.

**Rule: after editing any content type with draft & publish enabled, publish
both EN and VI.** Use the locale switcher at the top of the edit screen.

The single types without draft & publish — Site Settings — are unaffected; a
save there is immediately live in both locales.

## Still to decide

- **Form spam.** The forms carry a honeypot field (`website_url`) that drops
  naive bot submissions while reporting success, so the bot has nothing to tune
  against. That is a speed bump, not protection: the endpoints still accept
  unauthenticated POSTs with no rate limiting. A real answer — rate limiting at
  the proxy, or a captcha — is still needed before go-live.
- **Email notifications.** Decision Log #8 is open. If forms need to notify
  someone, Strapi's email plugin needs an SMTP provider configured; the default
  `sendmail` provider will not work in a container.
- **Editor role.** The public role is scripted, but the client team's Editor
  role (content only, no schema access) still has to be created in the admin.
