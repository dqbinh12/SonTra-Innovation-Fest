/**
 * Shapes returned by the Strapi REST API, mirroring the content types listed in
 * the "CMS (Strapi)" tab of the project workbook.
 *
 * These are hand-written for the frontend to consume. Once the Strapi schemas
 * are built, `pnpm --filter @sif/cms strapi ts:generate-types` produces the
 * authoritative server-side types under apps/cms/types/generated.
 */

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  mime: string;
}

export interface StrapiEntry {
  id: number;
  documentId: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/** Single type — global settings, one entry. */
export interface SiteSettings extends StrapiEntry {
  siteName: string;
  logo: StrapiMedia | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: { platform: string; url: string }[];
  footerText: string | null;
}

/** Single type. */
export interface HomePage extends StrapiEntry {
  heroTitle: string;
  heroSubtitle: string | null;
  eventDate: string | null;
  venue: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  heroMedia: StrapiMedia | null;
  stats: { label: string; value: string }[];
  aboutTeaser: string | null;
}

/** Collection type — sortable by date/time. */
export interface Session extends StrapiEntry {
  title: string;
  day: string;
  startTime: string;
  endTime: string | null;
  speaker: string | null;
  track: string | null;
  location: string | null;
  description: string | null;
}

/** Collection type. */
export interface Exhibitor extends StrapiEntry {
  companyName: string;
  logo: StrapiMedia | null;
  boothNumber: string | null;
  category: string | null;
  description: string | null;
  website: string | null;
}

/** Collection type. */
export interface Sponsor extends StrapiEntry {
  name: string;
  logo: StrapiMedia | null;
  tier: string;
  link: string | null;
}

/** Collection type — News / Articles. */
export interface Article extends StrapiEntry {
  title: string;
  slug: string;
  coverImage: StrapiMedia | null;
  date: string;
  excerpt: string | null;
  body: string;
  category: string | null;
}

/** Single type. */
export interface LocationPage extends StrapiEntry {
  address: string;
  mapLatitude: number | null;
  mapLongitude: number | null;
  directions: string | null;
  parkingNotes: string | null;
  images: StrapiMedia[];
}

/** Single type. */
export interface AboutPage extends StrapiEntry {
  story: string;
  mission: string | null;
  organizerName: string | null;
  organizerLogo: StrapiMedia | null;
}

/** Collection type — populated by public form submissions, client views only. */
export interface ContactSubmission extends StrapiEntry {
  name: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'closed';
}

/** Collection type — populated by public form submissions, client views only. */
export interface SponsorApplication extends StrapiEntry {
  company: string;
  contactName: string;
  email: string;
  phone: string | null;
  packageInterest: string | null;
  message: string | null;
  status: 'new' | 'in_progress' | 'closed';
}
