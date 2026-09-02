# Brand

Source: `SIF Brand Guidelines.pdf` (7 pages), supplied 2 September 2026.
This closes Decision Log #3 for colour and type. The **logo file is still
outstanding** — the guidelines show it as vector artwork inside the PDF, not as
a usable asset. Ask for SVG (and a PNG fallback) in light and dark versions.

## Colour

Defined once in `apps/web/src/app/globals.css`.

| Role | Hex | Used as |
| ---- | --- | ------- |
| Navy | `#001F4B` | Body text on light; page background on dark |
| Blue | `#006BE1` | Primary action on light; focus ring |
| Cyan | `#4EE2FF` | Accent on light; primary action on dark |
| Teal | `#0083A4` | Available as `brand-teal` |
| Mint | `#00FFBA` | Accent on dark |
| Violet | `#C845FF` | Available as `brand-violet` |
| Green | `#89FF9C` | Available as `brand-green` |
| Purple | `#7800BD` | Available as `brand-purple` |

All eight are exposed as Tailwind utilities (`bg-brand-navy`, `text-brand-cyan`,
and so on) for one-off use. Everything structural goes through the semantic
tokens instead, so a future palette change is one edit.

Two deliberate departures:

- **The greys are navy tints, not neutral greys.** `--muted`, `--secondary` and
  `--border` are `#001F4B` mixed into white at 4–14%. Neutral greys next to a
  strong navy read as dirty.
- **The error colour is not from the brand.** The palette has no error state,
  and every accent is too bright to read as a warning. `--destructive` is
  `#C81E1E` on light, `#FF6B6B` on dark.

Every foreground/background pair in both themes meets WCAG AA (4.5:1). The
weakest is white on `#006BE1` at 5.01:1, so **do not lighten the primary blue**
without re-checking.

## Typography

The guidelines specify **FS Magistral** (primary) and **SVN-Gilroy**
(secondary). Two problems, neither solvable in code:

1. **Both are commercial.** Neither is on Google Fonts, and neither can be
   committed to this repo without a web licence. The client has to supply
   `.woff2` files along with proof the licence covers web embedding.
2. **FS Magistral's Vietnamese coverage is unverified.** SVN-Gilroy is the
   Vietnamese cut of Gilroy and is safe. FS Magistral is a Fontsmith Latin
   family; if it lacks `ế ữ ợ ằ` and friends the browser will silently
   substitute mid-word on `/vi` pages. The Design tab makes full Vietnamese
   coverage a hard requirement, so this must be checked on real text before
   launch — not assumed.

Until the files arrive, both roles fall back to **Be Vietnam Pro**, which is
open-licensed and covers Vietnamese completely.

To swap them in: drop the files in `apps/web/src/fonts/` and follow the numbered
steps in `apps/web/src/lib/fonts.ts`. The CSS already splits display from body
(`--font-display` on `h1`–`h3`, `--font-sans` on everything else), so no
component changes are needed.

## Dark theme

A complete dark palette is defined but **not activated** — nothing sets the
`.dark` class, and the site ships light-only. The brand guidelines show light
layouts throughout, so switching to a dark ground is a design decision for the
client, not a default. The tokens are ready if they want it.

## Event facts

Taken from the guidelines and now seeded as CMS content:

| | |
| --- | --- |
| Dates | **2–4 October 2026** (three days) |
| Hours | 9:00 – 22:00 daily |
| Venue | 171–173 Trần Hưng Đạo, Sơn Trà, Đà Nẵng |
| Phone | +84 123 456 789 |
| Web | www.innovationfest.vn |
| Tagline | Innovate Today, Shape Tomorrow |

## Four things to confirm with the client

1. **The dates changed.** Decision Log #1 recorded "October 2nd and 3rd"; the
   guidelines say 2–4 October. The site, the agenda and the seed data now say
   three days. If two is correct, this needs reverting.
2. **The event name differs.** The guidelines' introduction calls it "The Son
   Tra **Experience** Festival"; the workbook, the domain and the logo all say
   "Son Tra **Innovation** Fest". The site uses Innovation Fest throughout.
3. **The phone number looks like a placeholder.** `+84 123 456 789` is
   sequential. It is seeded as-is, but should be checked before it goes public.
4. **Intel, Google, Tesla and Starlink are named in the guidelines** as
   companies the festival aims to connect. That is internal positioning
   language. It is deliberately **not** reproduced in the seeded About copy —
   on a public page it reads as a confirmed partnership, and the site would be
   claiming sponsorships that do not exist. If the client wants those names
   published, get that confirmed in writing first.

## Map coordinates

`16.0678, 108.2298` is an approximation of the Trần Hưng Đạo address. Confirm
the exact pin with the venue before go-live — the Location page links straight
into Google Maps with it.
