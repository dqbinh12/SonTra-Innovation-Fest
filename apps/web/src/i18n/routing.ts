import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from '@sif/shared';

/**
 * Localised URLs. The keys are the internal (English) pathnames used in the
 * app directory; the values are what the visitor sees per locale.
 * See the "Sitemap & Pages" tab of the project workbook.
 */
export const pathnames = {
  '/': '/',
  '/attend': { en: '/attend', vi: '/tham-du' },
  '/agenda': { en: '/agenda', vi: '/chuong-trinh' },
  '/exhibition': { en: '/exhibition', vi: '/khu-trung-bay' },
  '/sponsors': { en: '/sponsors', vi: '/nha-tai-tro' },
  '/location': { en: '/location', vi: '/dia-diem' },
  '/news': { en: '/news', vi: '/tin-tuc' },
  '/news/[slug]': { en: '/news/[slug]', vi: '/tin-tuc/[slug]' },
  '/about': { en: '/about', vi: '/ve-chung-toi' },
  '/contact': { en: '/contact', vi: '/lien-he' },
} as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames,
});
