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
  /** Strapi's media caption. Shown under an image where the design has room. */
  caption: string | null;
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

export interface EventDay {
  date: string;
  startTime: string;
  endTime: string;
}

export interface AttendBenefit {
  title: string;
  description: string | null;
}

/** The four visitor types on the Attend page. Drives icon + fallback copy. */
export type AudienceSegmentKey = 'solo' | 'school' | 'company' | 'press';

export interface AttendAudienceSegment {
  key: AudienceSegmentKey;
  title: string;
  description: string | null;
  /** One bullet per line. */
  highlights: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
}

/** The role an organization plays in the festival, from the About page. */
export type OrganizationRole = 'organizer' | 'co-organizer' | 'coordinator';

export interface Organization {
  role: OrganizationRole;
  name: string;
  logo: StrapiMedia | null;
  link: string | null;
}

/**
 * The live countdown on the homepage hero and the Agenda page. Non-localized:
 * the opening is one moment in time, and the unit labels ship with the UI
 * translations rather than the CMS.
 */
export interface Countdown {
  enabled: boolean;
  /** ISO datetime, UTC. Null while the date is still to be decided. */
  targetDate: string | null;
  /** Optional heading override; falls back to the `countdown` messages. */
  label: string | null;
  /** Optional post-event message; falls back to the `countdown` messages. */
  completedMessage: string | null;
}

/** The categories a media-kit download can fall into; drives the card icon. */
export const mediaKitCategories = [
  'logo',
  'guidelines',
  'fact-sheet',
  'key-visual',
  'video',
  'other',
] as const;

export type MediaKitCategory = (typeof mediaKitCategories)[number];

/** One line of the press conference run sheet. */
export interface PressScheduleItem {
  /** Free text so a range ("09:00 - 09:20") stays one cell. */
  time: string | null;
  title: string;
  description: string | null;
}

export interface PressConference {
  title: string | null;
  summary: string | null;
  /** ISO datetime, UTC. Rendered in Asia/Ho_Chi_Minh. */
  startsAt: string | null;
  endsAt: string | null;
  venue: string | null;
  address: string | null;
  registrationUrl: string | null;
  registrationLabel: string | null;
  accreditation: RichText | null;
  schedule: PressScheduleItem[];
}

export interface PressRelease {
  title: string;
  /** ISO date, e.g. "2026-10-02". */
  date: string;
  summary: string | null;
  category: string | null;
  file: StrapiMedia | null;
  externalUrl: string | null;
}

export interface MediaKitItem {
  title: string;
  description: string | null;
  category: MediaKitCategory;
  file: StrapiMedia | null;
  externalUrl: string | null;
  /** Optional format/size hint, e.g. "ZIP - 24 MB". */
  fileLabel: string | null;
}

/**
 * An album of event photography. The files themselves live on Google Drive,
 * not in Strapi — a festival shoot is thousands of full-resolution frames, and
 * the picture desks that use them already work out of a shared Drive folder.
 */
export interface PhotoAlbum {
  title: string;
  date: string | null;
  description: string | null;
  driveUrl: string;
  coverImage: StrapiMedia | null;
  photoCount: number | null;
}

// --------------------------------------------------------------- single types

export interface SiteSettings extends StrapiEntry {
  siteName: string;
  logo: StrapiMedia | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: SocialLink[];
  footerText: string | null;
  countdown: Countdown | null;
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
  eventDays: EventDay[];
  admission: string | null;
  aboutTeaser: string | null;
  introBadge: string | null;
  introTitle: string | null;
  introBody: string | null;
  introYoutubeUrl: string | null;
  exploreTitle: string | null;
  exploreSubtitle: string | null;
  exploreAgenda: string | null;
  exploreExhibition: string | null;
  exploreLocation: string | null;
  exploreSponsors: string | null;
  seo: Seo | null;
}

export interface AttendPage extends StrapiEntry {
  heroTitle: string;
  heroBody: string | null;
  /** Wide / desktop hero background. */
  heroMedia: StrapiMedia | null;
  /** Portrait crop for phones. Falls back to `heroMedia` when unset. */
  heroMediaMobile: StrapiMedia | null;
  audience: RichText | null;
  audienceSegments: AttendAudienceSegment[];
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

export interface NewsPage extends StrapiEntry {
  title: string | null;
  intro: string | null;
  pulseLabel: string | null;
  eventDate: string | null;
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

/** How a visitor can reach the venue. Drives the icon on the transport card. */
export type TransportMode = 'car' | 'motorbike' | 'bus' | 'taxi' | 'walk' | 'bike' | 'air';

export interface TransportOption {
  mode: TransportMode;
  title: string;
  detail: string | null;
  /** Small label, e.g. "15 min from the city centre". */
  duration: string | null;
  /** Optional route or timetable link. */
  url: string | null;
}

export interface LocationPage extends StrapiEntry {
  heroTitle: string | null;
  heroSubtitle: string | null;
  /** The name of the site, shown above the address. */
  venueName: string | null;
  address: string;
  /** One line per day. */
  openingHours: string | null;
  mapEmbedHtml?: string | null;
  mapLatitude?: number | null;
  mapLongitude?: number | null;
  /** Bird's-eye site plan of the festival ground. */
  venueMap: StrapiMedia | null;
  venueMapCaption: string | null;
  transportOptions: TransportOption[];
  directions: RichText | null;
  parkingNotes: RichText | null;
  seo: Seo | null;
}

export interface AboutPage extends StrapiEntry {
  story: RichText;
  mission: string | null;
  overview?: Stat[] | null;
  organizations: Organization[];
  seo: Seo | null;
}

export interface MediaPage extends StrapiEntry {
  heroTitle: string | null;
  heroSubtitle: string | null;
  pressContactName: string | null;
  pressContactEmail: string | null;
  pressContactPhone: string | null;
  pressConference: PressConference | null;
  pressReleasesIntro: string | null;
  pressReleases: PressRelease[];
  mediaKitIntro: string | null;
  mediaKitItems: MediaKitItem[];
  mediaKitUsage: RichText | null;
  photosIntro: string | null;
  photoCredit: string | null;
  /** The main Drive folder holding everything. */
  photoDriveUrl: string | null;
  photoAlbums: PhotoAlbum[];
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
  /** Section / area grouping title, e.g. "Khai mạc Lễ hội SIF 2026". */
  sectionTitle?: string | null;
  /** Display order for section grouping (e.g. 1, 2, 3). */
  sectionOrder?: number | null;
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
  order?: number | null;
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
