/**
 * Language scope — see the "Languages (i18n)" tab of the project workbook.
 * Default is English (Decision Log #4); Vietnamese is the second locale.
 */
export const locales = ['en', 'vi'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
