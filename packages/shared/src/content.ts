/**
 * Shapes returned by the Strapi REST API. These mirror the schemas under
 * apps/cms/src/api — keep them in step when a schema changes.
 *
 * `pnpm --filter @sif/cms strapi ts:generate-types` produces the authoritative
 * server-side types under apps/cms/types/generated; these are the trimmed
 * versions the frontend actually consumes.
 */

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  mime: string;
}

/**
 * Strapi's `blocks` rich-text value. The concrete node shape belongs to
 * @strapi/blocks-react-renderer, which only the frontend depends on — this
 * package stays renderer-agnostic, so the render site casts.
 */
export type RichText = unknown[];

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

// ----------------------------------------------------------------- components

export interface Seo {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: StrapiMedia | null;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface AttendBenefit {
  title: string;
  description: string | null;
}

// --------------------------------------------------------------- single types

export interface SiteSettings extends StrapiEntry {
  siteName: string;
  logo: StrapiMedia | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: SocialLink[];
  footerText: string | null;
}

export interface HomePage extends StrapiEntry {
  heroTitle: string;
  heroSubtitle: string | null;
  eventDate: string | null;
  venue: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  /** Wide / desktop hero background. */
  heroMedia: StrapiMedia | null;
  /** Portrait crop for phones. Falls back to `heroMedia` when unset. */
  heroMediaMobile: StrapiMedia | null;
  stats: Stat[];
  aboutTeaser: string | null;
  seo: Seo | null;
}

export interface AttendPage extends StrapiEntry {
  heroTitle: string;
  heroBody: string | null;
  audience: RichText | null;
  benefits: AttendBenefit[];
  entryInfo: RichText | null;
  seo: Seo | null;
}

export interface SponsorsPage extends StrapiEntry {
  title: string | null;
  intro: string | null;
  applicationIntro: string | null;
  seo: Seo | null;
}

export interface AgendaPage extends StrapiEntry {
  title: string | null;
  intro: string | null;
  agendaPdf: StrapiMedia | null;
  seo: Seo | null;
}

export interface ExhibitionPage extends StrapiEntry {
  title: string | null;
  intro: string | null;
  floorPlan: StrapiMedia | null;
  floorPlanCaption: string | null;
  seo: Seo | null;
}

export interface LocationPage extends StrapiEntry {
  address: string;
  mapLatitude: number | null;
  mapLongitude: number | null;
  directions: RichText | null;
  parkingNotes: RichText | null;
  images: StrapiMedia[];
  seo: Seo | null;
}

export interface AboutPage extends StrapiEntry {
  story: RichText;
  mission: string | null;
  organizerName: string | null;
  organizerLogo: StrapiMedia | null;
  seo: Seo | null;
}

// ----------------------------------------------------------- collection types

export interface Session extends StrapiEntry {
  title: string;
  /** ISO date, e.g. "2026-10-02". */
  day: string;
  /** 24h time, e.g. "09:30:00.000". */
  startTime: string;
  endTime: string | null;
  speaker: string | null;
  track: string | null;
  location: string | null;
  description: string | null;
}

export interface Exhibitor extends StrapiEntry {
  companyName: string;
  logo: StrapiMedia | null;
  boothNumber: string | null;
  category: string | null;
  description: string | null;
  website: string | null;
}

export const sponsorTiers = ['platinum', 'gold', 'silver', 'bronze', 'partner'] as const;

export type SponsorTierName = (typeof sponsorTiers)[number];

export interface Sponsor extends StrapiEntry {
  name: string;
  logo: StrapiMedia | null;
  tier: SponsorTierName;
  link: string | null;
  order: number;
}

export interface Article extends StrapiEntry {
  title: string;
  slug: string;
  coverImage: StrapiMedia | null;
  date: string;
  excerpt: string | null;
  body: RichText;
  category: string | null;
  seo: Seo | null;
}

// ------------------------------------------------- form submissions (write-only)

export type SubmissionStatus = 'new' | 'in_progress' | 'closed';

export interface ContactSubmission extends StrapiEntry {
  name: string;
  email: string;
  message: string;
  status: SubmissionStatus;
}

export interface SponsorApplication extends StrapiEntry {
  company: string;
  contactName: string;
  email: string;
  phone: string | null;
  packageInterest: string | null;
  message: string | null;
  status: SubmissionStatus;
}
