# Brand

Source: `SIF Brand Guidelines.pdf` (7 pages), supplied 2 September 2026.
This closes Decision Log #3 for colour and type. See **Logo** below for what is
still needed there.

## Logo

`son-tra-innovation-2026.png` is uploaded to Site Settings and renders in the
header and footer of both locales. Two problems with the asset itself:

The current file is `Logo_Blue…png`, 360×254 — a **stacked lockup at 1.42:1**,
which is the constraint that drives the header size. A stacked mark gives each
of its three lines only a third of the height, so it needs real height to stay
legible: at 48px tall it rendered just 68px wide and the wordmark was mush.

The header bar is therefore `h-20` on phones and `h-28` (112px) from `sm` up,
with the logo at 64px and 80px. **A horizontal lockup would read at roughly
half that height**, letting the header shrink back to a more usual 80px — worth
asking for.

Two further notes:

1. The file is only 360×254. That is enough for the current render (80px tall,
   160px on a 2× display) but leaves no room to grow. Ask for a larger export,
   or an SVG.
2. An earlier version was white artwork on an opaque `#4EE2FF` rectangle with
   no transparency, which read as a cyan box on the white header. The blue
   version replaces it. Keep transparency in any future export.

**Ask the client for:**

- A **transparent** PNG or, better, **SVG** — no baked-in background.
- A **horizontal lockup** for the header (mark beside the words, roughly 4:1 or
  wider). The stacked version is a poster logo, not a navigation logo.
- A light-background and a dark-background version, if the marks differ.

Dropping better files into Site Settings needs no code change — the header
sizes to whatever is uploaded.

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

### Browser chrome colour

Set in the `viewport` export of `apps/web/src/app/[locale]/layout.tsx`:

| Meta | Value | Effect |
| ---- | ----- | ------ |
| `theme-color` | `#001F4B` | Status bar on Android Chrome, surround on iOS Safari |
| `color-scheme` | `light` | Stops mobile auto-dark modes inverting form controls |

Brand navy rather than the header's white, so the site reads as SIF the moment
it opens on a phone. That does mean a hard edge between the navy chrome and the
white header — switch `themeColor` to `'#ffffff'` if a seamless join is
preferred. It is a one-line change.

It is a **single value, not a light/dark pair**. The site renders light-only, so
a `prefers-color-scheme: dark` variant would tint the browser chrome for a page
that never goes dark. If dark mode is ever switched on (see below), add the pair
at the same time.

### App icons

`favicon.ico`, `icon.png` (512px) and `apple-icon.png` (180px) are the node-graph
mark from the logo, cropped square on the brand cyan, and live under
`apps/web/src/app/`. They replace the default Next.js triangle that shipped with
the scaffold.

Two notes for whoever regenerates them:

- They are **derived from the supplied PNG**, not from a master asset. Once a
  proper SVG logo arrives (see Logo above), regenerate them from it.
- Next's ICO decoder requires the PNGs embedded in a `.ico` to be **RGBA**. An
  RGB `.ico` throws `The PNG is not in RGBA format!` and returns a 500 on every
  page, not just a broken icon.

## Typography

Page 6 of the guidelines specifies two families and their weights:

| Role | Family | Weights |
| ---- | ------ | ------- |
| Primary / display | FS Magistral | Light 300, Book 400, Medium 500, Bold 700, Extra Bold 800 |
| Secondary / body | SVN-Gilroy | Regular 400, Medium 500, Semi Bold 600, Bold 700 |

`apps/web/src/lib/fonts.ts` carries a commented `localFont` block for each,
already listing exactly these weights and file names.

Two problems, neither solvable in code:

1. **Both are commercial.** Neither is on Google Fonts, and neither can be
   committed to this repo without a web licence. The client has to supply
   `.woff2` files along with proof the licence covers web embedding.
2. **FS Magistral's Vietnamese coverage looks doubtful.** SVN-Gilroy is the
   Vietnamese cut of Gilroy and is safe. FS Magistral is a Fontsmith Latin
   family, and the specimen on page 6 of the guidelines shows only basic Latin
   — `Aa`–`Zz`, digits and punctuation, **not one diacritic**. If it lacks
   `ế ữ ợ ằ` and friends, the browser silently substitutes mid-word, and only
   on `/vi` pages. The Design tab makes full Vietnamese coverage a hard
   requirement, so this must be tested on real Vietnamese text before launch.

   If it does fall short, the fix is to keep FS Magistral on Latin-only
   headings with a Vietnamese fallback behind it, or use SVN-Gilroy for both
   roles. Worth raising with whoever owns the brand before the licence is
   bought.

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

## Hero media

Two CMS fields on **Home Page**, both non-localized:

| Field | Used | Notes |
| ----- | ---- | ----- |
| `heroMedia` | 640px and up | The wide / desktop artwork |
| `heroMediaMobile` | below 640px | Portrait crop for phones. Optional — falls back to `heroMedia` |

Both accept an image or a video, per the Content Structure tab
("Hero banner … background image/video").

Images are art-directed through a single `<picture>` with two `<source>`
elements, built from `getImageProps()`. The browser downloads **only** the
source it picks — verified: at 375px only the phone file is fetched, at 1440px
only the wide one. Rendering two `<Image>` components and hiding one with CSS
would make phones pay for the desktop artwork.

Video cannot participate in `<picture>`, so if either field holds a video both
layers render and one is hidden by breakpoint. That is the one case where a
browser may touch both sources.

### Crop

| Viewport | object-position |
| -------- | --------------- |
| < 640px, with a mobile asset | `center` |
| < 640px, falling back to the wide asset | `left` |
| 640–1279px | `left` |
| 1280px and up | `right` |

The fallback uses `left` deliberately: on the supplied artwork that lands the
text over pale sky rather than tree shadow, needing a 0.66 scrim instead of
0.88 — the difference between a visible photo and a white smear. It also means
the phone fallback is nearly all pale sky, which is the argument for supplying
a real portrait crop.

### The scrim is load-bearing

The hero is a **navy band in both themes** and its copy is **white**, so the
scrim is mixed from `--color-brand-navy`, not `--background` — a light-mode
scrim would put white text on a white wash.

- Below `xl`: vertical, navy at 95% → 78% at 60% → 45% at the bottom.
- `xl` and up: horizontal, navy at 92% → 70% at 50% → 15% at the right.

These are lighter than the stops that protected the previous dark-grey
(#526785) copy, which measured **1.99:1** unprotected. White needs far less
cover, and at the old 0.92/0.93 the artwork rendered as a navy smear rather
than a photograph.

A horizontal fade only works once the text occupies the left third. At 768px
the text spans most of the viewport, and the horizontal gradient measured
1.99:1 there — which is why the switch is at `xl`, not `sm`.

Measured worst-case contrast, fresh load at each width. The headline is a
gradient (`.gradient-text-hero`, white → cyan → mint); it is measured against
**brand cyan**, its dimmest stop, and judged as large text (3:1).

| Width | Asset | Mode | Headline | Subtitle | Date pill |
| ----- | ----- | ---- | -------- | -------- | --------- |
| 390px | portrait | vertical | 6.59 | 7.22 | 12.19 |
| 768px | wide | vertical | 5.95 | 6.36 | 11.35 |
| 1280px | wide | horizontal | 4.12 | 6.80 | 8.52 |

The rest of the homepage was audited the same way — every section's worst-case
text clears its threshold, the lowest being 5.01:1 against a 4.5 requirement.

**Re-measure after changing either asset.** A darker photo fails silently — it
looks slightly low-contrast in review rather than broken. The method: draw the
image into a canvas with the element's real `object-position`, composite the
gradient alpha, and sample only the glyph boxes from
`Range.getClientRects()` — measuring the `<p>` bounding box overstates the
problem, because those blocks span the full container even where there is no
text.

If a new asset fails, raise the scrim stops in
`apps/web/src/components/hero-media.tsx` or drop the hero text to plain white.

Note the site renders **light-only** — the `.dark` tokens in `globals.css`
exist but nothing activates them (see the comment in `[locale]/layout.tsx`), so
there is no second theme to measure here.

### Asset notes

- Supply the phone crop in portrait, roughly 4:5 or 9:16. It is used below
  640px only.
- The current wide file is a 630KB PNG of a photograph. next/image re-encodes
  on serve, so visitors are fine, but JPEG or WebP would be a fraction of the
  size in the media library.
- `heroMedia` and `heroMediaMobile` are non-localized, so they are shared
  across EN and VI — but publishing is per locale. See docs/cms-schema.md.

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
