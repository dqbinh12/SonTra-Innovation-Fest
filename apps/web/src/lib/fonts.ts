import { Be_Vietnam_Pro } from 'next/font/google';
// import localFont from 'next/font/local';

/**
 * SIF brand typography, per page 6 of SIF Brand Guidelines.pdf.
 *
 *   Primary   — FS Magistral: Light, Book, Medium, Bold, Extra Bold
 *   Secondary — SVN-Gilroy:   Regular, Medium, Semi Bold, Bold
 *
 * Both are licensed commercial faces. Neither is on Google Fonts and neither
 * can be redistributed in this repo, so until the client supplies webfont files
 * with a web licence, both roles fall back to Be Vietnam Pro — which is open,
 * and carries the complete Vietnamese diacritic set the Design tab requires.
 *
 * TO SWAP IN THE REAL FACES
 * -------------------------
 * 1. Put the .woff2 files in apps/web/src/fonts/.
 * 2. Uncomment the localFont import above and the two blocks below.
 * 3. Delete the fallback block and its export, and export instead:
 *      export const fontVariables = `${display.variable} ${sans.variable}`;
 * 4. Check Vietnamese rendering on /vi before shipping — see docs/brand.md.
 *    SVN-Gilroy is the Vietnamese cut of Gilroy and is safe. FS Magistral's
 *    Vietnamese coverage is unverified, and the specimen in the guidelines
 *    shows basic Latin only — no diacritics at all.
 */

// export const display = localFont({
//   variable: '--font-sif-display',
//   display: 'swap',
//   src: [
//     { path: '../fonts/FSMagistral-Light.woff2', weight: '300', style: 'normal' },
//     { path: '../fonts/FSMagistral-Book.woff2', weight: '400', style: 'normal' },
//     { path: '../fonts/FSMagistral-Medium.woff2', weight: '500', style: 'normal' },
//     { path: '../fonts/FSMagistral-Bold.woff2', weight: '700', style: 'normal' },
//     { path: '../fonts/FSMagistral-ExtraBold.woff2', weight: '800', style: 'normal' },
//   ],
// });

// export const sans = localFont({
//   variable: '--font-sif-sans',
//   display: 'swap',
//   src: [
//     { path: '../fonts/SVN-Gilroy-Regular.woff2', weight: '400', style: 'normal' },
//     { path: '../fonts/SVN-Gilroy-Medium.woff2', weight: '500', style: 'normal' },
//     { path: '../fonts/SVN-Gilroy-SemiBold.woff2', weight: '600', style: 'normal' },
//     { path: '../fonts/SVN-Gilroy-Bold.woff2', weight: '700', style: 'normal' },
//   ],
// });

// --- Fallback while the licensed files are missing -------------------------

// Weights span the union of both brand families (300–800) so nothing snaps to
// a synthesised weight when the real faces are dropped in.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sif-sans',
});

/**
 * Display and body currently resolve to the same face. `--font-sif-display`
 * is intentionally left unset so the CSS stack in globals.css falls through
 * to `--font-sif-sans`.
 */
export const fontVariables = beVietnamPro.variable;
