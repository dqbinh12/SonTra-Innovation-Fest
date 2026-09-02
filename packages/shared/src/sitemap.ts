import type { Locale } from './locales';

/**
 * The 9 confirmed pages — see the "Sitemap & Pages" tab of the project workbook.
 * `key` is the i18n message key; `path` is the URL segment per locale.
 */
export interface PageDefinition {
  key: string;
  path: Record<Locale, string>;
  inPrimaryNav: boolean;
}

export const pages: PageDefinition[] = [
  { key: 'home', path: { en: '', vi: '' }, inPrimaryNav: false },
  { key: 'attend', path: { en: 'attend', vi: 'tham-du' }, inPrimaryNav: true },
  { key: 'agenda', path: { en: 'agenda', vi: 'chuong-trinh' }, inPrimaryNav: true },
  { key: 'exhibition', path: { en: 'exhibition', vi: 'khu-trung-bay' }, inPrimaryNav: true },
  { key: 'sponsors', path: { en: 'sponsors', vi: 'nha-tai-tro' }, inPrimaryNav: true },
  { key: 'location', path: { en: 'location', vi: 'dia-diem' }, inPrimaryNav: true },
  { key: 'news', path: { en: 'news', vi: 'tin-tuc' }, inPrimaryNav: true },
  { key: 'about', path: { en: 'about', vi: 've-chung-toi' }, inPrimaryNav: true },
  { key: 'contact', path: { en: 'contact', vi: 'lien-he' }, inPrimaryNav: true },
];

export const primaryNav = pages.filter((page) => page.inPrimaryNav);
